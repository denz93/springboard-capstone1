from apiflask import APIBlueprint, Schema, fields, validators
import firebase_admin
from firebase_admin import credentials
from schemas.auth_schema import GetAuthProviderOutputSchema, LogoutOutputSchema
from schemas.user_schema import GetUserOutputSchema
from services import auth_service, user_service
from os import getenv, urandom
import logging
from role import RoleGuard
from services import auth_service

logger = logging.getLogger(__name__)

# Firebase credentials initialization
cred = credentials.Certificate(".springboard-capstone1-fb57fb9dcb29.json")
firebase = firebase_admin.initialize_app(cred)

bp = authentication_bp = APIBlueprint(
  'auth',
  __name__,
  url_prefix='/auth',
)

class RegisterSchema(Schema):
  email = fields.String(required=True, validate=validators.Length(min=1, max=100))
  first_name = fields.String(required=True, validate=validators.Length( max=100))
  last_name = fields.String(required=True, validate=validators.Length(max=100))
  firebase_id_token = fields.String(required=True)
class SignInSchema(Schema):
  firebase_id_token = fields.String(required=True)

@bp.post('/register')
@bp.input(RegisterSchema, location='json')
@bp.output(GetUserOutputSchema)
def register(json_data: dict[str, str]):
  user = auth_service.register(json_data)
  token = auth_service.login(user.id)
  return {'user': user, 'token': token}

@bp.post('/signin')
@bp.input(SignInSchema, location='json')
@bp.output(GetUserOutputSchema)
def signin(json_data: dict[str, str]):
  user = auth_service.signin(json_data['firebase_id_token'])
  token = auth_service.login(user.id)
  return {'user': user, 'token': token }
  
@bp.post('/logout')
@bp.output(LogoutOutputSchema)
def logout():
  auth_service.logout()
  return {'message': 'Logged out'}

@bp.post('/current_user')
@auth_service.auth_protect
@bp.output(GetUserOutputSchema)
def get_current_user():
  user = auth_service.get_current_user()
  return {'user': user}

@bp.post('/provider/<email>')
@bp.output(GetAuthProviderOutputSchema)
def get_auth_provider(email):
  provider = auth_service.get_user_auth_provider(email)
  return {'provider': provider}

if getenv('ENV') == 'DEV':
  random_key = urandom(16).hex()
  logger.info(f'PRIVATE_ROUTE_KEY: {random_key}')
  @bp.post('/login_as_user')
  @bp.input({
    'user_id': fields.String(required=True),
    'key': fields.String(required=True, validate=validators.Equal(random_key))
    }, 
    example={
    'user_id': '1234567xxx',
    'key': 'development key'},
    schema_name='LoginUserAsInputSchema',
    location='json')
  @bp.output(GetUserOutputSchema)
  def login_as_user(json_data: dict[str, str]):
    """Login as a user for development"""
    user = user_service.get_user(json_data['user_id'])
    auth_service.login(user_id=user.id)
    return {'user': user}




  