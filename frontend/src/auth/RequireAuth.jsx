import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import LoadingScreen from '../components/ui/LoadingScreen'

function RequireAuth({ roles, children }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && profile) {
    const mine = [profile.role, ...(profile.extra_roles || [])]
    if (!mine.some((r) => roles.includes(r))) {
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default RequireAuth
