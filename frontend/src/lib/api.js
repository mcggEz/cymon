// Strip any trailing slash so `${BASE}/api/...` never produces `//api/...`
// (a `//` makes Vercel 308-redirect, which a CORS preflight can't follow).
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

const SESSION_KEY = 'cymon.session'

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const session = getStoredSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

export const api = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me', { auth: true }),
  health: () => request('/api/health'),
  client: {
    getPatient: () => request('/api/client/patient', { auth: true }),
    createPatient: (payload) => request('/api/client/patient', { method: 'POST', body: payload, auth: true }),
    updatePatient: (payload) => request('/api/client/patient', { method: 'PATCH', body: payload, auth: true }),
    home: () => request('/api/client/home', { auth: true }),
    activityLogs: () => request('/api/client/activity-logs', { auth: true }),
    addActivityLog: (payload) => request('/api/client/activity-logs', { method: 'POST', body: payload, auth: true }),
    appointments: () => request('/api/client/appointments', { auth: true }),
    announcements: () => request('/api/client/announcements', { auth: true }),
    waivers: () => request('/api/client/waivers', { auth: true }),
    submitWaiver: (code, payload) =>
      request(`/api/client/waivers/${code}`, { method: 'POST', body: payload, auth: true }),
    assessments: () => request('/api/client/assessments', { auth: true }),
    assessmentTemplate: (id) => request(`/api/client/assessments/${id}`, { auth: true }),
    submitAssessment: (id, payload) =>
      request(`/api/client/assessments/${id}/submit`, { method: 'POST', body: payload, auth: true }),
  },
  admin: {
    overview: () => request('/api/admin/overview', { auth: true }),
    patients: () => request('/api/admin/patients', { auth: true }),
    compliance: () => request('/api/admin/compliance', { auth: true }),
    schedule: () => request('/api/admin/schedule', { auth: true }),
    documents: () => request('/api/admin/documents', { auth: true }),
    announcements: () => request('/api/admin/announcements', { auth: true }),
    createAnnouncement: (payload) =>
      request('/api/admin/announcements', { method: 'POST', body: payload, auth: true }),
    scoring: () => request('/api/admin/scoring', { auth: true }),
  },
  psychologist: {
    approvals: () => request('/api/psychologist/approvals', { auth: true }),
    roster: () => request('/api/psychologist/roster', { auth: true }),
    mainstreaming: () => request('/api/psychologist/mainstreaming', { auth: true }),
    interventions: () => request('/api/psychologist/interventions', { auth: true }),
    progress: () => request('/api/psychologist/progress', { auth: true }),
  },
  psychometrician: {
    tasks: () => request('/api/psychometrician/tasks', { auth: true }),
    assessments: () => request('/api/psychometrician/assessments', { auth: true }),
    dataReview: () => request('/api/psychometrician/data-review', { auth: true }),
    reports: () => request('/api/psychometrician/reports', { auth: true }),
    activityLogs: () => request('/api/psychometrician/activity-logs', { auth: true }),
  },
}
