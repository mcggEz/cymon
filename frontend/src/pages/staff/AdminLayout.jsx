import StaffLayout from './StaffLayout'

const NAV = [
  { to: '/admin', label: 'OVERVIEW', d: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', end: true },
  { to: '/admin/patients', label: 'PATIENTS', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
  { to: '/admin/compliance', label: 'COMPLIANCE', d: 'M5 5h14v14H5zM9 12l2 2 4-4' },
  { to: '/admin/schedule', label: 'SCHEDULE', d: 'M4 7h16v13H4zM4 11h16M8 3v4M16 3v4' },
  { to: '/admin/scoring', label: 'SCORING ANALYTICS', d: 'M4 20l5-9 4 5 7-12' },
  { to: '/admin/documents', label: 'DOCUMENT VAULT', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
  { to: '/admin/announcements', label: 'ANNOUNCEMENTS', d: 'M4 11l16-7v16zM4 11v4l3 1v4' },
]

function AdminLayout() {
  return (
    <StaffLayout
      user={{ name: 'Mr. Marwin Gilbero Jr.', id: 'CMPS-ADMIN-2026-001' }}
      profileTo="/admin"
      nav={NAV}
    />
  )
}

export default AdminLayout
