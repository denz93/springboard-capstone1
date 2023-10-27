from tests import TestingConfig
from tests.base_test_case import BaseTestCase
from app import app 
from flask import url_for
from db import db
from models import * 
from datetime import datetime, timedelta

class TestTask(BaseTestCase):
  def setUp(self) -> None:
    super().setUp()
    self.seed()
    self.login_as(self.user_id)

    with app.app_context():
      task = db.session.query(Task)\
        .filter(
          Task.goal_id == self.goal_id, 
          Task.is_completed==False)\
        .first()
      if task is not None:
        self.task_id = task.id

      user2 = User(
        email = 'errik@domain.com',
        first_name = 'John',
        last_name = 'Doe',
        id = '1234569',
      )
      goal = Goal(
        title = 'Errik Goal',
        description = 'Test Description',
        start_date = datetime.utcnow(),
        end_date = (datetime.utcnow() + timedelta(days=7)),
      )
      task = Task(
        title = 'Errik Task',
        description = 'Test Description',
        is_completed = False,
      )
      goal.user = user2 
      task.goal = goal 
      db.session.add(user2)
      db.session.add(goal)
      db.session.add(task)
      db.session.commit()
      self.user2_id = user2.id 
      self.goal2_id = goal.id 
      self.task2_id = task.id

  def test_get_task(self):
    """Get a task"""
    with app.test_request_context():
      get_task_url = url_for('tasks.get_task', user_id=self.user_id, task_id=self.task_id)
    with self.client as client:
      res = client.get(get_task_url)
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, { #type: ignore
        'task': {
          'title': 'Test Task 1',
          'description': 'Test Description 1',
          'is_completed': False,
        }
      })
  def test_prevent_get_other_user_task(self):
    """Prevent get other user's task"""
    with app.test_request_context():
      get_task_url = url_for('tasks.get_task', task_id=self.task2_id)

    with self.client as client:
      res = client.get(get_task_url)
      self.assertEqual(res.status_code, 403)

  def test_get_tasks(self):
    """Get tasks"""
    with app.test_request_context():
      get_tasks_url = url_for('tasks.get_tasks')
    with self.client as client:
      res = client.get(get_tasks_url)
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, { # type: ignore
        'tasks': [
          {
            'title': 'Test Task 1',
            'description': 'Test Description 1',
            'is_completed': False,
          },
          {
            'title': 'Test Task 2',
            'description': 'Test Description 2',
            'is_completed': True,
          },
        ],
        'pagination': {
          'page': 1,
          'total': 2,
        }
      })

  def test_mark_task_as_completed(self):
    """Mark task as completed"""
    with app.test_request_context():
      mark_task_as_completed_url = url_for('tasks.update_completion', task_id=self.task_id)
    with self.client as client:
      res = client.patch(mark_task_as_completed_url, json={
        'is_completed': True
      })
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, { # type: ignore
        'task': {
          'is_completed': True,
        }
      })

  def test_update_task(self):
    """Update a task"""
    with app.test_request_context():
      update_task_url = url_for('tasks.update_task', task_id=self.task_id)
    with self.client as client:
      res = client.patch(update_task_url, json={
        'title': 'New Task 2',
        'description': 'New Description 2'
      })
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, { # type: ignore
        'task': {
          'title': 'New Task 2',
          'description': 'New Description 2',
          'is_completed': False,
        }
      })
      
  def test_delete_task(self):
    """Delete a task"""
    with app.test_request_context():
      delete_task_url = url_for('tasks.delete_task', task_id=self.task_id)
    with self.client as client:
      res = client.delete(delete_task_url)
      self.assertEqual(res.status_code, 200)
      self.assertDictSimilar(res.json, { # type: ignore
        'task': {
          'id': self.task_id,
          'title': 'Test Task 1',
          'description': 'Test Description 1',
          'is_completed': False,
        }
      })

    with app.app_context():
      tasks = db.session.query(Task)\
        .filter(Task.goal_id == self.goal_id)\
        .all()
      self.assertEqual(len(tasks), 1)
