from apiflask import APIBlueprint, fields, Schema, validators
from schemas.category_schema import CategoryCreateInput, CategoryHierarchyOutputSchema, CategoryListOutputSchema, CategorySchema, GetCategoryOutputSchema
from services import auth_service, catergory_service
from models import Category
from db import db
from role import RoleGuard 
import logging

logger = logging.getLogger()

bp = cat_bp = APIBlueprint(
  'categories',
  __name__,
  url_prefix='/categories',
)


@bp.get('/')
@bp.output(CategoryListOutputSchema)
def get_categories():
  cats = catergory_service.get_categories()
  return {'categories': cats}

@bp.get('/hierarchy')
@bp.output(CategoryHierarchyOutputSchema)
def get_categories_hierarchy():
  cats = catergory_service.get_parent_categories()
  return {'hierarchy': cats}

@bp.post('/')
@auth_service.auth_protect
@RoleGuard.patrol_acl()
@bp.input(CategoryCreateInput, location='json')
@bp.output(GetCategoryOutputSchema)
def create_category(json_data: dict[str, str]):
  category = Category(**json_data)
  db.session.add(category)
  db.session.commit()
  return {'category': category}