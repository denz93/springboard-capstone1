from db import db
from app import app
from models.goal import Goal
from models.task import Task
from models.user import User 
from services import catergory_service
from datetime import datetime, timedelta
from logging import getLogger
logger = getLogger(__name__)

def create_user():
  with app.app_context():
    user = User(
      email = 'john@domain.com',
      first_name = 'John',
      last_name = 'Smith',
      id = "1234567"
    )

    db.session.merge(user)
    # db.session.add(user)
    db.session.commit()
    logger.info('Users created')
def create_category():
  with app.app_context():
    category_hierarchy = catergory_service.generate_predefined_categories()
    catergory_service.populate_catergories_into_database(category_hierarchy)
    logger.info('Categories created')

def create_goals():
  today = datetime.now()

  goals = [{
      "title": "Debt-Free in Five Years",
      "description": "My goal is to eliminate all my existing debts and become completely debt-free within the next five years. This includes paying off credit cards, student loans, and my car loan. I'll create a detailed repayment plan, explore debt consolidation options, and increase my income sources to achieve financial freedom and peace of mind.",
      "start_date": today - timedelta(days=30),
      "end_date": today + timedelta(days=6*30)
    },{
      "title": "Bilingual Proficiency by 30",
      "description": "I aim to achieve proficiency in a second language by my 30th birthday. I'll dedicate time each day to language learning, participate in conversational groups, and take formal language courses if necessary. This goal is essential for personal growth and expanding my cultural horizons.",
      "start_date": today + timedelta(days=30),
      "end_date": today + timedelta(days=3*30)
    },{
      "title": "Triathlon Competitor in One Year",
      "description": "My goal is to compete in a triathlon within the next year. I will design a comprehensive training plan, join a local triathlon club, and work on my swimming, cycling, and running skills. This goal represents a commitment to my physical fitness and pushing my boundaries in endurance sports.",
      "start_date": today - timedelta(days=60),
      "end_date": today - timedelta(days=30)
    }]
  tasks = [
    [
      {"title": "List debts", "description": "Create a comprehensive list of all existing debts, including amounts and interest rates."},
      {"title": "Develop monthluy budget", "description": "Develop a monthly budget to allocate a portion of income towards debt repayment."},
      {"title": "Explore debt consolidation options", "description": "Explore debt consolidation options to reduce interest rates and simplify payments."},
      {"title": "Increase income sources", "description": "Increase income sources to increase disposable income."},
      {"title": "Set up automatic payments", "description": "Set up automatic payments to ensure on-time debt repayment."}
    ],
    [
      {"title": "Choose a language to learn", "description": "Choose a specific language to learn."},
      {"title": "Set aside a dedicated daily study time", "description": "Set aside a dedicated daily study time (e.g., 30 minutes to 1 hour)."},
      {"title": "Join a language learning group", "description": "Join a language learning group to practice speaking and listening skills."},
      {"title": "Take formal language courses", "description": "Take formal language courses if necessary."}
    ],
    [
      {"title": "Train for a triathlon", "description": "Train for a triathlon within the next year."},
      {"title": "Join a triathlon club", "description": "Join a local triathlon club."},
      {"title": "Develop swimming, cycling, and running skills", "description": "Develop swimming, cycling, and running skills."}

    ]
  ]
  with app.app_context():
    goal_list: list[Goal] = []
    for goal in goals:
      obj = Goal(**goal, user_id="tl7qaevRrnXyx3Xm3s0OhgHvfCu2")
      db.session.add(obj)
      goal_list.append(obj)
    db.session.commit()
    logger.info('Goals created')

    for group_idx, task_group in enumerate(tasks):
      for task in task_group:
        obj = Task(**task, goal_id=goal_list[group_idx].id)
        db.session.add(obj)
    db.session.commit()
    logger.info('Tasks created')

# create_user()
create_category()
# create_goals()
