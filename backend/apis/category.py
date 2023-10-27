from apiflask import APIBlueprint, fields, Schema, validators
from services import auth_service
from models import Category
from db import db
from role import RoleGuard 
bp = cat_bp = APIBlueprint(
  'categories',
  __name__,
  url_prefix='/categories',
)

class CategorySchema(Schema):
  id = fields.Integer()
  name = fields.String()
  photo_url = fields.String()
  created_at = fields.DateTime()

class CategoryCreateInput(Schema):
  name = fields.String(required=True, validate=validators.Length(min=1, max=100))
  photo_url = fields.String(validate=validators.Length(min=1, max=80000))
@bp.get('/')
@bp.output({'categories': fields.List(fields.Nested(CategorySchema))})
def get_categories():
  cats = db.session.query(Category)\
    .all()
  return {'categories': cats}

@bp.post('/')
@auth_service.auth_protect
@RoleGuard.patrol_acl()
@bp.input(CategoryCreateInput, location='json')
@bp.output({'category': fields.Nested(CategorySchema)})
def create_category(json_data: dict[str, str]):
  category = Category(**json_data)
  db.session.add(category)
  db.session.commit()
  return {'category': category}