import {Configuration} from 'generated_client'
export const AUTH_HEADER_KEY = 'X-Auth-Token'

export class FetchResponseError extends Error {
  response: Response 
  body: unknown
  constructor(response: Response, message: string, body: unknown) {
    super(message)
    this.name = 'FetchResponseError'
    this.response = response
    this.body = body
  }
}
export const apiConfig: Configuration = new Configuration({
  basePath: __API_URL__,
  credentials: 'omit',
  middleware: [{
      async pre(ctx) {
          const authToken = localStorage.getItem(AUTH_HEADER_KEY)
          if (!authToken) return ctx
          ctx.init.headers = {
            [AUTH_HEADER_KEY]: authToken,
            'Content-Type': 'application/json',
          }
          return ctx
      },
      async post(ctx) {
        const res = ctx.response

        if (!res.ok) {
          const error = new FetchResponseError(res, res.statusText, await res.json())
          throw error
        }
        
        return res
      }
  }]
})

export async function localFetch (input: RequestInfo, init?: RequestInit) {
  const authToken = localStorage.getItem(AUTH_HEADER_KEY)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (authToken && authToken !== '') {
    headers[AUTH_HEADER_KEY] = authToken
  }
  const config:RequestInit = {
    mode: 'cors',
    credentials: 'omit',
    ...init,
    headers: {
      ...headers,
      ...init?.headers,
    },
  }
  return await fetch(input, config)
}