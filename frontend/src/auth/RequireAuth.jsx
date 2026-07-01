import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function RequireAuth({ roles, children }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#efeaf7] text-purple-700">
        <img
          src="/logo-cymon.png"
          alt="CyMon"
          className="h-16 w-16 animate-pulse rounded-2xl object-cover shadow-sm"
        />
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
