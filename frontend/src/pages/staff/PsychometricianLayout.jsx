import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'
import { ROLE_DEST } from '../../lib/roleNav'

const NAV = [
  { to: '/psychometrician', label: 'Task List', d: 'M5 5h14v14H5zM9 9h6M9 13h6M9 17h4', end: true },
  { to: '/psychometrician/assessments', label: 'Assessment Services', d: 'M7 4h10l1 3v13H6V7z' },
  { to: '/psychometrician/activity', label: 'Daily Activity Report', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/psychometrician/iep', label: 'Individualized Education Plan', d: 'M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm10 8H11v-2h8v2zm0-4H11v-2h8v2zm0-4H11V7h8v2z' },
  { to: '/psychometrician/progress', label: 'Monthly Summary Progress', d: 'M4 20l5-9 4 5 7-12' },
  { to: '/psychometrician/student-journal', label: 'Student Journal', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
]

function PsychometricianLayout() {
  const { profile } = useAuth()
  const roleLabel = ROLE_DEST[profile?.role]?.label || 'Psychometrician'
  return (
    <StaffLayout
      user={{ name: profile?.display_name || roleLabel, id: roleLabel }}
      profileTo="/psychometrician/profile"
      nav={NAV}
    />
  )
}

export default PsychometricianLayout
