#type: ignore
from flask import url_for
from services.auth_service import CURRENT_USER_ID
from models.user import User
from tests import TestingConfig, BaseTestCase
from db import db 
from datetime import datetime, timedelta
from app import app 
from errors import GoalNotFoundError, AccessResourceNotAllowedError

class GoalTestCase(BaseTestCase):
  def setUp(self) -> None:
    super().setUp()
    self.seed()
    self.login_as(self.user_id)

  def test_get_goal(self):
    """Get a goal"""
    with app.test_request_context():
      get_goal_url = url_for('goals.get_goal', user_id=self.user_id, goal_id=self.goal_id)
    with self.client as client:
      res = client.get(get_goal_url)
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, {
        'goal': {
          'title': 'Test Goal',
          'description': 'Test Description',
          'is_completed': False
        }
       })
  def test_get_non_existed_goal(self):
    """Get a non existed goal"""
    with app.test_request_context():
      get_goal_url = url_for('goals.get_goal', goal_id=2000)
    with self.client as client:
      res = client.get(get_goal_url)
      self.assertEqual(res.status_code, 403)
      self.assertDictSimilar(res.json, {
        'error': {
          'message': 'Access resource not allowed'
        }
      })
  def test_create_goal(self):
    """Create a goal"""
    with app.test_request_context():
      create_goal_url = url_for('goals.create_goal', user_id=self.user_id)
    with self.client as client:
      res = client.post(create_goal_url, json={
        'title': 'Test Goal',
        'description': 'Test Description',
        'start_date': datetime.utcnow().timestamp(),
        'end_date': (datetime.utcnow() + timedelta(days=7)).timestamp()
      })
      self.assertEqual(res.status_code, 201)
      self.assertDictSimilar(res.json, {
        'goal': {
          'title': 'Test Goal',
          'description': 'Test Description',
          'is_completed': False
        }
      })
      self.assertEqual(int(res.json['goal']['end_date'] - res.json['goal']['start_date']), 7*24*60*60)
  def test_create_goal_with_invalid_input(self):
    """Create a goal with invalid input"""
    with app.test_request_context():
      create_goal_url = url_for('goals.create_goal', user_id=self.user_id)
    with self.client as client:
      res = client.post(create_goal_url, json={
        'description': 'Test Description',
        'start_date': datetime.utcnow().timestamp(),
        'end_date': '2023-01-01'
      })
      self.assertEqual(res.status_code, 422)
      self.assertDictSimilar(res.json, {
        'error': {
          'message': 'Validation error',
          'detail': {
            'json': {
              'title': ['Missing data for required field.'],
              'end_date': ['Not a valid datetime.'],
            }
          }
        }
      })
  def test_update_goal(self):
    """Update a goal"""
    with app.test_request_context():
      update_goal_url = url_for('goals.update_goal', goal_id=self.goal_id)
  
    with self.client as client:
      res = client.patch(update_goal_url, json={
        'title': 'Test Goal 2',
        'description': 'Test Description 2',
        'start_date': datetime.utcnow().timestamp(),
        'end_date': (datetime.utcnow() + timedelta(days=10)).timestamp()
      })
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, {
        'goal': {
          'title': 'Test Goal 2',
          'description': 'Test Description 2',
          'is_completed': False
        }
      })
      self.assertEqual(int(res.json['goal']['end_date'] - res.json['goal']['start_date']), 10*24*60*60)
  def test_delete_goal(self):
    """
      Delete a goal

      Should also delete all tasks that are belong to that goal
    """
    with app.test_request_context():
      delete_goal_url = url_for('goals.delete_goal', goal_id=self.goal_id)
      get_tasks_url = url_for('goals.get_tasks', goal_id=self.goal_id, query_string={'page': 1, 'per_page': 12})
    with self.client as client:
      res = client.delete(delete_goal_url)
      self.assertEqual(res.status_code, 200)

      res = client.get(get_tasks_url)
      self.assertEqual(res.status_code, GoalNotFoundError.status_code)
      self.assertDictSimilar(res.json, {
        'error': {
          'message': GoalNotFoundError.message
        }
      })
  def test_get_tasks_belong_goal(self):
    """Get tasks that belong to a goal"""
    with app.test_request_context():
      get_tasks_url = url_for('goals.get_tasks', goal_id=self.goal_id)
    with self.client as client:
      res = client.get(get_tasks_url)
      self.assertEqual(res.status_code, 200)
      self.assertEqual(len(res.json['tasks']), 2)
      self.assertDictSimilar(res.json, {
        'tasks': [
          {
            'title': 'Test Task 1',
            'description': 'Test Description 1',
            'is_completed': False
          },
          {
            'title': 'Test Task 2',
            'description': 'Test Description 2',
            'is_completed': True
          }
        ]
      })
  def test_get_tasks_from_non_existed_goal(self):
    """Get tasks that belong to a non existed goal"""
    with app.test_request_context():
      get_tasks_url = url_for('goals.get_tasks', goal_id=2000)
    with self.client as client:
      res = client.get(get_tasks_url)
      self.assertEqual(res.status_code, AccessResourceNotAllowedError.status_code)
      self.assertDictSimilar(res.json, {
        'error': {
          'message': AccessResourceNotAllowedError.message
        }
      })
