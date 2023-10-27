from apiflask import Schema, fields, validators

class LogoutOutputSchema(Schema):
  message = fields.String()
