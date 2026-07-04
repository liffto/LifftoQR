import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { setLogoutHandler } from '../api/axios'
import { logout as logoutRequest } from '../api/auth.api'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { CURRENT_USER_QUERY_KEY } from '../providers/QueryProvider'
import {
  clearUser,
  getAccessToken,
  getRefreshToken,
  getUser,
  hasStoredSession,
  saveUser,
} from '../services/session'
import type { AuthContextType, SessionData } from '../types/auth'
import { getApiErrorMessage } from '../utils/errors'

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const queryClientInstance = useQueryClient()
  const [bootstrapped, setBootstrapped] = useState(false)

  const shouldFetchUser = hasStoredSession()
  const currentUserQuery = useCurrentUser({ enabled: shouldFetchUser })

  const user = currentUserQuery.data ?? getUser()
  const loading =
    !bootstrapped || (shouldFetchUser && currentUserQuery.isLoading && !user)

  const login = useCallback((session: SessionData) => {
    if (session.user) {
      saveUser(session.user, session.accessToken, session.refreshToken)
      queryClientInstance.setQueryData(CURRENT_USER_QUERY_KEY, session.user)
    }
  }, [queryClientInstance])

  const performLocalLogout = useCallback(() => {
    clearUser()
    queryClientInstance.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    queryClientInstance.clear()
  }, [queryClientInstance])

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (getAccessToken()) {
        await logoutRequest()
      }
    },
    onSettled: () => {
      performLocalLogout()
      toast.success('Signed out successfully')
      navigate('/login', { replace: true })
    },
    onError: (error) => {
      performLocalLogout()
      toast.error(getApiErrorMessage(error, 'Signed out locally.'))
      navigate('/login', { replace: true })
    },
  })

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  useEffect(() => {
    if (!shouldFetchUser) {
      setBootstrapped(true)
      return
    }

    if (!currentUserQuery.isLoading) {
      if (currentUserQuery.data) {
        saveUser(
          currentUserQuery.data,
          getAccessToken(),
          getRefreshToken(),
        )
      } else if (currentUserQuery.isError) {
        clearUser()
        queryClientInstance.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      }
      setBootstrapped(true)
    }
  }, [
    shouldFetchUser,
    currentUserQuery.isLoading,
    currentUserQuery.isError,
    currentUserQuery.data,
    queryClientInstance,
  ])

  useEffect(() => {
    setLogoutHandler(() => {
      performLocalLogout()
      navigate('/login', { replace: true })
    })

    return () => setLogoutHandler(null)
  }, [navigate, performLocalLogout])

  const value = useMemo<AuthContextType>(
    () => ({
      user: user ?? null,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-ink-muted">Checking your session…</p>
      </div>
    </div>
  )
}
