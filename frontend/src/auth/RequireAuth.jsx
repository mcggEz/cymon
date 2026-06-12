import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function RequireAuth({ roles, children }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#efeaf7] text-purple-700">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default RequireAuth
