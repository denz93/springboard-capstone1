import { Configuration } from 'generated_client'
import { apiConfig } from './api-config'
import { BaseAPI } from 'generated_client'
export * from 'generated_client/index'

type CtorApiType<T extends BaseAPI> = new (config?: Configuration) => T

const cache: Map<CtorApiType<BaseAPI>, BaseAPI> = new Map() 

export function getApiService<T extends BaseAPI>(ctor: CtorApiType<T>): T {
  if (!cache.has(ctor))
    cache.set(ctor, new ctor(apiConfig))
  return cache.get(ctor) as T
}
