import { api } from './axios'
import type { ApiUserResponse, LoginResponse, TokenPair } from '../types/auth'

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/google', {
    id_token: idToken,
  })
  return data
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  return data
}

export async function getCurrentUser(): Promise<ApiUserResponse> {
  const { data } = await api.get<ApiUserResponse>('/auth/me')
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export function mapApiUser(user: ApiUserResponse) {
  const first = user.first_name?.trim() ?? ''
  const last = user.last_name?.trim() ?? ''
  const name =
    first && last && first.toLowerCase() === last.toLowerCase()
      ? first
      : [first, last].filter(Boolean).join(' ').trim() || user.email

  return {
    id: user.id,
    email: user.email,
    name,
    picture: user.picture ?? null,
    first_name: user.first_name,
    last_name: user.last_name,
    account_id: user.account_id,
    roles: user.roles,
    is_superuser: user.is_superuser,
  }
}
