import { useState, useEffect, useRef } from 'react'
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

function PageHeader({ title, subtitle }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { openSidebar } = useSidebar()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const logoutRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogoutConfirm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="relative flex items-center justify-between border-b border-purple-100 bg-white px-4 py-3 sm:px-6">
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
      <div className="relative z-50 flex items-center gap-3 text-purple-700">
        <button className="relative rounded-md p-2 hover:bg-purple-50" aria-label="Notifications">
          <Icon d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5zM10 20h4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative" ref={logoutRef}>
          <button
            className="rounded-md p-2 hover:bg-purple-50 cursor-pointer"
            aria-label="Log out"
            onClick={() => setShowLogoutConfirm((v) => !v)}
          >
            <Icon d="M14 4h5v16h-5M14 12H4M8 8l-4 4 4 4" />
          </button>
          {showLogoutConfirm && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-xl ring-1 ring-black/5 z-50">
              <div className="mb-1 text-sm font-semibold text-slate-800">Sign out?</div>
              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                Are you sure you want to log out of CyMon?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 cursor-pointer rounded-lg bg-red-600 py-1.5 text-center text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Log Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 cursor-pointer rounded-lg border border-slate-200 py-1.5 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default PageHeader
