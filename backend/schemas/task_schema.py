from apiflask import Schema, fields, validators, PaginationSchema
from flask_sqlalchemy.pagination import Pagination

class TaskSchema(Schema):
  id = fields.Integer()
  title = fields.String()
  description = fields.String()
  created_at = fields.DateTime()
  is_completed = fields.Boolean()

class GetTaskOutputSchema(Schema):
  task = fields.Nested(TaskSchema)
  
class TaskListSchema(Schema):
  tasks = fields.List(fields.Nested(TaskSchema))
  pagination = fields.Nested(PaginationSchema)

class UpdateTaskCompletionInputSchema(Schema):
  is_completed = fields.Boolean(required=True)

class UpdateTaskInputSchema(Schema):
  title = fields.String(validate=validators.Length(max=100))
  description = fields.String(validate=validators.Length(max=1000))

class CreateTaskInputSchema(Schema):
  title = fields.String(required=True, validate=validators.Length(min=1, max=100))
  description = fields.String(required=False, validate=validators.Length(min=1, max=1000))