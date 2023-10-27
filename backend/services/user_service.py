from errors import UserNotFoundError
from models import User 
from db import db
from schemas.user_schema import UserSchema, UpdateUserInputSchema 

def create_user(user_dict: dict) -> User:
  user = UserSchema(partial=True, unknown='exclude').make_user(user_dict)
  db.session.add(user)
  db.session.commit()
  return user  

def update_user(user_id: str, dict_data: dict) -> User:
  data:dict = UpdateUserInputSchema().load(
    dict_data, many=False, partial=True, unknown='exclude'
  ) #type: ignore
  db.session.query(User)\
    .filter(
      User.id == user_id
    )\
    .update(data)
  db.session.commit()
  return get_user(user_id)

def get_user(user_id: str) -> User:
  user = db.session.get(User, user_id)
  if user is None:
    raise UserNotFoundError
  return user 