from apiflask import HTTPError
#====== General errors
class ResourceNotFoundError(HTTPError):
  status_code = 404
  message = 'Resource not found'

class ResourceExistsError(HTTPError):
  status_code = 409
  message = 'Resource already exists'

#====== Auth errors
class InvalidFirebaseTokenError(HTTPError):
  status_code = 401
  message = 'Invalid Firebase token'

class ForbiddenError(HTTPError):
  status_code = 403
  message = 'Operation not allowed'

class UnauthorizedError(HTTPError):
  status_code = 401
  message = 'Unauthorized'

class ResourceMissingKeyError(ForbiddenError):
  pass

class AccessResourceNotAllowedError(ForbiddenError):
  message = 'Access resource not allowed'

#====== User errors
class UserAlreadyExistsError(ResourceExistsError):
  message = 'User already exists'

class UserNotRegisteredError(ResourceNotFoundError):
  message = 'User not registered'

class UserNotFoundError(ResourceNotFoundError):
  message = 'User not found'


#====== Goal errors
class GoalNotFoundError(HTTPError):
  status_code = 404
  message = 'Goal not found'

#====== Task errors
class TaskNotFoundError(ResourceNotFoundError):
  message = 'Task not found'
  

class CategoryNotExistedFound(ResourceNotFoundError):
  message = 'Category not existed'

class PromptNotFoundError(ResourceNotFoundError):
  message = 'Prompt not found'

class GenerateGoalFailedError(HTTPError):
  status_code = 403
  message = 'Generate goal failed'