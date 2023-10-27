from models import Task
from errors import TaskNotFoundError, UnauthorizedError
from models import User, Goal
from services import auth_service
from db import db 
from flask_sqlalchemy.pagination import Pagination

def get_task(task_id: int):
  user = auth_service.get_current_user()
  if user is None: 
    raise UnauthorizedError
  
  task = db.session.query(Task)\
    .filter(
      Task.id == task_id, 
      Task.goal_id.in_(
        list(map(lambda x: x.id, user.goals))
      )
    )\
    .first()
  return task

def get_tasks(query_data: dict) -> Pagination:
  user = auth_service.get_current_user()
  if user is None: 
    raise UnauthorizedError
  
  pagination = db.paginate(
    db.session.query(Task)\
    .filter(Task.goal_id.in_(list(map(lambda x: x.id, user.goals)))), # type: ignore
    **query_data
  ) 
  return pagination

def update_task(task_id, task_dict: dict):
  task = db.session.get(Task, task_id)
  if task is None:
    raise TaskNotFoundError
  for key, value in task_dict.items():
    setattr(task, key, value)
  db.session.commit()
  return task

def create_task(task_dict: dict):
  task = Task(**task_dict)
  db.session.add(task)
  db.session.commit()
  return task

def delete_task(task_id: int):
  task = db.session.get(Task, task_id)
  if task is None:
    raise TaskNotFoundError
  db.session.delete(task)
  db.session.commit()
  return task 

def update_completion(task_id: int, is_completed: bool):
  task = db.session.get(Task, task_id)
  if task is None:
    raise TaskNotFoundError
  task.is_completed = is_completed
  db.session.commit()
  return task

def is_owned_by_user(task_id: int, user_id: str):
  user = db.session.get(User, user_id)
  if user is None:
    return False
  task = db.session.query(Task)\
    .filter(
      Task.id == task_id, 
      Task.goal_id.in_(list(map(lambda x: x.id, user.goals)))
    )\
    .first()
  return True if task is not None else False