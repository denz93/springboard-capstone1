from functools import wraps
from flask import session, g, request
from apiflask import HTTPError, APIBlueprint
from sqlalchemy import or_
from db import db
from errors import InvalidFirebaseTokenError, UnauthorizedError, UserAlreadyExistsError, UserNotRegisteredError
from models import User
from firebase_admin import auth
from firebase_admin.auth import UserRecord, InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError, CertificateFetchError
from cryptography.fernet import Fernet, InvalidToken
import json, os, datetime
import logging

logger = logging.getLogger()
UserId = str

CURRENT_USER_ID = 'current_user_id'
AUTH_HEADER_KEY = 'X-Auth-Token'
# Should be set during app initialization
__PRIVATE_KEY__ = None

def init(private_key: str):
  global __PRIVATE_KEY__
  __PRIVATE_KEY__ = private_key

def pack_token(user_id: UserId):
  token_dict = {
    'user_id': user_id,
    'created_at': datetime.datetime.utcnow().timestamp(),
    'nonce': os.urandom(16).hex()
  }
  token_str = json.dumps(token_dict, separators=(',', ':'))
  return encrypt_token(token_str)

def unpack_token(token: str) -> UserId: 
  decrypted_token = decrypt_token(token)
  token_dict = json.loads(decrypted_token)
  return token_dict['user_id']

def decrypt_token(token: str):
  if not __PRIVATE_KEY__:
    raise Exception('[Auth service] Private key is not set')
  
  f = Fernet(__PRIVATE_KEY__)
  return f.decrypt(token.encode()).decode()

def encrypt_token(token: str):
  if not __PRIVATE_KEY__:
    raise Exception('[Auth service] Private key is not set')
  
  f = Fernet(__PRIVATE_KEY__)
  return f.encrypt(token.encode()).decode()

def auth_protect(f):
  """
    Protect a route with authentication

    Should be used as decorator
  """
  @wraps(f)
  def wrapper(*args, **kwargs):
    token = request.headers.get(AUTH_HEADER_KEY)
    if not token:
      raise UnauthorizedError
    try:
      user_id = unpack_token(token)
      g.user_id = user_id
      return f(*args, **kwargs)
    except InvalidToken as e:
      logger.error(e)
      raise UnauthorizedError
  return wrapper
def load_user():
  """
    Load current user from auth key

    Should be registered by `Flask` app

    :return: `User`
  """
  try:
    user_id = unpack_token(request.headers.get(AUTH_HEADER_KEY, ''))

    if user_id:
      user = db.session.get(User, str(user_id))
      if user:
        g.user = user
  except:
    pass

def get_current_user() -> User:
  """
    Get current user from `Flask` session
  """
  if not hasattr(g, 'user'):
    raise UnauthorizedError
  return g.user

def login(user_id: str):
  return pack_token(user_id)

def logout():
  pass


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

def get_user_auth_provider(email: str) -> str | None:
  try:
    user_record:UserRecord = auth.get_user_by_email(email)
    return user_record.provider_data[0].provider_id
  except:
    return None