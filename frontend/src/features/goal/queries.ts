import {useInfiniteQuery, useQuery, useQueryClient, useMutation} from '@tanstack/react-query'
import { GoalsApi, getApiService, Goal, CategoriesApi } from '../../api-service-factory'
import {CreateGoalInputSchema} from './CreateGoal.schema'
import {z} from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAlert } from '../alert/hooks'
import { apiConfig, localFetch } from '../../api-config'
const goalApiService = getApiService(GoalsApi)
const categoryApiService = getApiService(CategoriesApi)

const GoalFromJSON = (jsonValue: Record<string, unknown>) => {
  return {
    title: 'title' in jsonValue ? jsonValue.title : undefined,
    description: 'description' in jsonValue ? jsonValue.description : undefined,
    id: 'id' in jsonValue  ? jsonValue.id : undefined,
    isCompleted: 'is_completed' in jsonValue ? jsonValue.is_completed : false,
    startDate: 'start_date' in jsonValue ? new Date(jsonValue.start_date as number) : undefined,
    endDate: 'end_date' in jsonValue ? new Date(jsonValue.end_date as number) : undefined,
  } as Goal
}

const CreateGoalInputToJSON = (goal: z.infer<typeof CreateGoalInputSchema>) => {
  return {
    title: goal.title ? goal.title : undefined,
    description: 'description' in goal && goal.description !== "" && goal.description !== null ? goal.description : undefined,
    is_completed: 'isCompleted' in goal ? goal.isCompleted : undefined,
    start_date: goal.startDate ? goal.startDate : undefined,
    end_date: goal.endDate ? goal.endDate : undefined,
    category_id: goal.categoryId ? goal.categoryId : undefined,
  }
}
const createGoal = async (input: z.infer<typeof CreateGoalInputSchema>) => {
  const res = (await localFetch(`${apiConfig.basePath}/goals/`, {
    method: 'POST', 
    body: JSON.stringify(CreateGoalInputToJSON(input)),

  }))
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return {
    goal: GoalFromJSON((await res.json()).goal)
  }
}
export function useGoals() {
  const query =  useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ['goals'],
    queryFn: async ({pageParam}) => (await goalApiService.goalsGet({page: pageParam}))
    ,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined
      if (!lastPage.pagination) return undefined
      if (lastPage.pagination.page === undefined) return undefined
      if (lastPage.pagination.total === undefined) return undefined
      const {page, total} = lastPage.pagination
      return page >= total 
        ? undefined 
        : page + 1
    }, 
    getPreviousPageParam: (firstPage) => {
      if (!firstPage) return undefined
      if (!firstPage.pagination) return undefined
      if (firstPage.pagination.page === undefined) return undefined
      if (firstPage.pagination.total === undefined) return undefined
      const {page} = firstPage.pagination
      return page <= 1 
        ? undefined 
        : page - 1
    }
  })
  return query
}

export function useGoal (goalId: NonNullable<Goal['id']>) {
  return useQuery({
    queryKey: ['goals', goalId],
    queryFn: async () => (await goalApiService.goalsGoalIdGet({goalId})).goal,
    select(goal){
      if (!goal) return undefined

      const today = new Date()
      const goalStatus = goal.isCompleted 
        ? 'completed'
        : !goal.startDate || !goal.endDate
          ? 'invalid date'
          : today < goal.startDate
            ? 'planning'
            : today > goal.endDate 
              ? 'overdue'
              : 'in progress'

      return {
        ...goal,
        status: goalStatus
      }
    }
  })
}

export function useCreateGoalMutation() {
  const queryClient = useQueryClient()
  const navigage = useNavigate()
  const {push} = useAlert()

  return useMutation({
    mutationKey: ['goals', 'create'],
    mutationFn: async (input: z.infer<typeof CreateGoalInputSchema>) => (await createGoal(input)).goal,
    onSuccess: (goal) => {
      queryClient.invalidateQueries({
        queryKey: ['goals']
      })
      push({message: 'Goal created successfully', type: 'success'})
      
      navigage(`/goals/${goal.id}`)
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  const navigage = useNavigate()
  const {push} = useAlert()

  return useMutation({
    mutationKey: ['goals', 'delete'],
    mutationFn: async (goalId: number) => (await goalApiService.goalsGoalIdDelete({goalId})).goal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['goals']
      })
      push({message: 'Goal deleted successfully', type: 'success'})
      navigage('/')
    },
  })
}

export function useCategoryHierarchy() {
  return useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: async () => ((await categoryApiService.categoriesHierarchyGet()).hierarchy??[]).map(v => ({...v, children: v.children ?? []}))
  })
}