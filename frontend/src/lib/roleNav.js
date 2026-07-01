// Maps each role to the dashboard it opens. Speech therapists share the
// psychometrician portal (per the clinic).
export const ROLE_DEST = {
  admin: { label: 'Administrator', path: '/admin' },
  psychologist: { label: 'Psychologist', path: '/psychologist' },
  psychometrician: { label: 'Psychometrician', path: '/psychometrician' },
  speech_therapist: { label: 'Speech Therapist', path: '/psychometrician' },
  occupational_therapist: { label: 'Occupational Therapist', path: '/occupational' },
}

// Distinct dashboards available to a profile (primary role + extra roles),
// de-duplicated by destination path.
export function roleOptions(profile) {
  const roles = [profile?.role, ...(profile?.extra_roles || [])].filter(Boolean)
  const seen = new Set()
  const out = []
  for (const r of roles) {
    const dest = ROLE_DEST[r]
    if (!dest || seen.has(dest.path)) continue
    seen.add(dest.path)
    out.push(dest)
  }
  return out
}
