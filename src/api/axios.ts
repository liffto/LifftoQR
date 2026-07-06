import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearUser, getAccessToken } from '../services/session'

const AUTH_SKIP_PATHS = ['/auth/login', '/auth/google', '/auth/register', '/auth/refresh']

function resolveApiBaseUrl(): string {
  const backendUrl = import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, '')
  if (backendUrl) {
    return backendUrl.endsWith('/api/v1') ? backendUrl : `${backendUrl}/api/v1`
  }
  return import.meta.env.VITE_API_URL || '/api/v1'
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let logoutHandler: (() => void) | null = null

export function setLogoutHandler(handler: (() => void) | null): void {
  logoutHandler = handler
}

function shouldSkipUnauthorized(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_SKIP_PATHS.some((path) => url.includes(path))
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url

    if (status === 401 && !shouldSkipUnauthorized(url)) {
      clearUser()
      logoutHandler?.()
    }

    return Promise.reject(error)
  },
)
