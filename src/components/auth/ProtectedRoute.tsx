
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactElement | null
  requiredRoles?: string[]
  unauthorizedRedirectTo?: string
}

function getUserRoles(user: any): string[] {
  if (!user) return []
  if (Array.isArray(user.roles)) {
    return user.roles.map((role: any) => role?.authority || role?.name || String(role))
  }
  if (Array.isArray(user.authorities)) {
    return user.authorities.map((role: any) => role?.authority || role?.name || String(role))
  }
  if (user.roles) return [String(user.roles)]
  if (user.role) return [String(user.role)]
  if (user.authority) return [String(user.authority)]
  return []
}

export default function ProtectedRoute({
  children,
  requiredRoles,
  unauthorizedRedirectTo = '/mis-preguntas',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const normalizedRequiredRoles = requiredRoles.map((role) => String(role).toUpperCase())
    const userRoles = getUserRoles(user).map((role) => String(role).toUpperCase())
    const isAuthorized = normalizedRequiredRoles.some((requiredRole) =>
      userRoles.some((userRole) => userRole.includes(requiredRole)),
    )

    if (!isAuthorized) {
      return <Navigate to={unauthorizedRedirectTo} replace />
    }
  }

  return children
}
