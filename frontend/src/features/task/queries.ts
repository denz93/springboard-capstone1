import { Goal, getApiService, GoalsApi, TasksApi, TasksTaskIdCompletionPatchRequest, ValidationError, TaskFromJSON, Task, PromptsApi} from "../../api-service-factory"
import {useQuery, useMutation, useQueryClient, UseMutationOptions} from '@tanstack/react-query'
import { z } from 'zod'
import {apiConfig, localFetch} from '@/api-config'
import { useAlert } from "../alert/hooks"
const goalApiService = getApiService(GoalsApi)
const taskApiService = getApiService(TasksApi)
const promptApiService = getApiService(PromptsApi)
export const CreateTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).trim(),
  description: z.string().max(1000).trim().optional(),
})

function CreateTaskInputToJSON(input: z.infer<typeof CreateTaskInputSchema>) {
  return {
    title: input.title,
    description: 'description' in input && input.description !== "" && input.description !== null ? input.description : undefined,
  }
}

async function createTask(goalId: NonNullable<Goal["id"]>, input: z.infer<typeof CreateTaskInputSchema>) {
  const res = await localFetch(apiConfig.basePath + `/tasks/${goalId}`, {
    method: 'POST',
    body: JSON.stringify(CreateTaskInputToJSON(input)),
  })

  const data = await res.json()

  if (!res.ok && res.status < 500) {
    throw (data.error as ValidationError)
  }

  return {
    task: TaskFromJSON(data.task)
  }
}


export function useTaskList(goalId: NonNullable<Goal['id']>) {
  return useQuery({
    queryKey: ['goals', goalId, 'tasks'],
    queryFn: async () => (await goalApiService.goalsGoalIdTasksGet({goalId})).tasks,
    select(data) {
      if (data === undefined)
        return []
      const newList = [...data].sort((a, b) => {
        return a.id as number - (b.id as number)
      })

      return newList
    }
  })
}

export function useTaskCompletionMutation(goalId?: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['goals', goalId, 'tasks', 'completion'],
    mutationFn: (variables: TasksTaskIdCompletionPatchRequest) => taskApiService.tasksTaskIdCompletionPatch(variables),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['tasks', variables.taskId], data.task)
      if (goalId !== undefined)
        queryClient.invalidateQueries({
          queryKey: ['goals']
        })
    },

  }) 
}

export function useCreateTaskMutation(
  goalId: number, 
  options?: Pick<UseMutationOptions<Task, Error, z.infer<typeof CreateTaskInputSchema>, unknown>,"onSuccess">
  ) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationKey: ['goals', goalId, 'tasks', 'create'],
    mutationFn: async (input: z.infer<typeof CreateTaskInputSchema>) => (await createTask(goalId, input)).task,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['tasks', data.id], data)
      queryClient.invalidateQueries({
        queryKey: ['goals', goalId ,'tasks']
      })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export function useDeleteTaskMutation(goalId: NonNullable<Goal['id']>) {
  const queryClient = useQueryClient()
  const {push} = useAlert()
  return useMutation({
    mutationFn: async ({id: taskId}: Required<Pick<Task, "id">>) => (await taskApiService.tasksTaskIdDelete({taskId})).task,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['goals', goalId, 'tasks']
      })
      push({message: 'Task deleted successfully', type: 'success'})
    }
  })
}

export function useSuggestTasksQuery(goalId: NonNullable<Goal['id']>) {
  return useQuery({
    queryKey: ['prompts', goalId, 'tasks_suggestion'],
    queryFn: async () => (await promptApiService.promptsGoalIdAskForTasksSuggestionPost({goalId})).suggestedTasks
  })
}