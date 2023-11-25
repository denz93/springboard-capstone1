from apiflask import Schema, fields, validators
from marshmallow import post_load
from models.user import User

class UserSchema(Schema):
  id = fields.String()
  email = fields.String()
  first_name = fields.String()
  last_name = fields.String()
  created_at = fields.DateTime(format='timestamp_ms')

  @post_load
  def make_user(self, data, **kw) -> User:
    return User(**data)

class UpdateUserInputSchema(Schema):
  first_name = fields.String(validate=validators.Length(max=100))
  last_name = fields.String(validate=validators.Length(max=100))

class GetUserOutputSchema(Schema):
  user = fields.Nested(UserSchema)
  token = fields.String()
