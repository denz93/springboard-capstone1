from apiflask import APIBlueprint, Schema, fields, pagination_builder,validators
from db import db
from models.goal import Goal
from schemas import QuerySchema
from schemas.task_schema import CreateTaskInputSchema, UpdateTaskCompletionInputSchema, TaskListSchema, GetTaskOutputSchema, TaskSchema, UpdateTaskInputSchema
from services import auth_service, task_service
from errors import ResourceNotFoundError
from models import Task
from role import RoleGuard

bp = task_bp = APIBlueprint(
  'tasks',
  __name__,
  url_prefix='/tasks',
)

@bp.get('/<int:task_id>')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Task, 'task_id')
@bp.output(GetTaskOutputSchema)
def get_task(task_id: int):
  task = task_service.get_task(task_id)
  return {'task': task}

@bp.get('/')
@auth_service.auth_protect
@bp.input(QuerySchema, location='query')
@bp.output(TaskListSchema)
def get_tasks(query_data: dict):
  pagination = task_service.get_tasks(query_data)
  return {
    'tasks': pagination.items, 
    'pagination': pagination_builder(pagination) # type: ignore
  }

@bp.patch('/<int:task_id>/completion')
@RoleGuard.patrol_acl(Task, 'task_id')
@auth_service.auth_protect
@bp.input(UpdateTaskCompletionInputSchema, location='json')
@bp.output(GetTaskOutputSchema)
def update_completion(task_id: int, json_data):
  task = task_service.update_completion(task_id, json_data['is_completed'])
  return {'task': task}

@bp.patch('/<int:task_id>/update')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Task, 'task_id')
@bp.input(UpdateTaskInputSchema, location='json')
@bp.output(GetTaskOutputSchema)
def update_task(task_id: int, json_data: dict):
  task = task_service.update_task(task_id, json_data)
  return {'task': task}

@bp.delete('/<int:task_id>')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Task, 'task_id')
@bp.output(GetTaskOutputSchema)
def delete_task(task_id: int):
  task = task_service.delete_task(task_id)
  return {'task': task}

@bp.post('/<int:goal_id>')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Goal, 'goal_id')
@bp.input(CreateTaskInputSchema, location='json')
@bp.output(GetTaskOutputSchema)
def create_task(goal_id: int, json_data: dict):
  json_data['goal_id'] = goal_id
  task = task_service.create_task(json_data)
  return {'task': task}

