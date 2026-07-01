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
  const [showNotifs, setShowNotifs] = useState(false)
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
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // header is non-critical; a failed fetch just leaves the bell empty
  const loadNotifications = () =>
    api.client
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

  const toggleNotifs = async () => {
    const next = !showNotifs
    setShowNotifs(next)
    if (next && unread > 0) {
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      try {
        await api.client.markNotificationsRead()
      } catch {
        loadNotifications()
      }
    }
  }

  const handleNotifClick = (notif) => {
    setShowNotifs(false)
    if (notif.link) navigate(notif.link)
  }

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
        <TodayDate />
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifs}
            className="relative cursor-pointer rounded-md p-2 transition-colors hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={showNotifs}
          >
            <Icon d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5zM10 20h4" />
            {unread > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-100 bg-white text-left shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                    {unread} new
                  </span>
                )}
              </div>
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
