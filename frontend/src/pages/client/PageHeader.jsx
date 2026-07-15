import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useSidebar } from '../../components/sidebarContext'
import TodayDate from '../../components/ui/TodayDate'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function PageHeader({ title }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { openSidebar, collapsed, toggleCollapsed } = useSidebar()
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
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
          title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
          className="hidden shrink-0 rounded-md p-2 text-purple-700 hover:bg-purple-50 lg:inline-flex"
        >
          <Icon d="M4 5h16v14H4zM9 5v14" />
        </button>
        <div>
          <div className="text-lg font-semibold text-purple-800 leading-tight">{title}</div>
        </div>
      </div>
      <div className="relative z-50 flex items-center gap-3 text-purple-700">
        <TodayDate />

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
