// Enrollment is a 3-step wizard across separate routes (Personal → Guardian →
// Clinical). The collected data is stashed in sessionStorage between steps and
// submitted as one createPatient call on the final step.
const KEY = 'cymon.setupDraft'

export const getSetupDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export const mergeSetupDraft = (patch) => {
  const next = { ...getSetupDraft(), ...patch }
  sessionStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export const clearSetupDraft = () => sessionStorage.removeItem(KEY)
