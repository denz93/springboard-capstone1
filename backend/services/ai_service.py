import requests
import os 
import logging

logger = logging.getLogger()

OPENAI_TOKEN = os.getenv('OPENAI_TOKEN')
URL_BASE = 'https://api.openai.com/v1'
MAX_TOKEN = 1000 

if OPENAI_TOKEN is None:
  logger.warning('OPENAI_TOKEN is not set. ChatGPT feature may not work.')

session = requests.Session()
session.headers.update({
  'Authorization': f'Bearer {OPENAI_TOKEN}'
})


def query_chat_messages(messages: list[dict]) -> str | None:
  res = session.post(f'{URL_BASE}/chat/completions', json={
    'model': 'gpt-3.5-turbo',
    'messages': messages,
    'temperature': 0,
    'max_tokens': MAX_TOKEN
  })
  if res.status_code >= 300:
    logger.error(f'Calling OpenAI API failed with code: {res.status_code}\n{res.text}')
    return None
  data = res.json()
  return data['choices'][0]['message']['content']  