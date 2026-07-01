import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function RequireAuth({ roles, children }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#efeaf7] text-purple-700">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <img
            src="/logo-cymon.png"
            alt="CyMon"
            className="absolute inset-2 h-16 w-16 rounded-full object-cover shadow-sm"
          />
        </div>
        <div className="text-sm font-medium tracking-wide text-purple-700/80">Loading…</div>
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
