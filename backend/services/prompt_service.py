import json
from db import db
from errors import GenerateGoalFailedError, PromptNotFoundError 
from models import Prompt, Task, Goal
from services import ai_service 
from flask_sqlalchemy.pagination import Pagination
from logging import getLogger
logger = getLogger(__name__)

def get_prompt_by_id(id: int):
  prompt = db.session.query(Prompt)\
    .filter(Prompt.id == id)\
    .first()
  if prompt is None:
    raise PromptNotFoundError
  return prompt

def get_prompt_by_messages(messages: list[dict]) -> Prompt:
  prompt = Prompt() 
  prompt.messages = messages
  prompt = db.session.query(Prompt)\
    .filter(Prompt.messages_str == prompt.messages_str)\
    .first()
  if prompt is None:
    raise PromptNotFoundError
  return prompt

def create_prompt(messages: list[dict]):
  prompt = Prompt()
  prompt.messages = messages
  db.session.add(prompt)
  db.session.commit()
  return prompt

def get_or_query_prompt_response(prompt: Prompt):
   # Pulling the response from cache
  if prompt.response is not None:
    logger.info("Using cached response for the messages")
    return prompt.response

  response = ai_service.query_chat_messages(prompt.messages)

  prompt.response = response # type: ignore
  db.session.commit()
  
  return prompt.response

def get_prompt_response_by_messages(messages: list[dict]):
  prompt = get_prompt_by_messages(messages)
  
  response = get_or_query_prompt_response(prompt)
  
  return response

def get_prompt_response_by_id(prompt_id: int):
  prompt = get_prompt_by_id(prompt_id)
  
  response = get_or_query_prompt_response(prompt)
  
  return response

def get_prompts(query_data: dict) -> Pagination:
  pagination = db.paginate(
    db.session.query(Prompt), # type: ignore
    **query_data
  )

  return pagination

def generate_tasks_from_goal(goal: Goal) -> list[Task]:
  example_tasks = [
    "task 1",
    "task 2",
    "etc"
  ]
  messages = [
    {
      'role': 'system',
      'content': f'You are a professional and efficient planner {"in " + goal.category.name + " field " if goal.category else ""}who helps users to achieve their goals by give them well defined and actionable tasks based on the user\'s specific goal. You should return the result as most-compact JSON format: {{"tasks": {json.dumps(example_tasks, separators=(",",":"))}}}'
    },
    {
      'role': 'user',
      'content': f'My goal is `{goal.title}` which is { "`" + goal.description + "`" if goal.description is not None and goal.description != "" else ""}. Help me to achieve it by breaking it down into smaller tasks. Max 10 tasks.'
    }
  ]
  try:
    prompt = get_prompt_by_messages(messages)
  except PromptNotFoundError:
    prompt = create_prompt(messages)

  response = get_or_query_prompt_response(prompt)

  if response is None:
    return []
  response_dict = json.loads(response)
  task_list = response_dict['tasks']
  return [Task(title=title) for title in task_list]

def generate_goal_with_title_and_description(partial_goal_title: str) -> dict:
  messages = [
    {
      'role': 'system',
      'content': 'You are a professional and efficient planner who helps users autocomplete their goal based on their\'s incomplete title text.Should return a well-format no-space JSON such as: {\"goal\":{\"title\":\"goal title\",\"description\":\"goal description\"}}'
    },
    {
      'role': 'system',
      'name': 'example_user',
      'content': 'My incomplete goal title is \"Reach 1 mill\". Help me complete my goal definition with a title and description.'
    },
    {
      'role': 'system',
      'name': 'example_assistant',
      'content': '{\"goal\":{\"title\":\"Reach 1 million income from multiple sources\",\"description\":\"Improve technical skills and performance in current job so that I can get a raise. Find a side hustle bussiness and make commitment.\"}}'
    },
    {
      'role': 'user',
      'content': f'My incomplete goal title is "{partial_goal_title}". Help me complete my goal definition with a title and description.'
    }
  ]
  try:
    prompt = get_prompt_by_messages(messages)
  except PromptNotFoundError:
    prompt = create_prompt(messages)

  response = get_or_query_prompt_response(prompt)
  if response is None:
    raise GenerateGoalFailedError
  response_json = json.loads(response)
  return response_json['goal']

def delete(prompt_id: int):
  prompt = get_prompt_by_id(prompt_id)
  db.session.delete(prompt)
  db.session.commit()
  return prompt