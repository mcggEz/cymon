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

function StaffHeader({ title, subtitle }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { openSidebar, collapsed, toggleCollapsed } = useSidebar()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Intake Folder Verified', detail: 'Intake folder for patient Leo Cruz has been verified by Admissions.', time: '10m ago', read: false },
    { id: 2, title: 'MMSE Assessment Ready', detail: 'MMSE scoring calculation has been finalized and is routing for psychologist sign-off.', time: '1h ago', read: false },
    { id: 3, title: 'Caseload Assignment Updated', detail: 'Discipline caseload for speech therapy was updated by Dr. Cruz.', time: '3h ago', read: false },
    { id: 4, title: 'Waiver Signed', detail: 'Caregiver digital consent for developmental assessments has been signed.', time: '1d ago', read: true }
  ])

  const logoutRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutRef.current && !logoutRef.current.contains(event.target)) {
        setShowLogoutConfirm(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
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
      <header className="flex items-center justify-between border-b border-purple-100 bg-white px-4 py-3 sm:px-6 relative">
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
            {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
          </div>
        </div>
        <div className="flex items-center gap-3 text-purple-700 relative z-50">
          <TodayDate />
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative rounded-md p-2 hover:bg-purple-50 cursor-pointer"
              aria-label="Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowLogoutConfirm(false)
              }}
            >
              <Icon d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5zM10 20h4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden text-left">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Notifications ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        setUnreadCount(0)
                        setNotifications(notifications.map(n => ({ ...n, read: true })))
                      }}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {/* Dropdown List */}
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.read) {
                          setUnreadCount(Math.max(0, unreadCount - 1))
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))
                        }
                      }}
                      className={`flex items-start gap-2.5 px-4 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-purple-50/30' : ''
                      }`}
                    >
                      <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${!n.read ? 'bg-purple-600' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800 truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal mt-0.5">{n.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout Confirmation Dropdown */}
          <div className="relative" ref={logoutRef}>
            <button
              className="rounded-md p-2 hover:bg-purple-50 cursor-pointer"
              aria-label="Log out"
              onClick={() => {
                setShowLogoutConfirm(!showLogoutConfirm)
                setShowNotifications(false)
              }}
            >
              <Icon d="M14 4h5v16h-5M14 12H4M8 8l-4 4 4 4" />
            </button>
            {showLogoutConfirm && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50 text-left">
                <div className="text-sm font-semibold text-slate-800 mb-1">Sign out?</div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Are you sure you want to log out of CyMon?</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer text-center"
                  >
                    Log Out
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 rounded-lg border border-slate-200 hover:bg-slate-50 py-1.5 text-xs font-semibold text-slate-600 transition-colors cursor-pointer text-center"
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

export default StaffHeader
