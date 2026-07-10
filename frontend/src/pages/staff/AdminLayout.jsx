import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'

const NAV = [
  { to: '/admin/overview', label: 'Overview', d: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { to: '/admin/patients', label: 'Patients', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0' },
  { to: '/admin/employees', label: 'Employees', d: 'M9 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 20a6 6 0 0 1 12 0M18 8v6M21 11h-6' },
  { to: '/admin/compliance', label: 'Compliance', d: 'M5 5h14v14H5zM9 12l2 2 4-4' },
  { to: '/admin/schedule', label: 'Schedule', d: 'M4 7h16v13H4zM4 11h16M8 3v4M16 3v4' },
  { to: '/admin/scoring', label: 'Scoring Analytics', d: 'M4 20l5-9 4 5 7-12' },
  { to: '/admin/assessments', label: 'Assessment Services', d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4' },
  { to: '/admin/records', label: 'Clinical Records', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
  { to: '/admin/announcements', label: 'Announcements', d: 'M4 11l16-7v16zM4 11v4l3 1v4' },
  { to: '/admin/audit', label: 'Audit Trail', d: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { to: '/admin/surveys', label: 'Survey Results', d: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
]

function AdminLayout() {
  const { profile } = useAuth()
  return (
    <StaffLayout
      user={{ name: profile?.display_name || 'Administrator', id: 'Administrator' }}
      profileTo="/admin"
      nav={NAV}
    />
  )
}

export default AdminLayout
