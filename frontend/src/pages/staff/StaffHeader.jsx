import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useSidebar } from '../../components/sidebarContext'
import { api } from '../../lib/api'
import TodayDate from '../../components/ui/TodayDate'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function StaffHeader({ title }) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { openSidebar, collapsed, toggleCollapsed } = useSidebar()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

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

  // header is non-critical; a failed fetch just leaves the bell empty
  const loadNotifications = () =>
    api
      .notifications()
      .then((data) => {
        setNotifications(data.notifications)
        setUnread(data.unread)
      })
      .catch(() => {})

  useEffect(() => {
    const id = setInterval(loadNotifications, 60000)
    loadNotifications()
    return () => clearInterval(id)
  }, [])

  const toggleNotifications = async () => {
    const next = !showNotifications
    setShowNotifications(next)
    setShowLogoutConfirm(false)
    if (next && unread > 0) {
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      try {
        await api.markNotificationsRead()
      } catch {
        loadNotifications()
      }
    }
  }

  const handleNotifClick = (notif) => {
    setShowNotifications(false)
    if (notif.link) navigate(notif.link)
  }

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
          </div>
        </div>
        <div className="flex items-center gap-3 text-purple-700 relative z-50">
          <TodayDate />
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative rounded-md p-2 hover:bg-purple-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={showNotifications}
              onClick={toggleNotifications}
            >
              <Icon d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5zM10 20h4" />
              {unread > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden text-left">
                {/* Dropdown Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">Notifications</span>
                  {unread > 0 && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                      {unread} new
                    </span>
                  )}
                </div>
                {/* Dropdown List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      You&apos;re all caught up — no notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-purple-50/60 ${
                          n.link ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            n.read_at ? 'bg-transparent' : 'bg-purple-500'
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-slate-800">{n.title}</span>
                          {n.body ? (
                            <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{n.body}</span>
                          ) : null}
                          <span className="mt-1 block text-[10px] uppercase tracking-wide text-slate-400">
                            {timeAgo(n.created_at)}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
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
