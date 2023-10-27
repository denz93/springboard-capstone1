from services import auth_service
from errors import AccessResourceNotAllowedError, ForbiddenError, ResourceMissingKeyError
from models import *
from typing import Type, Callable
from db import db
from functools import wraps
Resource = Task | Goal



class RoleGuard:

  @classmethod
  def patrol_acl(cls, resourceClass: Type[Resource] | None = None, resource_id_key: str | None = None):
    """
    Decorator to protect access to resources
    """
    def decorator(func: Callable):
      @wraps(func)
      def wrapper(*args, **kwargs):
        user = auth_service.get_current_user()
        if user.role == 'admin':
          return func(*args, **kwargs)
        
        if resourceClass is None:
          raise AccessResourceNotAllowedError
        
        if resource_id_key is None:
          raise AccessResourceNotAllowedError
        
        if resource_id_key not in kwargs:
          raise ResourceMissingKeyError(message=f'Missing "{resource_id_key}" key')
        resource_id = kwargs[resource_id_key]

        if resourceClass == Goal:
          goal = db.session.query(Goal)\
            .filter(Goal.id == resource_id, Goal.user_id == user.id)\
            .first()
          if not goal:
            raise AccessResourceNotAllowedError
        elif resourceClass == Task:
          task = db.session.query(Task)\
            .filter(Task.id == resource_id, Task.goal_id.in_(list(map(lambda x: x.id, user.goals))))\
            .first()
          if not task:
            raise AccessResourceNotAllowedError
        
        return func(*args, **kwargs)
      return wrapper
    return decorator
  
