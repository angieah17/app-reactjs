
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactElement | null
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
