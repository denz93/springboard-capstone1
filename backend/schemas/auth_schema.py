from apiflask import Schema, fields, validators

class LogoutOutputSchema(Schema):
  message = fields.String()

class GetAuthProviderOutputSchema(Schema):
  provider = fields.String()