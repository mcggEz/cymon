import StaffLayout from './StaffLayout'

const NAV = [
  { to: '/speech', label: 'CASELOAD', d: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', end: true },
  { to: '/speech/reports', label: 'ROUTED REPORTS', d: 'M6 4h9l3 3v13H6zM9 12h6M9 16h6' },
  { to: '/speech/sessions', label: 'SESSION NOTES', d: 'M8 4h9a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2zM9 9h7M9 13h7M9 17h5' },
  { to: '/speech/goals', label: 'GOALS & PROGRESS', d: 'M4 20l5-9 4 5 7-12' },
]

function SpeechLayout() {
  return (
    <StaffLayout
      user={{ name: 'Speech Therapist', id: 'Speech-Language Pathologist' }}
      profileTo="/speech"
      nav={NAV}
      outletContext={{ discipline: 'Speech' }}
    />
  )
}

export default SpeechLayout
