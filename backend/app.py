from config import load_config, init_config
init_config()
from services import auth_service
from db import init_db
from apiflask import APIFlask
from apis import goal_bp, user_bp, task_bp, authentication_bp, prompt_bp, cat_bp
from flask_cors import CORS, cross_origin
from flask import request, Response, session

app = APIFlask(__name__, title='Master Planing API', version='1.0')

CORS(app, origins=['https://springboard-capstone1.web.app', 'https://springboard-capstone1.firebaseapp.com', 'http://localhost:5173'], allow_headers=['Content-Type', auth_service.AUTH_HEADER_KEY])
load_config(app)
app.logger.info(f"Flask app's config is loaded")

@app.after_request
def add_allow_headers(res: Response):
  if res.status_code == 308:
    for key, val in request.headers.items():
      app.logger.info(f'{key}: {val}')
  if request.method == 'OPTIONS':
    res.status_code = 204
  return res
@app.error_processor
def error_processor(error):
  app.logger.error(error.__dict__)
  wrapper = {
    'error': {
      'message': error.message,
      'detail': error.detail,
      **error.extra_data
    }
  }
  return wrapper, error.status_code


init_db(app)
auth_service.init(app.config['SECRET_KEY'])

app.logger.info(f"Database is loaded")

app.register_blueprint(goal_bp)
app.register_blueprint(user_bp)
app.register_blueprint(task_bp)
app.register_blueprint(authentication_bp)
app.register_blueprint(prompt_bp)
app.register_blueprint(cat_bp)
app.before_request(auth_service.load_user)
# def my_schema_name_resolver(schema):
#   return schema.__class__.__name__.lower()

# app.schema_name_resolver = my_schema_name_resolver