export interface User {
  id: number
  email: string
  name: string
  picture: string | null
  /** Bumped after avatar upload so the browser reloads the image immediately. */
  pictureCacheKey?: number
  first_name?: string
  last_name?: string
  account_id?: number
  roles?: string[]
  is_superuser?: boolean
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type?: string
}

export interface LoginResponse extends TokenPair {
  user?: User
}

export interface ApiUserResponse {
  id: number
  email: string
  first_name: string
  last_name: string
  account_id: number
  roles: string[]
  is_superuser: boolean
  picture?: string | null
}

export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  detail?: string | Array<{ msg?: string; message?: string }>
}

export interface SessionData {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (session: SessionData) => void
  updateUser: (user: User) => void
  logout: () => Promise<void>
}
