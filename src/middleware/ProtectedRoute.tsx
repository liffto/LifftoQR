import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthLoadingScreen, useAuth } from '../context/AuthContext'
import { useLoginModal } from '../context/LoginModalContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const { openLogin } = useLoginModal()
  const { pathname } = useLocation()

  // Landing on a protected URL while signed out drops the visitor on the public
  // home page with the sign-in dialog over it, remembering where they were
  // headed — rather than bouncing them to a dead-end page they can't leave.
  const locked = !loading && !isAuthenticated
  useEffect(() => {
    if (locked) openLogin(pathname)
  }, [locked, pathname, openLogin])

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
