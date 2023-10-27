from apiflask.blueprint import APIBlueprint
from apiflask import fields, pagination_builder
from schemas.goal_schema import CreateGoalInputSchema, GoalQuery, GetGoalOutputSchema, GoalSchema, UpdateGoalInputSchema, GoalListPaginationSchema
from services import auth_service
from db import db
from models.goal import Goal 
from apis.task import TaskListSchema
from role import RoleGuard
from services import goal_service
from logging import getLogger
logger = getLogger()

bp = goal_bp = APIBlueprint(
  'goals',
  __name__,
  url_prefix='/goals',
)


@bp.get('/')
@auth_service.auth_protect
@bp.input(GoalQuery, location='query')
@bp.output(GoalListPaginationSchema)
def get_goals(query_data: dict):
  user = auth_service.get_current_user()
  pagination = goal_service.get_goals(query_data, user.id)
 
  return {
    'goals': pagination.items,
    'pagination': pagination_builder(pagination) # type: ignore
  }

@bp.get('/<int:goal_id>')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Goal, 'goal_id')
@bp.output(GetGoalOutputSchema)
def get_goal(goal_id: int):
  goal = goal_service.get_goal(goal_id)
  return {
    'goal': goal
  }

@bp.post('/')
@auth_service.auth_protect
@bp.input(CreateGoalInputSchema, location='json')
@bp.output(GetGoalOutputSchema, status_code = 201)
def create_goal(json_data: dict):
  goal = goal_service.create_goal(json_data, auth_service.get_current_user().id)
  return {'goal': goal}

@bp.patch('/<int:goal_id>')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Goal, 'goal_id')
@bp.input(UpdateGoalInputSchema, location='json')
@bp.output(GetGoalOutputSchema)
def update_goal(goal_id: int, json_data):
  logger.info('Pass here')
  goal = goal_service.update_goal(goal_id, json_data)
  return {'goal': goal}

@bp.delete('/<int:goal_id>')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Goal, 'goal_id')
@bp.output(GetGoalOutputSchema)
def delete_goal(goal_id: int):
  goal = goal_service.delete_goal(goal_id)
  return {'goal': goal}

@bp.get('/<int:goal_id>/tasks')
@auth_service.auth_protect
@RoleGuard.patrol_acl(Goal, 'goal_id')
@bp.output(TaskListSchema)
def get_tasks(goal_id: int):
  tasks = goal_service.get_tasks(goal_id)
  return {'tasks': tasks}
