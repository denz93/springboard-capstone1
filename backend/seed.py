from db import db
from app import app
from models.user import User 
from services import catergory_service
from logging import getLogger
logger = getLogger(__name__)

def create_user():
  with app.app_context():
    user = User(
      email = 'john@domain.com',
      first_name = 'John',
      last_name = 'Smith',
      id = "1234567"
    )

    db.session.merge(user)
    # db.session.add(user)
    db.session.commit()
    logger.info('Users created')
def create_category():
  with app.app_context():
    category_hierarchy = catergory_service.generate_predefined_categories()
    catergory_service.populate_catergories_into_database(category_hierarchy)
    logger.info('Categories created')
create_user()
create_category()
