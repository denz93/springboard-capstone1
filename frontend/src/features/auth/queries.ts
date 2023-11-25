import { useNavigate } from "react-router-dom"
import { AUTH_HEADER_KEY, FetchResponseError } from "../../api-config"
import { AuthApi, AuthRegisterPostRequest, GetUserOutput, getApiService } from "../../api-service-factory"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {useLocalStorage} from '@uidotdev/usehooks'
import { useCallback } from "react"
import {signOut} from './auth-providers'

const authApiService = getApiService(AuthApi)

export function useAuth() {
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      return (await authApiService.authCurrentUserPost()).user
    },
    
  })
  return {
    currentUser,
    isAuthenticated: !!currentUser,
    logout: useLogout()
  }
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [__, setAuthToken] = useLocalStorage<string|null>(AUTH_HEADER_KEY)

  return useMutation<GetUserOutput, FetchResponseError, string>({
    mutationFn: async (idtoken: string) => (await authApiService.authSigninPost({signIn: {firebaseIdToken: idtoken}})),
    async onSuccess(data) {
      queryClient.setQueryData(['auth', 'currentUser'], data.user)
      setAuthToken(data.token??'')
      navigate('/')
    },
    
  })
}

export function useRegisterMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [__, setAuthToken] = useLocalStorage<string|null>(AUTH_HEADER_KEY)

  return useMutation({
    mutationFn: async (input: AuthRegisterPostRequest["register"]) => (await authApiService.authRegisterPost({register: input})),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'currentUser'], data.user)
      setAuthToken(data.token??'')
      navigate('/')
    }
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [__, setAuthToken] = useLocalStorage<string|null>(AUTH_HEADER_KEY)

  return useCallback(() => {
    setAuthToken('')
    queryClient.setQueryData(['auth', 'currentUser'], null)
    navigate('/')
    signOut()
  }, [queryClient, setAuthToken, navigate])
}

