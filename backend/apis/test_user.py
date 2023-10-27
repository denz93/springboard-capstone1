#type: ignore
from collections.abc import Mapping
from tests import TestingConfig
from tests.base_test_case import BaseTestCase

from app import app
from db import db 
from models import User 
from flask import url_for
from services.auth_service import CURRENT_USER_ID

class UserTestCase(BaseTestCase):
  def setUp(self):
    super().setUp()
    self.seed()
    self.login_as(self.user_id)
  
  def test_get_user(self):
    """Get a user"""
    with app.test_request_context():
       get_user_url = url_for('users.get_user', _external=False, user_id=self.user_id)
    with self.client as client:
        res = client.get(get_user_url)
        data = res.json
        self.assertDictSimilar(data, {
          'user': {
            'email': 'john@domain.com',
            'first_name': 'John',
            'last_name': 'Doe',
          }
        })
       
        self.assertEqual(res.status_code, 200)
  
  def test_prevent_get_other_user(self):
    """Prevent get other user"""
    with app.test_request_context():
       user2 = User(
          email = 'john2@domain.com',
          first_name = 'John',
          last_name = 'Doe',
          id = '1234568',
       )
       db.session.add(user2)
       db.session.commit()
       get_user_url = url_for('users.get_user', _external=False, user_id=user2.id)

    with self.client as client:
        res = client.get(get_user_url)
        self.assertEqual(res.status_code, 403)

  def test_update_user(self):
    """Update a user"""
    with app.test_request_context():
      update_user_url = url_for('users.update_user', _external=False, user_id=self.user_id)
    with self.client as client:
       res = client.patch(update_user_url, json={
          'first_name': 'John 2',
          'last_name': 'Smith 2',
       })
       self.assertDictSimilar(res.json, {
          'user': {
            'email': 'john@domain.com',
            'first_name': 'John 2',
            'last_name': 'Smith 2',
          }
       })
       self.assertEqual(res.status_code, 200)

       res = client.patch(update_user_url, json={
          'first_name': 'John 3',
       })

       self.assertDictSimilar(res.json, {
          'user': {
            'email': 'john@domain.com',
            'first_name': 'John 3',
            'last_name': 'Smith 2'
          }
       })