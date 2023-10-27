from apiflask import Schema, fields, validators, PaginationSchema
from schemas import GoalSchema

from schemas.task_schema import TaskSchema

class PromptMessageSchema(Schema):
  role = fields.String(required=True, allow_none=False)
  name = fields.String(required=False, allow_none=False)
  content = fields.String(required=True, allow_none=False)

class PromptSchema(Schema):
  id = fields.Integer(strict=True)
  messages = fields.List(fields.Nested(PromptMessageSchema))
  response = fields.String()
  created_at = fields.DateTime(format='timestamp')

class GetPromptResponseSchema(Schema):
  prompt = fields.Nested(PromptSchema)

class GetPromptByMessageInputSchema(Schema):
  messages = fields.List(fields.Nested(PromptMessageSchema))

class PromptListResponseSchema(Schema):
  prompts = fields.List(fields.Nested(PromptSchema))
  pagination = fields.Nested(PaginationSchema)

class CreatePromptInputSchema(Schema):
  messages = fields.List(fields.Nested(PromptMessageSchema))

class SuggestTasksInputSchema(Schema):
  goal_id = fields.Integer(required=True, strict=True)

class SuggestTasksOutputSchema(Schema):
  suggested_tasks = fields.List(fields.Nested(TaskSchema(only=['title'], partial=True)))

class DeletePromptOutputSchema(Schema):
  status = fields.String()

class SuggestGoalInputSchema(Schema):
  partial_title = fields.String(required=True, validate=validators.Length(min=1, max=100))

class SuggestGoalOutputSchema(Schema):
  goal = fields.Nested(GoalSchema(only=['title', 'description'], partial=True))