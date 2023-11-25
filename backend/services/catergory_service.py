import json 
from db import db
from typing import List, Dict
from errors import CategoryNotExistedFound
from models import Category
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

# Generated from OpenAI GPT-3.5-turbo
PREDEFINED_CATEGORIES_STR = "{\"category_hierarchy\": {\"Health and Fitness\": [\"Exercise\", \"Nutrition\", \"Weight Loss\", \"Mental Health\", \"Yoga\", \"Running\", \"Strength Training\", \"Diet\", \"Cardio\", \"Wellness\", \"Sports\", \"Meditation\", \"Self-Care\", \"Sleep\", \"Stress Management\", \"Healthy Eating\", \"Pilates\", \"Gym\", \"Swimming\", \"Cycling\"], \"Personal Development\": [\"Goal Setting\", \"Productivity\", \"Time Management\", \"Self-Improvement\", \"Motivation\", \"Leadership\", \"Communication\", \"Confidence\", \"Public Speaking\", \"Creativity\", \"Learning\", \"Organization\", \"Problem Solving\", \"Decision Making\", \"Emotional Intelligence\", \"Critical Thinking\", \"Stress Management\", \"Mindfulness\", \"Career Development\", \"Networking\"], \"Finance\": [\"Budgeting\", \"Investing\", \"Saving\", \"Retirement Planning\", \"Debt Management\", \"Financial Independence\", \"Tax Planning\", \"Wealth Management\", \"Insurance\", \"Real Estate\", \"Stock Market\", \"Credit Score\", \"Estate Planning\", \"Financial Goals\", \"Financial Education\", \"Financial Freedom\", \"Passive Income\", \"Entrepreneurship\", \"Frugal Living\", \"Side Hustle\"], \"Relationships\": [\"Communication\", \"Conflict Resolution\", \"Intimacy\", \"Trust\", \"Dating\", \"Marriage\", \"Parenting\", \"Family\", \"Friendship\", \"Self-Love\", \"Boundaries\", \"Empathy\", \"Love\", \"Relationship Goals\", \"Relationship Building\", \"Relationship Skills\", \"Relationship Advice\", \"Breakups\", \"Divorce\", \"Social Skills\"], \"Career\": [\"Job Search\", \"Resume Writing\", \"Interview Skills\", \"Networking\", \"Career Growth\", \"Professional Development\", \"Work-Life Balance\", \"Time Management\", \"Leadership\", \"Communication\", \"Goal Setting\", \"Entrepreneurship\", \"Freelancing\", \"Negotiation\", \"Personal Branding\", \"Career Change\", \"Salary Negotiation\", \"Job Satisfaction\", \"Workplace Skills\", \"Workplace Culture\"]}}"
PREDEFINED_CATEGORIES_JSON: Dict = json.loads(PREDEFINED_CATEGORIES_STR)

def generate_predefined_categories() -> Dict[str, List[str]]:
  return PREDEFINED_CATEGORIES_JSON['category_hierarchy']

def populate_catergories_into_database(cat_hierarchy: Dict[str, List[str]]) -> None:
  """
  Populate predefined categories into database.

  Should be called under app context.
  """
  for parent_cat in cat_hierarchy:
    parent = Category(name=parent_cat)
    db.session.add(parent)
    try:
      db.session.commit()
    except IntegrityError:
      db.session.rollback()
      parent = db.session.query(Category).filter(Category.name == parent_cat).first()
    for child_cat in cat_hierarchy[parent_cat]:
      child = Category(name=child_cat, parent_id = parent.id) #type: ignore
      db.session.add(child)
      try:
        db.session.commit()
      except IntegrityError:
        db.session.rollback()

def get_category_by_name(name: str) -> Category:
  cat = db.session.query(Category).filter(Category.name == name).first()
  if cat is None:
    raise CategoryNotExistedFound

  return cat

def get_parent_categories() -> List[Category]:
  return db.session.query(Category)\
    .filter(Category.parent_id == None)\
    .all()

def get_categories() -> List[Category]:
  return db.session.query(Category).all()
