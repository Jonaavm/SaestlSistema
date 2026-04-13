import { Navigate, useLocation } from 'react-router'
import { DashboardLayout } from '../../pages/DashboardLayout'
import { getAuthUser, isAuthenticated } from '../../lib/auth'

export function ProtectedLayout() {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const user = getAuthUser()
  if (user?.role === 'consulta' && location.pathname !== '/reportes') {
    return <Navigate to="/reportes" replace />
  }

  return <DashboardLayout />
}
