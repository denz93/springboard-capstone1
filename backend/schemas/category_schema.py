from apiflask import Schema, fields, validators


class CategorySchema(Schema):
  id = fields.Integer(allow_none=False)
  name = fields.String(allow_none=False)
  photo_url = fields.String()

class CategoryHierarchySchema(Schema):
  id = fields.Integer(allow_none=False)
  name = fields.String(allow_none=False)
  photo_url = fields.String()
  children = fields.List(fields.Nested(CategorySchema), allow_none=False)

class CategoryListOutputSchema(Schema):
  categories = fields.List(fields.Nested(CategorySchema))

class CategoryHierarchyOutputSchema(Schema):
  hierarchy = fields.List(fields.Nested(CategoryHierarchySchema))

class GetCategoryOutputSchema(Schema):
  category = fields.Nested(CategorySchema)

class CategoryCreateInput(Schema):
  name = fields.String(required=True, validate=validators.Length(min=1, max=100))
  photo_url = fields.String(validate=validators.Length(min=1, max=80000))