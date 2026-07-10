import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { SidebarContext } from '../../components/sidebarContext'
import { api } from '../../lib/api'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const NAV = [
  { to: '/client/home', label: 'Home & Progress', d: 'M3 11l9-8 9 8M5 10v10h14V10' },
  { to: '/client/activity', label: 'Daily Activity Log', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/client/assessments', label: 'Assessment Services', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
  { to: '/client/announcements', label: 'Announcements', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h4' },
  { to: '/client/appointments', label: 'Appointments', d: 'M4 7h16v13H4zM4 11h16M8 3v4M16 3v4' },
  { to: '/client/waivers', label: 'Consents & Waivers', d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4' },
]

function Sidebar({ open, collapsed, onNavigate, name, patientId }) {
  const displayName = name || 'My Account'
  return (
    <aside
      className={[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-all duration-300',
        'lg:static lg:z-auto lg:translate-x-0',
        collapsed ? 'lg:w-24' : 'lg:w-64',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onNavigate}
        aria-label="Close menu"
        className="absolute right-3 top-3 rounded-md p-1.5 text-white/80 hover:bg-white/10 lg:hidden"
      >
        <Icon d="M6 6l12 12M18 6L6 18" />
      </button>

      <Link
        to="/client/profile"
        onClick={onNavigate}
        title={displayName}
        className={['flex items-center gap-3 py-4 hover:bg-white/5', collapsed ? 'px-5 lg:justify-center lg:px-2' : 'px-5'].join(' ')}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15">
          <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" className="h-6 w-6" />
        </div>
        <div className={['min-w-0 flex-1', collapsed ? 'lg:hidden' : ''].join(' ')}>
          <div className="truncate text-base font-semibold leading-tight">{displayName}</div>
          {patientId ? (
            <div className="text-[10px] tracking-wider text-purple-200/80">{patientId}</div>
          ) : null}
        </div>
      </Link>

      <nav className={['flex-1', collapsed ? 'px-3 lg:px-2' : 'px-3'].join(' ')}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={item.label}
            className={({ isActive }) =>
              [
                'mt-1 flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors',
                collapsed ? 'px-3 lg:justify-center lg:px-0' : 'px-3',
                isActive ? 'bg-white/15 text-white' : 'text-purple-100/90 hover:bg-white/10',
              ].join(' ')
            }
          >
            <Icon d={item.d} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={['flex items-center justify-center gap-2.5 pb-5 pt-4', collapsed ? 'px-5 lg:px-2' : 'px-5'].join(' ')}>
        <img src="/logo-cymon.png" alt="CyMon" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        <div className={['font-serif text-2xl font-semibold italic text-white', collapsed ? 'lg:hidden' : ''].join(' ')}>
          CyMon
        </div>
      </div>
    </aside>
  )
}

function ClientLayout() {
  const [open, setOpen] = useState(false)
  const [child, setChild] = useState({ name: '', patientId: '' })

  useEffect(() => {
    let on = true
    api.client
      .getPatient()
      .then((d) => on && setChild({ name: d.patient.full_name, patientId: d.patient.patient_id }))
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cymon.sidebarCollapsed') === '1'
    } catch {
      return false
    }
  })
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem('cymon.sidebarCollapsed', next ? '1' : '0')
      } catch {
        // ignore storage errors (private mode)
      }
      return next
    })

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setOpen(true), collapsed, toggleCollapsed }}>
      <div className="flex h-dvh bg-[#efeaf7]">
        {open ? (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        ) : null}
        <Sidebar
          open={open}
          collapsed={collapsed}
          onNavigate={() => setOpen(false)}
          name={child.name}
          patientId={child.patientId}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default ClientLayout
