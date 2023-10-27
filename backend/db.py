from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from models import *

db = SQLAlchemy(model_class=Base)
def init_db(app: Flask):
  with app.app_context():
    db.init_app(app)
    db.create_all()

