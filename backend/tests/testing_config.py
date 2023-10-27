from os import environ

environ['ENV'] = 'TEST'
environ['DATABASE_URI'] = 'sqlite:///:memory:'
environ['FLASK_SECRET_KEY'] = 'secret'

from app import app as app
app.testing = True

from db import db
