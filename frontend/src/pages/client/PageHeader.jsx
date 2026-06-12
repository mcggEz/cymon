import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Butterfly = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
    <ellipse cx="60" cy="60" rx="2.5" ry="30" fill="currentColor" />
    <ellipse cx="40" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="80" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="44" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
    <ellipse cx="76" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
  </svg>
)

function PageHeader({ title, subtitle }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center justify-between border-b border-purple-100 bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <Butterfly className="h-8 w-8 text-purple-700" />
        <div>
          <div className="text-lg font-semibold text-purple-800 leading-tight">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
        </div>
      </div>
      <div className="flex items-center gap-3 text-purple-700">
        <button className="relative rounded-md p-2 hover:bg-purple-50" aria-label="Notifications">
          <Icon d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5zM10 20h4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button
          className="rounded-md p-2 hover:bg-purple-50"
          aria-label="Log out"
          onClick={handleLogout}
        >
          <Icon d="M14 4h5v16h-5M14 12H4M8 8l-4 4 4 4" />
        </button>
      </div>
    </header>
  )
}

export default PageHeader
