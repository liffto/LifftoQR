import type { SessionData, User } from '../types/auth'

const SESSION_KEY = 'affinityx.session'

const readSession = (): SessionData => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return { user: null, accessToken: null, refreshToken: null }
    }
    const parsed = JSON.parse(raw) as SessionData
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    }
  } catch {
    return { user: null, accessToken: null, refreshToken: null }
  }
}

const writeSession = (session: SessionData): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function saveUser(user: User, accessToken?: string | null, refreshToken?: string | null): void {
  const current = readSession()
  writeSession({
    user,
    accessToken: accessToken ?? current.accessToken,
    refreshToken: refreshToken ?? current.refreshToken,
  })
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  const current = readSession()
  writeSession({
    ...current,
    accessToken,
    refreshToken,
  })
}

export function getUser(): User | null {
  return readSession().user
}

export function getAccessToken(): string | null {
  return readSession().accessToken
}

export function getRefreshToken(): string | null {
  return readSession().refreshToken
}

export function getSession(): SessionData {
  return readSession()
}

export function clearUser(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function hasStoredSession(): boolean {
  const session = readSession()
  return Boolean(session.accessToken || session.refreshToken)
}
