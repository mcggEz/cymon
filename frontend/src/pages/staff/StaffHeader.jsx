import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useSidebar } from '../../components/sidebarContext'

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

function StaffHeader({ title, subtitle, showSearch = true }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { openSidebar } = useSidebar()
  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }
  return (
    <>
      <header className="flex items-center justify-between border-b border-purple-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open menu"
            className="rounded-md p-2 text-purple-700 hover:bg-purple-50 lg:hidden"
          >
            <Icon d="M4 6h16M4 12h16M4 18h16" />
          </button>
          <Butterfly className="h-8 w-8 shrink-0 text-purple-700" />
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
      {showSearch ? (
        <div className="border-b border-purple-100 bg-purple-200/60 px-6 py-2">
          <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm">
            <Icon d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM20 20l-4-4" className="h-4 w-4" />
            <input
              placeholder="Search Clients by name, date, assessment…"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default StaffHeader
