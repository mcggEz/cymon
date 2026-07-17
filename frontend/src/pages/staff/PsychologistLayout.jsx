import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'

const NAV = [
  { to: '/psychologist', label: 'Approvals', d: 'M9 12l2 2 4-4M5 6h14v14H5z', end: true },
  { to: '/psychologist/data-review', label: 'Data Review', d: 'M5 5h14v14H5zM9 12l2 2 4-4' },
  { to: '/psychologist/activity', label: 'Daily Activity Report', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/psychologist/progress', label: 'Monthly Summary Progress', d: 'M4 20l5-9 4 5 7-12' },
  { to: '/psychologist/student-journal', label: 'Student Journal', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/psychologist/reports', label: 'Drafting Reports', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
  { to: '/psychologist/assessments', label: 'Assessment Services', d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
]

function PsychologistLayout() {
  const { profile } = useAuth()
  return (
    <StaffLayout
      user={{ name: profile?.display_name || 'Psychologist', id: 'Psychologist' }}
      profileTo="/psychologist/profile"
      nav={NAV}
    />
  )
}

export default PsychologistLayout
