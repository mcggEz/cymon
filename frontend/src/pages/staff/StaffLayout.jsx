import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { SidebarContext } from '../../components/sidebarContext'

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

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setOpen(true) }}>
      <div className="flex h-dvh bg-[#efeaf7]">
        {open ? (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} aria-hidden="true" />
        ) : null}
        <aside
          className={[
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-all duration-300',
            'lg:static lg:z-auto lg:translate-x-0',
            collapsed ? 'lg:w-20' : 'lg:w-64',
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
              collapsed ? 'px-5 lg:flex-col lg:items-center lg:gap-2 lg:px-2' : 'px-5',
            ].join(' ')}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15">
              <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" className="h-6 w-6" />
            </div>
            <div className={['min-w-0 flex-1', collapsed ? 'lg:hidden' : ''].join(' ')}>
              <div className="truncate text-sm font-semibold leading-tight">{user.name}</div>
              <div className="text-[10px] tracking-wider text-purple-200/80">{user.id}</div>
            </div>
            {/* Show / hide sidebar (desktop) */}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
              title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
              className="hidden shrink-0 rounded-md p-1.5 text-white/70 hover:bg-white/10 lg:inline-flex"
            >
              <Icon d={collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
            </button>
          </div>

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
