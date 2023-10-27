from functools import wraps
from flask import session, g
from apiflask import HTTPError, APIBlueprint
from sqlalchemy import or_
from db import db
from errors import InvalidFirebaseTokenError, UnauthorizedError, UserAlreadyExistsError, UserNotRegisteredError
from models import User
from firebase_admin import auth
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError, CertificateFetchError
UserId = str

CURRENT_USER_ID = 'current_user_id'

def auth_protect(f):
  """
    Protect a route with authentication

    Should be used as decorator
  """
  @wraps(f)
  def wrapper(*args, **kwargs):
    if CURRENT_USER_ID not in session:
      raise UnauthorizedError
    return f(*args, **kwargs)
  return wrapper
def load_user():
  """
    Load current user from session

    Should be registered by `Flask` app

    :return: `User`
  """
  if CURRENT_USER_ID in session:
    user_id = session[CURRENT_USER_ID]
    user = db.session.get(User, str(user_id))
    if user:
      g.user = user

def get_current_user() -> User:
  """
    Get current user from `Flask` session
  """
  if not hasattr(g, 'user'):
    raise UnauthorizedError
  return g.user

def login(user_id: str):
  session[CURRENT_USER_ID] = user_id

def logout():
  session.pop(CURRENT_USER_ID, None)


def register(json_data: dict[str, str]):
  firebase_uid = verify_firebase_idtoken(json_data['firebase_id_token'])
  user = db.session.query(User)\
          .filter(
            or_(
              User.id == firebase_uid,
              User.email == json_data['email']
            )
          )\
          .first()
  if user:
    raise UserAlreadyExistsError
  user = User(
    email = json_data['email'],
    first_name = json_data['first_name'],
    last_name = json_data['last_name'],
    id = firebase_uid,
  )
  db.session.add(user)
  db.session.commit()
  return user

def signin(firebase_id_token: str):
  firebase_uid = verify_firebase_idtoken(firebase_id_token)
  user = db.session.query(User)\
          .filter(
            User.id == firebase_uid
          ).first()
  if not user:
    raise UserNotRegisteredError
  
  return user

def verify_firebase_idtoken(firebase_idtoken: str) -> UserId:
  try:
    decoded_token: dict[str, str] = auth.verify_id_token(firebase_idtoken)
  except (ValueError, InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError, CertificateFetchError):
    raise InvalidFirebaseTokenError
  
  firebase_uid:str = decoded_token['uid']
  return firebase_uid
