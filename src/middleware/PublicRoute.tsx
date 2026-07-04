import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthLoadingScreen, useAuth } from '../context/AuthContext'

interface PublicRouteProps {
  children: ReactNode
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
