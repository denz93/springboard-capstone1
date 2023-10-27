#type: ignore
from os import environ
from typing import Union, Literal
from flask import Flask
import logging
from logging.config import dictConfig

ENV_TYPE = Union[Literal["DEV"], Literal["PROD"], Literal["TEST"]]

class Config:
  SQLALCHEMY_DATABASE_URI: str = environ.get("DATABASE_URI", None)
  SQLALCHEMY_TRACK_MODIFICATIONS: bool = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS', False)
  SECRET_KEY: str = environ.get("FLASK_SECRET_KEY", None)
  SQLALCHEMY_ECHO: bool = environ.get('SQLALCHEMY_ECHO', False)
  ENV: ENV_TYPE = environ.get('ENV', None)

class DevConfig(Config):
  SQLALCHEMY_DATABASE_URI: str = environ.get("DATABASE_URI", 'postgresql:///db_master_planing')
  SQLALCHEMY_ECHO = environ.get('SQLALCHEMY_ECHO', False) 
  SQLALCHEMY_TRACK_MODIFICATIONS = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS', True)
  SECRET_KEY: str = environ.get("FLASK_SECRET_KEY", 'secret')
  ENV = environ.get('ENV', 'DEV')


def init_config():
  env = environ.get('ENV', 'DEV')
  dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': logging.INFO if env == 'DEV' else logging.ERROR,
        'handlers': ['wsgi']
    }
  })

def load_config(app: Flask) -> Config:
  env = environ.get('ENV', None)
  app.logger.info(f"Config is loaded from 'ENV' environment as {env}")

  if env == None:
    env = 'DEV'
    app.logger.warning(f"'ENV' environment is not specified. Default to ENV=DEV environment")
  if env not in ['DEV', 'PROD', 'TEST']:
    app.logger.error(f"'ENV' environment must be one of DEV, PROD, TEST")
    exit(1)
    
  if env == 'DEV':
    config = DevConfig()
    app.logger.setLevel(logging.INFO)
  else:
    app.logger.setLevel(logging.ERROR)
    config = Config()
  for key in dir(config):
    if key.startswith('__'):
      continue
    value = getattr(config, key)
    if value == None:
      app.logger.error(f"Must set '{key}' environment")
      exit(1)
  app.config['SQLALCHEMY_DATABASE_URI'] = config.SQLALCHEMY_DATABASE_URI
  app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = config.SQLALCHEMY_TRACK_MODIFICATIONS
  app.config['SECRET_KEY'] = config.SECRET_KEY
  app.config['SQLALCHEMY_ECHO'] = config.SQLALCHEMY_ECHO
