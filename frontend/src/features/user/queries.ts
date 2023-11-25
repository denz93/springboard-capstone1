import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  User } from "../../api-service-factory";
import { getApiService, UsersApi } from "../../api-service-factory";
import {z} from 'zod'

const userApiService = getApiService(UsersApi)

export const UpdateUserInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
})

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['users', 'update'],
    mutationFn: async ({
      userId,
      input
    }:{
      userId: NonNullable<User["id"]>,
      input: z.infer<typeof UpdateUserInputSchema>
    }) => (await userApiService.usersUserIdPatch({userId, updateUserInput: input})).user,
    onSuccess: (user, {userId}) => {
      queryClient.invalidateQueries({
        queryKey: ['users', userId]
      })
      queryClient.invalidateQueries({
        queryKey: ['auth', 'currentUser']
      })
      queryClient.setQueryData(['auth', 'currentUser'], user)
      queryClient.setQueryData(['users', userId], user)
    },
  })
}