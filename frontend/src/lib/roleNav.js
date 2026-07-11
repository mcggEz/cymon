// Maps each role to the dashboard it opens. Speech and occupational therapists
// share the psychometrician portal (per the clinic); psychologist stands alone.
export const ROLE_DEST = {
  admin: { label: 'Administrator', path: '/admin' },
  psychologist: { label: 'Psychologist', path: '/psychologist' },
  psychometrician: { label: 'Psychometrician', path: '/psychometrician' },
  speech_therapist: { label: 'Speech Therapist', path: '/psychometrician' },
  occupational_therapist: { label: 'Occupational Therapist', path: '/psychometrician' },
}

// Every role a profile holds (primary + extra), de-duplicated by role. Roles
// that share a dashboard (psychometrician / speech / occupational all open
// /psychometrician) each keep their own entry so the sidebar can switch between
// them as acting-role labels. Each entry is { role, label, path }.
export function roleOptions(profile) {
  const roles = [profile?.role, ...(profile?.extra_roles || [])].filter(Boolean)
  const seen = new Set()
  const out = []
  for (const r of roles) {
    const dest = ROLE_DEST[r]
    if (!dest || seen.has(r)) continue
    seen.add(r)
    out.push({ role: r, ...dest })
  }
  return out
}
