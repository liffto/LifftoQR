import type { AxiosError } from 'axios'
import type { ApiResponse } from '../types/auth'

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error) return fallback

  const axiosError = error as AxiosError<ApiResponse>
  const code = axiosError.code

  if (code === 'ERR_NETWORK' || !axiosError.response) {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  const status = axiosError.response.status
  const detail = axiosError.response.data?.detail

  if (status === 401) {
    if (typeof detail === 'string' && /google|token|expired/i.test(detail)) {
      return 'Your Google sign-in expired. Please try again.'
    }
    return 'Your session has expired. Please sign in again.'
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (status >= 500) {
    return 'The server encountered an error. Please try again later.'
  }

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.message || String(item))
      .join(', ')
  }

  const message = axiosError.response.data?.message
  if (typeof message === 'string') return message

  if (error instanceof Error && error.message) return error.message

  return fallback
}
