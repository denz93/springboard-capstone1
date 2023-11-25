import typing
from apiflask import Schema, fields, validators, PaginationSchema
from apiflask.validators import OneOf
from schemas.category_schema import CategorySchema

from db import db 
from models import Category
from sqlalchemy import select
from logging import getLogger
logger = getLogger()

class CategoryExistValidator(OneOf):
  def __init__(self, choices: typing.Iterable = [], labels: typing.Iterable[str] | None = None, *, error: str | None = None):
    super().__init__(choices, labels, error=error)

  def __call__(self, value: typing.Any) -> typing.Any:
    self.choices = db.session.scalars(select(Category.id)).all()
    self.choices_text = ", ".join(str(choice) for choice in self.choices)

    return super().__call__(value)
  
class CreateGoalInputSchema(Schema):
  title = fields.String(required=True, validate=validators.Length(min=1, max=100))
  description = fields.String(required=False, validate=validators.Length(min=1, max=1000))
  start_date = fields.DateTime(required=True, format='timestamp_ms')
  end_date = fields.DateTime(required=True, format='timestamp_ms')
  category_id = fields.Integer(required=True, validate=CategoryExistValidator())

class UpdateGoalInputSchema(Schema):
  title = fields.String(validate=validators.Length(max=100))
  description = fields.String(validate=validators.Length(max=1000))
  start_date = fields.DateTime(format='timestamp_ms')
  end_date = fields.DateTime(format='timestamp_ms')
  category_id = fields.Integer(validate=CategoryExistValidator())

class GoalSchema(Schema):
  id = fields.Integer()
  title = fields.String()
  description = fields.String()
  created_at = fields.DateTime(format='timestamp_ms')
  is_completed = fields.Boolean()
  start_date = fields.DateTime(format='timestamp_ms')
  end_date = fields.DateTime(format='timestamp_ms')
  category = fields.Nested(CategorySchema)

class GetGoalOutputSchema(Schema):
  goal = fields.Nested(GoalSchema)
  
class GoalListPaginationSchema(Schema):
  goals = fields.List(fields.Nested(GoalSchema))
  pagination = fields.Nested(PaginationSchema)

class GoalQuery(Schema):
  page = fields.Integer(required=False, load_default=1) 
  per_page = fields.Integer(requred=False, load_default=12)