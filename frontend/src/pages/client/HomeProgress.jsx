import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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



const formatDateStr = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const monthIdx = parseInt(parts[1], 10) - 1
  const day = parts[2]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = months[monthIdx] || ''
  return `${monthName} ${parseInt(day, 10)}`
}

function MoodChart({ points, loading = false }) {
  const max = 5
  const width = 450
  const height = 160
  const paddingTop = 15
  const paddingBottom = 45
  const paddingLeft = 25
  const paddingRight = 25

  if (loading) {
    return <Skeleton className="h-40 w-full" />
  }
  if (!points || points.length === 0) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-400">Not enough data yet</div>
  }

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom
  const step = chartWidth / points.length
  const barWidth = Math.max(step * 0.6, 4)

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full overflow-visible">
        {/* Draw horizontal reference lines */}
        {[1, 2, 3, 4, 5].map((val) => {
          const y = paddingTop + chartHeight - (val / max) * chartHeight
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f3e8ff"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 text-[8px] font-medium"
              >
                {val}
              </text>
            </g>
          )
        })}

        {/* Draw bars and labels */}
        {points.map((p, i) => {
          const x = paddingLeft + i * step + (step - barWidth) / 2
          const barHeight = (p.value / max) * chartHeight
          const y = paddingTop + chartHeight - barHeight
          
          const showLabel = points.length <= 7 || i % 5 === 0 || i === points.length - 1
          const dateLabel = p.date ? formatDateStr(p.date) : ''

          return (
            <g key={i} className="group">
              <title>{`Mood: ${p.value}/5 on ${p.date ? formatDateStr(p.date) : 'unknown date'}`}</title>
              
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={Math.min(barWidth / 2, 4)}
                className="fill-purple-600 transition-all group-hover:fill-purple-800"
              />
              
              {showLabel ? (
                <text
                  x={paddingLeft + i * step + step / 2}
                  y={height - 15}
                  textAnchor="middle"
                  className="fill-slate-600 text-[10px] font-semibold"
                >
                  {dateLabel}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
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
  const [moodFilter, setMoodFilter] = useState('7d')

  useEffect(() => {
    let on = true
    api.client.home().then((d) => on && setData(d)).catch(() => {})
    return () => {
      on = false
    }
  }, [])

  const loading = !data
  const patient = data?.patient
  const next = data?.nextAppointment
  const last = data?.lastAppointment
  const nextDt = next ? new Date(next.starts_at) : null

  const todayKey = () => new Date().toISOString().slice(0, 10)
  const submittedToday = data?.moodSeries?.some((m) => m.date === todayKey())

  return (
    <>
      <PageHeader title={patient ? `Good Day, ${patient.first_name}!` : 'Welcome'} />
      <div className="flex-1 overflow-y-auto p-6">

        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link to="/client/assessments">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-transparent hover:border-purple-300 transition-colors cursor-pointer flex justify-between items-center group">
              <div>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-purple-800">
                    {data?.stats?.assignedAssessments ?? 0}
                  </div>
                )}
                <div className="mt-1 text-sm font-medium text-slate-700">Pending Assessments</div>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </Link>
          <Link to="/client/activity">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-transparent hover:border-purple-300 transition-colors cursor-pointer flex justify-between items-center group">
              <div>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className={`text-2xl font-bold ${submittedToday ? 'text-green-600' : 'text-amber-500'}`}>
                    {submittedToday ? 'Submitted' : 'Pending'}
                  </div>
                )}
                <div className="mt-1 text-sm font-medium text-slate-700">Turn in Daily Journal</div>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${submittedToday ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {submittedToday ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
            </div>
          </Link>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-purple-800">
                {moodFilter === '7d' ? '7-Day' : 'Monthly'} Mood Trend
              </div>
              <div className="flex gap-1 rounded-md bg-purple-50 p-0.5 text-xs">
                <button
                  onClick={() => setMoodFilter('7d')}
                  className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                    moodFilter === '7d' ? 'bg-purple-700 text-white' : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setMoodFilter('30d')}
                  className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                    moodFilter === '30d' ? 'bg-purple-700 text-white' : 'text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <MoodChart points={data?.moodSeries ? (moodFilter === '7d' ? data.moodSeries.slice(-7) : data.moodSeries) : []} loading={loading} />
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

        <section className="mt-5">
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
                    <div className="font-semibold text-slate-800">{a.title}</div>
                    {a.body && <p className="text-xs text-slate-600 mt-1">{a.body}</p>}
                    <div className="text-[10px] text-slate-400 mt-1">{fmtDate(a.publish_date)}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}

export default HomeProgress
