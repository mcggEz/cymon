import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'

const NAV = [
  { to: '/occupational', label: 'Caseload', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', end: true },
  { to: '/occupational/reports', label: 'Routed Reports', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
  { to: '/occupational/sessions', label: 'Session Notes', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/occupational/goals', label: 'Goals & Progress', d: 'M4 20l5-9 4 5 7-12' },
]

function OccupationalLayout() {
  const { profile } = useAuth()
  return (
    <StaffLayout
      user={{ name: profile?.display_name || 'Occupational Therapist', id: 'Occupational Therapist' }}
      profileTo="/occupational"
      nav={NAV}
      outletContext={{ discipline: 'Occupational' }}
    />
  )
}

export default OccupationalLayout
