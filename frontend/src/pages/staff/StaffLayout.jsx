import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { SidebarContext } from '../../components/sidebarContext'

const Icon = ({ d, className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Butterfly = ({ className = '', flip = false }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
  >
    <ellipse cx="60" cy="60" rx="2.5" ry="30" fill="currentColor" />
    <ellipse cx="40" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="80" cy="46" rx="22" ry="16" fill="currentColor" opacity="0.85" />
    <ellipse cx="44" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
    <ellipse cx="76" cy="74" rx="16" ry="12" fill="currentColor" opacity="0.7" />
  </svg>
)

function StaffLayout({ user, profileTo, nav, outletContext }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <SidebarContext.Provider value={{ openSidebar: () => setOpen(true) }}>
      <div className="flex h-dvh bg-[#efeaf7]">
        {open ? (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} aria-hidden="true" />
        ) : null}
        <aside
          className={[
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-transform duration-300',
            'lg:static lg:z-auto lg:translate-x-0',
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
          <Link
            to={profileTo}
            onClick={close}
            className="flex items-center gap-3 px-5 py-5 hover:bg-white/5"
          >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold leading-tight">{user.name}</div>
            <div className="text-[10px] tracking-wider text-purple-200/80">{user.id}</div>
          </div>
          <Icon d="M9 6l6 6-6 6" />
        </Link>

        <nav className="flex-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={close}
              className={({ isActive }) =>
                [
                  'mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/15 text-white' : 'text-purple-100/90 hover:bg-white/10',
                ].join(' ')
              }
            >
              <Icon d={item.d} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 pb-5 pt-4 flex items-center justify-center gap-2 text-purple-200">
          <Butterfly className="h-8 w-8" />
          <div className="font-serif italic text-2xl font-semibold text-white">CyMon</div>
          <Butterfly className="h-8 w-8" flip />
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
