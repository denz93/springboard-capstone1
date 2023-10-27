from services import auth_service
from db import db
from apiflask import Schema, fields, validators
from apiflask.blueprint import APIBlueprint
from errors import ForbiddenError
from models import User
from typing import Dict

from schemas.user_schema import GetUserOutputSchema, UserSchema, UpdateUserInputSchema
from services import user_service
bp = user_bp = APIBlueprint(
  'users',
  __name__,
  url_prefix='/users',
)


@bp.get('/<user_id>')
@auth_service.auth_protect
@bp.output(GetUserOutputSchema)
def get_user(user_id: str):
  user = auth_service.get_current_user()
  print(user.id)
  if user_id != user.id:
    raise ForbiddenError
  user = user_service.get_user(user_id)
  return {'user': user}

@bp.patch('/<user_id>')
@auth_service.auth_protect
@bp.input(UpdateUserInputSchema, location='json')
@bp.output(GetUserOutputSchema)
def update_user(user_id: str, json_data: dict[str, str]):
  user = auth_service.get_current_user()
  if user_id != user.id:
    raise ForbiddenError
  user = user_service.update_user(user_id, json_data)
  return {'user': user}
