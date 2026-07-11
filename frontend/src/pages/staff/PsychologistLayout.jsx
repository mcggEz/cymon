import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'

const NAV = [
  { to: '/psychologist', label: 'Approvals', d: 'M9 12l2 2 4-4M5 6h14v14H5z', end: true },
  { to: '/psychologist/data-review', label: 'Data Review', d: 'M5 5h14v14H5zM9 12l2 2 4-4' },
  { to: '/psychologist/activity', label: 'Daily Activity Report', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/psychologist/progress', label: 'Monthly Summary Progress', d: 'M4 20l5-9 4 5 7-12' },
  { to: '/psychologist/reports', label: 'Drafting Reports', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
]

function PsychologistLayout() {
  const { profile } = useAuth()
  return (
    <StaffLayout
      user={{ name: profile?.display_name || 'Psychologist', id: 'Psychologist' }}
      profileTo="/psychologist"
      nav={NAV}
    />
  )
}

export default PsychologistLayout
