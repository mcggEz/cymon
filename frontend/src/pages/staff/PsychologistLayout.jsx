import StaffLayout from './StaffLayout'

const NAV = [
  { to: '/psychologist', label: 'APPROVALS', d: 'M9 12l2 2 4-4M5 6h14v14H5z', end: true },
  { to: '/psychologist/roster', label: 'ROSTER OVERVIEW', d: 'M4 6h16v4H4zM4 14h16v4H4z' },
  { to: '/psychologist/mainstreaming', label: 'MAINSTREAMING', d: 'M3 17l5-5 4 4 8-9' },
  { to: '/psychologist/interventions', label: 'INTERVENTIONS', d: 'M12 4v16M4 12h16' },
  { to: '/psychologist/progress', label: 'PROGRESS', d: 'M4 20l5-9 4 5 7-12' },
]

function PsychologistLayout() {
  return (
    <StaffLayout
      user={{ name: 'Dr. Jinky Malabanan', id: 'CMPS-2026-001' }}
      profileTo="/psychologist"
      nav={NAV}
    />
  )
}

export default PsychologistLayout
