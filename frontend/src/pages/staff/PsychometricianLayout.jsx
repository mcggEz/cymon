import StaffLayout from './StaffLayout'
import { useAuth } from '../../auth/useAuth'
import { ROLE_DEST } from '../../lib/roleNav'

const NAV = [
  { to: '/clinical', label: 'Tasks', d: 'M5 5h14v14H5zM9 9h6M9 13h6M9 17h4', end: true },
  { to: '/clinical/assessments', label: 'Assessments', d: 'M7 4h10l1 3v13H6V7z' },
  { to: '/clinical/data-review', label: 'Data Review', d: 'M5 5h14v14H5zM9 12l2 2 4-4' },
  { to: '/clinical/activity', label: 'Daily Activity Log', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/clinical/reports', label: 'Drafting Reports', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
]

function PsychometricianLayout() {
  const { profile } = useAuth()
  const roleLabel = ROLE_DEST[profile?.role]?.label || 'Psychometrician'
  return (
    <StaffLayout
      user={{ name: profile?.display_name || roleLabel, id: roleLabel }}
      profileTo="/clinical"
      nav={NAV}
    />
  )
}

export default PsychometricianLayout
