from apiflask import Schema, fields, validators
from schemas.goal_schema import * 
from schemas.task_schema import *
from schemas.user_schema import *
from schemas.category_schema import *

class QuerySchema(Schema):
  page = fields.Integer(load_default=1)
  per_page = fields.Integer(load_default=20, validate=validators.Range(max=30))