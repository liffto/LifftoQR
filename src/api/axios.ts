import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  clearUser,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../services/session'
import type { TokenPair } from '../types/auth'

const AUTH_SKIP_PATHS = [
  '/auth/login',
  '/auth/google',
  '/auth/register',
  '/auth/refresh',
  '/auth/token',
]

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

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
let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

export function setLogoutHandler(handler: (() => void) | null): void {
  logoutHandler = handler
}

function shouldSkipUnauthorized(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_SKIP_PATHS.some((path) => url.includes(path))
}

function processRefreshQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  refreshQueue = []
}

function forceLogout(): void {
  clearUser()
  logoutHandler?.()
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const { data } = await axios.post<TokenPair>(
    `${resolveApiBaseUrl()}/auth/refresh`,
    { refresh_token: refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  )

  if (!data.access_token) {
    throw new Error('Refresh response did not include an access token')
  }

  saveTokens(data.access_token, data.refresh_token || refreshToken)
  return data.access_token
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Let the browser set multipart boundary for file uploads.
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      status !== 401 ||
      !originalRequest ||
      shouldSkipUnauthorized(originalRequest.url) ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      forceLogout()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest as AxiosRequestConfig))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const newAccessToken = await refreshAccessToken()
      processRefreshQueue(null, newAccessToken)
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest as AxiosRequestConfig)
    } catch (refreshError) {
      processRefreshQueue(refreshError, null)
      forceLogout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
