from config import load_config, init_config
init_config()
from services import auth_service
from db import init_db
from apiflask import APIFlask
from apis import goal_bp, user_bp, task_bp, authentication_bp, prompt_bp
app = APIFlask(__name__, title='Master Planing API', version='1.0')
load_config(app)
app.logger.info(f"Flask app's config is loaded")

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
app.logger.info(f"Database is loaded")

app.register_blueprint(goal_bp)
app.register_blueprint(user_bp)
app.register_blueprint(task_bp)
app.register_blueprint(authentication_bp)
app.register_blueprint(prompt_bp)
app.before_request(auth_service.load_user)
# def my_schema_name_resolver(schema):
#   return schema.__class__.__name__.lower()

# app.schema_name_resolver = my_schema_name_resolver