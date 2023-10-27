from schemas import QuerySchema
from schemas.prompt_response import DeletePromptOutputSchema, GetPromptByMessageInputSchema, GetPromptResponseSchema, PromptListResponseSchema, SuggestGoalInputSchema, SuggestGoalOutputSchema, SuggestTasksInputSchema, SuggestTasksOutputSchema
from services import goal_service, prompt_service
from apiflask import APIBlueprint, pagination_builder

bp = prompt_bp = APIBlueprint(
  'prompts',
  __name__,
  url_prefix='/prompts'
)

@bp.get('/<int:id>')
@bp.output(GetPromptResponseSchema)
def get_prompt_by_id(id: int):
  prompt = prompt_service.get_prompt_by_id(id)
  return {'prompt': prompt} 

@bp.post('/by_messages')
@bp.input(GetPromptByMessageInputSchema, location='json')
@bp.output(GetPromptResponseSchema)
def get_prompt_by_messages(json_data: dict):
  prompt = prompt_service.get_prompt_by_messages(json_data['messages'])
  return {'prompt': prompt}

@bp.get('/')
@bp.input(QuerySchema, location='query')
@bp.output(PromptListResponseSchema)
def get_prompts(query_data: dict):
  pagination = prompt_service.get_prompts(query_data) 
  return {
    'prompts': pagination.items,
    'pagination': pagination_builder(pagination) # type: ignore
  }

@bp.post('/<int:goal_id>/ask_for_tasks_suggestion')
@bp.output(SuggestTasksOutputSchema)
def suggest_tasks_from_goal(goal_id: int):
  goal = goal_service.get_goal(goal_id)
  tasks = prompt_service.generate_tasks_from_goal(goal)
  return {'suggested_tasks': tasks}

@bp.delete('/<int:prompt_id>')
@bp.output(DeletePromptOutputSchema)
def delete_prompt(prompt_id: int):
  prompt_service.delete(prompt_id)
  return {'status': 'ok'}

@bp.post('/suggest_goal')
@bp.input(SuggestGoalInputSchema, location='json')
@bp.output(SuggestGoalOutputSchema)
def suggest_goal(json_data: dict):
  goal = prompt_service.generate_goal_with_title_and_description(json_data['partial_title'])
  return {'goal': goal}