import {GoogleAuthProvider, signInWithEmailAndPassword as signInWithPassword, createUserWithEmailAndPassword, signInWithRedirect, type User} from 'firebase/auth'
import {auth} from '@/firebase'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiConfig, localFetch } from '../../api-config'
export {FirebaseError} from 'firebase/app'
export {type UserCredential} from 'firebase/auth'
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')
googleProvider.setCustomParameters({redirect_me: 'test'})

export async function signInWithGoogle() {
  return await signInWithRedirect(auth, googleProvider)
}

export async function signInWithEmailAndPassword(
  email: string,
  password: string
) {
  return await signInWithPassword(auth, email, password)
}

export async function getSignInMethodsForEmail(email: string) {
  const res = await localFetch(apiConfig.basePath + '/auth/provider/' + email, {
    method: 'POST'
  })
  const data = await res.json()
  return data as {provider: string | null}
}

export async function registerUserWithEmailAndPassword(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export function useFirebaseState() {
  const [user, setUser] = useState<User|null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => unsub()
  })

  useEffect(() => {
    const unsub = auth.beforeAuthStateChanged(() => {
      setIsLoading(true)
    })
    return () => unsub()
  })

  return {
    user, 
    isLoading, 
    signOut,
    signInWithGoogle,
    signInWithEmailAndPassword,
    getSignInMethodsForEmail,
    registerUserWithEmailAndPassword
  }
}

export async function signOut() {
  return await auth.signOut()
}

const PROVIDER_REDIRECT_PARAM_KEY = 'provider_redirect'
export function useProviderRedirectParam() {
  const [params, setParams] = useSearchParams(new URLSearchParams({[PROVIDER_REDIRECT_PARAM_KEY]: ''}))
  const [isRedirecting, setIsRedirecting] = useState(false)

  const setProvider = useCallback((provider: string) => {
    setIsRedirecting(true)
    setParams(prev => { 
      const newParams = new URLSearchParams(prev)
      newParams.set(PROVIDER_REDIRECT_PARAM_KEY, provider)
      newParams.set('redirected_at', String(Date.now()))
      return newParams
  })
  }, [setParams])

  const clearProvider = useCallback(() => {
    setParams(prev => { 
      const newParams = new URLSearchParams(prev)
      newParams.set(PROVIDER_REDIRECT_PARAM_KEY, '')
      newParams.set('redirected_at', '')
      return newParams
  })
  },[setParams])

  const redirectedAt = params.get('redirected_at')
  const isRedirectedAtExist = redirectedAt !== null && redirectedAt !== '' && redirectedAt !== undefined

  return {
    provider: params.get(PROVIDER_REDIRECT_PARAM_KEY), 
    setProvider,
    clearProvider,
    redirectedAt,
    isRedirecting,
    isRedirected: isRedirectedAtExist && Date.now() - parseInt(redirectedAt) > 2000
  }
}