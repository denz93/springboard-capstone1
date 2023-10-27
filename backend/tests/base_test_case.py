from unittest import TestCase
from services.auth_service import CURRENT_USER_ID
from db import db 
from models import *
import tests.testing_config

from app import app
from datetime import datetime, timedelta

class BaseTestCase(TestCase):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    with app.app_context():
      db.drop_all()
      db.create_all()
    self.client = app.test_client()
  
  def setUp(self) -> None:
    super().setUp()
    with app.app_context():
      db.drop_all()

  def tearDown(self) -> None:
    super().tearDown()
    with app.app_context():
      db.drop_all() 
  
  def login_as(self, user_id):
    with self.client.session_transaction() as session:
      session[CURRENT_USER_ID] = user_id

  def seed(self):
    """Seed test data."""
    with app.app_context():
      db.create_all()
      task1 = Task(
        title = 'Test Task 1',
        description = 'Test Description 1',
        is_completed = False
      )
      task2 = Task(
        title = 'Test Task 2',
        description = 'Test Description 2',
        is_completed = True
      )
      goal = Goal(
        title = 'Test Goal',
        description = 'Test Description',
        start_date = datetime.utcnow(),
        end_date = (datetime.utcnow() + timedelta(days=7))
      )
      user = User(
        email = 'john@domain.com',
        first_name = 'John',
        last_name = 'Doe',
        id = '1234567',
      )
      task1.goal = goal
      task2.goal = goal
      goal.user = user
      db.session.add(user)
      db.session.add(goal)
      db.session.add(task1)
      db.session.add(task2)
      db.session.commit()
      self.user_id = user.id
      self.goal_id = goal.id
      

  def assertDictSimilar(self, test_dict: dict, expected_dict: dict):
    for key, value in expected_dict.items():
      if key not in test_dict:
        self.fail(f"Key '{key}' not found in test_dict")
      self.assertEqual(type(test_dict[key]), type(value), f"Type mismatch for key '{key}'")
      if type(value) == dict:
        self.assertDictSimilar(test_dict[key], value)
      elif type(value) == list:
        self.assertEqual(len(test_dict[key]), len(value), f"List length mismatch for key '{key}'")
        for idx, item in enumerate(value):
          if type(item) == dict:
            self.assertDictSimilar(test_dict[key][idx], item)
          else:
            self.assertEqual(test_dict[key][idx], item)
      else:
        self.assertEqual(test_dict[key], value)
  