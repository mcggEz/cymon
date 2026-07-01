import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'

const NAV = [
  { to: '/psychologist', label: 'Approvals', d: 'M9 12l2 2 4-4M5 6h14v14H5z', end: true },
  { to: '/psychologist/roster', label: 'Roster Overview', d: 'M4 6h16v4H4zM4 14h16v4H4z' },
  { to: '/psychologist/intake', label: 'Intake Interview', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/psychologist/progress-notes', label: 'Progress Notes', d: 'M4 6h16v4H4zM4 14h10v4H4z' },
  { to: '/psychologist/mainstreaming', label: 'Mainstreaming', d: 'M3 17l5-5 4 4 8-9' },
  { to: '/psychologist/interventions', label: 'Interventions', d: 'M12 4v16M4 12h16' },
  { to: '/psychologist/progress', label: 'Progress', d: 'M4 20l5-9 4 5 7-12' },
]

function PsychologistLayout() {
  const { profile } = useAuth()
  return (
    <StaffLayout
      user={{ name: profile?.display_name || 'Psychologist', id: 'Clinical Psychologist' }}
      profileTo="/psychologist"
      nav={NAV}
    />
  )
}

export default PsychologistLayout
