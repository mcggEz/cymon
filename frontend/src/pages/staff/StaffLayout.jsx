import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { SidebarContext } from '../../components/sidebarContext'
import { useAuth } from '../../auth/useAuth'
import { roleOptions } from '../../lib/roleNav'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function StaffLayout({ user, nav, outletContext }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cymon.sidebarCollapsed') === '1'
    } catch {
      return false
    }
  })
  const close = () => setOpen(false)
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

  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [roleOpen, setRoleOpen] = useState(false)
  const [activeRoleKey, setActiveRoleKey] = useState(() => {
    try {
      return localStorage.getItem('cymon.activeRole') || ''
    } catch {
      return ''
    }
  })
  const pickRole = (roleKey) => {
    try {
      localStorage.setItem('cymon.activeRole', roleKey)
    } catch {
      // ignore storage errors (private mode)
    }
    setActiveRoleKey(roleKey)
  }

  const roles = roleOptions(profile)
  const onPath = (r) => location.pathname === r.path || location.pathname.startsWith(`${r.path}/`)
  // Several roles can share one dashboard (e.g. psychologist + speech), so the
  // active role is the stored pick among those matching the current path.
  const matching = roles.filter(onPath)
  const activeRole = matching.find((r) => r.role === activeRoleKey) || matching[0] || null
  const subtitle = roles.length > 1 && activeRole ? activeRole.label : user.id

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setOpen(true), collapsed, toggleCollapsed }}>
      <div className="flex h-dvh bg-[#efeaf7]">
        {open ? (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} aria-hidden="true" />
        ) : null}
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
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 top-3 rounded-md p-1.5 text-white/80 hover:bg-white/10 lg:hidden"
          >
            <Icon d="M6 6l12 12M18 6L6 18" />
          </button>

          <div
            className={[
              'flex items-center gap-3 py-4',
              collapsed ? 'px-5 lg:justify-center lg:px-2' : 'px-5',
            ].join(' ')}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15">
              <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" className="h-6 w-6" />
            </div>
            <div className={['min-w-0 flex-1', collapsed ? 'lg:hidden' : ''].join(' ')}>
              <div className="truncate text-sm font-semibold leading-tight">{user.name}</div>
              <div className="text-[10px] tracking-wider text-purple-200/80">{subtitle}</div>
            </div>
          </div>

          {/* Change role — for employees holding more than one dashboard */}
          {roles.length > 1 ? (
            <div className={['px-3 pb-2', collapsed ? 'lg:hidden' : ''].join(' ')}>
              <button
                type="button"
                onClick={() => setRoleOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                aria-expanded={roleOpen}
              >
                <span className="flex items-center gap-2">
                  <Icon d="M4 7h13l-3-3M20 17H7l3 3" />
                  Change Role
                </span>
                <Icon d="M6 9l6 6 6-6" className="h-4 w-4" />
              </button>
              {roleOpen ? (
                <div className="mt-1 space-y-0.5 rounded-md bg-black/10 p-1">
                  {roles.map((r) => {
                    const isActive = activeRole?.role === r.role
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          setRoleOpen(false)
                          close()
                          pickRole(r.role)
                          if (!onPath(r)) navigate(r.path)
                        }}
                        className={[
                          'flex w-full items-center justify-between rounded px-2 py-1.5 text-xs',
                          isActive ? 'bg-white/15 font-semibold text-white' : 'text-purple-100/90 hover:bg-white/10',
                        ].join(' ')}
                      >
                        {r.label}
                        {isActive ? <span className="text-[10px] text-purple-200/70">Current</span> : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          <nav className={['flex-1', collapsed ? 'px-3 lg:px-2' : 'px-3'].join(' ')}>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={close}
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

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet context={outletContext} />
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default StaffLayout
