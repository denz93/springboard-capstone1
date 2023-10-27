from db import db
from errors import GoalNotFoundError
from models import Goal 
from flask_sqlalchemy.pagination import Pagination

def create_goal(goal_dict: dict, user_id: str):
  goal = Goal(**goal_dict, user_id=user_id)
  db.session.add(goal)
  db.session.commit()
  return goal

def get_goal(goal_id: int):
  goal = db.session.get(Goal, goal_id)
  if goal is None:
    raise GoalNotFoundError
  return goal

def get_goals(query_data: dict, user_id: str) -> Pagination:
  query = db.session.query(Goal)\
    .filter(
      Goal.user_id == user_id,
      Goal.soft_deleted == False)\
    .order_by(Goal.created_at.desc())
  pagination = db.paginate(query.statement, **query_data) # type: ignore
  return pagination

def update_goal(goal_id: int, goal_dict: dict):
  goal = db.session.get(Goal, goal_id)
  if goal is None:
    raise GoalNotFoundError
  for key, value in goal_dict.items():
    setattr(goal, key, value)
  db.session.commit()
  return goal

def delete_goal(goal_id: int):
  goal = db.session.get(Goal, goal_id)
  if goal is None:
    raise GoalNotFoundError
  goal.soft_deleted = True
  db.session.commit()
  return goal
  

def get_tasks(goal_id: int):
  goal = db.session.query(Goal).filter(Goal.id == goal_id, Goal.soft_deleted == False).first()
  if goal is None:
    raise GoalNotFoundError
  
  return goal.tasks