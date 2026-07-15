import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../lib/api'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'

const SESSION_LABEL = {
  mmse: 'MMSE Assessment',
  cafat: 'CAFAT Assessment',
  gars: 'GARS-3 Assessment',
  initial_assessment: 'Initial Assessment',
  follow_up: 'Follow-up Session',
  therapy: 'Therapy Session',
  parent_consultation: 'Parent Consultation',
}

const StatCard = ({ value, label, sub, loading = false }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    {loading ? (
      <Skeleton className="h-8 w-16" />
    ) : (
      <div className="text-3xl font-bold text-purple-800">{value}</div>
    )}
    <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
    {sub ? <div className="mt-0.5 text-xs text-slate-500">{sub}</div> : null}
  </div>
)

const Badge = ({ children, tone = 'purple' }) => {
  const tones = {
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

function MoodChart({ points, loading = false }) {
  const max = 5
  const width = 320
  const height = 120
  if (loading) {
    return <Skeleton className="h-32 w-full" />
  }
  if (!points || points.length < 2) {
    return <div className="flex h-32 items-center justify-center text-sm text-slate-400">Not enough data yet</div>
  }
  const step = width / (points.length - 1)
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p / max) * height}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <path d={path} stroke="#7c3aed" strokeWidth="2.5" fill="none" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={height - (p / max) * height} r="3" fill="#7c3aed" />
      ))}
    </svg>
  )
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const AppointmentCard = ({ title, appt, loading = false, tone = 'purple', emptyText }) => {
  const dt = appt ? new Date(appt.starts_at) : null
  const palette =
    tone === 'slate'
      ? { bg: 'bg-slate-100', num: 'text-slate-800', sub: 'text-slate-600', meta: 'text-slate-500' }
      : { bg: 'bg-purple-100', num: 'text-purple-900', sub: 'text-purple-800', meta: 'text-purple-700' }
  return (
    <div className={`rounded-2xl ${palette.bg} p-5 shadow-sm`}>
      <div className="text-sm font-semibold text-purple-800">{title}</div>
      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      ) : appt ? (
        <>
          <div className={`mt-3 text-3xl font-bold ${palette.num}`}>{dt.getDate()}</div>
          <div className={`text-sm ${palette.sub}`}>
            {dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} ·{' '}
            {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div className={`mt-2 text-xs ${palette.meta}`}>
            {SESSION_LABEL[appt.session_type] || appt.session_type}
            <br />
            {[appt.practitioner, appt.location].filter(Boolean).join(' · ')}
          </div>
        </>
      ) : (
        <div className={`mt-3 text-sm ${palette.meta}`}>{emptyText}</div>
      )}
    </div>
  )
}

function HomeProgress() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let on = true
    api.client.home().then((d) => on && setData(d)).catch(() => {})
    return () => {
      on = false
    }
  }, [])

  const loading = !data
  const patient = data?.patient
  const clinical = data?.clinical
  const stats = data?.stats
  const next = data?.nextAppointment
  const last = data?.lastAppointment
  const nextDt = next ? new Date(next.starts_at) : null

  return (
    <>
      <PageHeader title={patient ? `Good Day, ${patient.first_name}!` : 'Welcome'} />
      <div className="flex-1 overflow-y-auto p-6">
        {stats?.assignedAssessments ? (
          <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
            {stats.assignedAssessments} new assessment{stats.assignedAssessments > 1 ? 's' : ''}
            {clinical?.clinician_name ? ` assigned by ${clinical.clinician_name}` : ''} waiting.{' '}
            <a href="/client/assessments" className="font-semibold underline">
              Complete them now
            </a>
          </div>
        ) : null}

        <section className="mt-5 rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900 p-5 text-white">
          <div className="text-sm font-medium opacity-90">
            Current developmental stage{patient ? ` for ${patient.full_name}` : ''}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {loading ? (
              <div className="h-5 w-48 rounded-full bg-white/20 animate-pulse" />
            ) : (
              <Badge tone="purple">{clinical?.iep_level || 'IEP level pending'}</Badge>
            )}
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${clinical?.milestone_progress || 0}%` }} />
          </div>
          <div className="mt-1 text-xs opacity-80">{clinical?.milestone_progress || 0}% milestone progress</div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard loading={loading} value={stats?.cbiSubmissions ?? '—'} label="CBI Submissions" />
          <StatCard loading={loading} value={stats?.iepGoalsMet ?? '—'} label="IEP Goals Met" />
          <StatCard loading={loading} value={nextDt ? fmtDate(next.starts_at) : '—'} label="Next Appointment" />
          <StatCard loading={loading} value={stats?.avgMood ?? '—'} label="Avg Mood (7 days)" />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-3 text-sm font-semibold text-purple-800">7-Day Mood Trend</div>
            <MoodChart points={data?.moodSeries} loading={loading} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <AppointmentCard
              title="Next Appointment"
              appt={next}
              loading={loading}
              emptyText="No upcoming appointment."
            />
            <AppointmentCard
              title="Last Appointment"
              appt={last}
              loading={loading}
              tone="slate"
              emptyText="No past appointment yet."
            />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Clinic Updates</div>
            <ul className="mt-3 space-y-3 text-sm">
              {loading ? (
                <li><SkeletonText lines={3} /></li>
              ) : (data?.announcements || []).length === 0 ? (
                <li className="text-slate-500">No recent updates.</li>
              ) : (
                (data?.announcements || []).map((a) => (
                  <li key={a.id} className="border-l-2 border-purple-400 pl-3">
                    <div className="font-medium text-slate-800">{a.title}</div>
                    <div className="text-xs text-slate-500">{fmtDate(a.publish_date)}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Latest Clinician Notes</div>
            {loading ? (
              <div className="mt-3"><SkeletonText lines={3} /></div>
            ) : clinical?.notes ? (
              <div className="mt-3 rounded-md bg-purple-50 p-3 text-sm text-slate-700">
                <div className="font-medium text-purple-800">
                  {clinical.clinician_name || 'Clinician'} · {fmtDate(clinical.updated_at)}
                </div>
                <p className="mt-1">{clinical.notes}</p>
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">No clinician notes yet.</div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default HomeProgress
