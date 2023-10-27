import tests.testing_config
from tests.base_test_case import BaseTestCase
from unittest.mock import patch, MagicMock
from app import app 
from firebase_admin.auth import InvalidIdTokenError, ExpiredIdTokenError, CertificateFetchError, RevokedIdTokenError
class AuthTestCase(BaseTestCase):
  def setUp(self):
    super().setUp()
    self.seed()
  @patch('apis.authentication.auth.verify_id_token')
  def test_signin(self, verify_id_token_stub: MagicMock):
    verify_id_token_stub.return_value = {'uid': '1234567'}

    with app.test_client() as client:
      res = client.post('/auth/signin', json={
        'firebase_id_token': 'xxx',
      })

      verify_id_token_stub.assert_called_with('xxx')
      self.assertDictSimilar(res.json, { #type: ignore
        'user': {
          'email': 'john@domain.com',
          'first_name': 'John',
          'last_name': 'Doe',

        }
      })
  @patch('apis.authentication.auth.verify_id_token')
  def test_signin_with_invalid_token(self, verify_id_token_stub: MagicMock):
    error_list = [
      ValueError, 
      InvalidIdTokenError('Invalid'), 
      ExpiredIdTokenError('Expired', 'Test'), 
      RevokedIdTokenError('Revoked'), 
      CertificateFetchError('Error', 'Test')
    ]
    for error in  error_list:
      verify_id_token_stub.side_effect = error
      with app.test_client() as client:
        res = client.post('/auth/signin', json={
            'firebase_id_token': 'xxx',
          })
        self.assertEqual(res.status_code, 401)
        self.assertDictSimilar(res.json, { #type: ignore
          'error': {
            'message': 'Invalid Firebase token'
          }
        })
  @patch('apis.authentication.auth.verify_id_token')
  def test_register(self, verify_id_token_stub: MagicMock):
    verify_id_token_stub.return_value = {'uid': '1234567xxx'}
    with app.test_client() as client:
      res = client.post('/auth/register', json={
        'firebase_id_token': 'xxx',
        'first_name': 'Smith',
        'last_name': 'Luis',
        'email': 'smith@domain.com',
      })
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, { #type: ignore
        'user': {
          'email': 'smith@domain.com',
          'first_name': 'Smith',
          'last_name': 'Luis',
        }
      })
  @patch('apis.authentication.auth.verify_id_token')
  def test_register_with_existed_uid(self, verify_id_token_stub: MagicMock):
    verify_id_token_stub.return_value = {'uid': '1234567'}
    with app.test_client() as client:
      res = client.post('/auth/register', json={
        'firebase_id_token': 'xxx',
        'first_name': 'Smith',
        'last_name': 'Luis',
        'email': 'smith@domain.com',
      })
      self.assertEqual(res.status_code, 409)
      self.assertDictSimilar(res.json, { #type: ignore
        'error': {
          'message': 'User already exists'
        }
      })
  
  @patch('apis.authentication.auth.verify_id_token')
  def test_register_with_existed_email(self, verify_id_token_stub: MagicMock):
    verify_id_token_stub.return_value = {'uid': '1234567xxx'}
    with app.test_client() as client:
      res = client.post('/auth/register', json={
        'firebase_id_token': 'xxx',
        'first_name': 'Smith',
        'last_name': 'Luis',
        'email': 'john@domain.com',
      })
      self.assertEqual(res.status_code, 409)
      self.assertDictSimilar(res.json, { #type: ignore
        'error': {
          'message': 'User already exists'
        }
      })

  


  
    