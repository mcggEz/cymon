import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton'
import { api } from '../../../lib/api'

const StatCard = ({ value, label, sub, tone, icon }) => {
  const tones = {
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  }
  return (
    <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-500">{label}</div>
          <div className="mt-1 text-4xl font-bold text-slate-800">{value}</div>
          {sub ? <div className="mt-0.5 text-xs text-slate-500">{sub}</div> : null}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const QuickAction = ({ icon, label }) => (
  <button className="flex items-center gap-2 rounded-md bg-purple-700 px-4 py-3 text-left text-sm font-medium text-white hover:bg-purple-800">
    <span>{icon}</span>
    <span>{label}</span>
  </button>
)

const SEVERITY_DOT = {
  info: 'bg-sky-500',
  warn: 'bg-amber-500',
  alert: 'bg-rose-500',
}

const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : ''

function Overview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.admin
      .overview()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = data?.stats
  const activity = data?.activity || []

  return (
    <>
      <StaffHeader title="Dashboard Overview" subtitle="Monday, March 30, 2026 — Clinic Operations" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={loading ? <Skeleton className="h-8 w-16" /> : stats?.totalActive ?? '—'} label="Total Active Students" sub="Currently enrolled" tone="purple" icon="👥" />
          <StatCard value={loading ? <Skeleton className="h-8 w-16" /> : stats?.pendingAdmissions ?? '—'} label="Pending Admissions" sub="Awaiting processing" tone="amber" icon="⏳" />
          <StatCard value={loading ? <Skeleton className="h-8 w-16" /> : stats?.waiversMissing ?? '—'} label="Waivers Missing Signature" sub="Action required" tone="rose" icon="❗" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">⚡ Quick Actions</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <QuickAction icon="📋" label="New Student Admission" />
              <QuickAction icon="📅" label="View Master Schedule" />
              <QuickAction icon="🛡" label="Review Compliance Issues" />
              <QuickAction icon="📢" label="Post Announcement" />
            </div>
          </section>

          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">Walk-in Forms & Waivers</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">SPED Waiver</div>
                <div className="text-xs text-slate-500">FO-02 Processing</div>
              </div>
              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">SummerScape</div>
                <div className="text-xs text-slate-500">FO-13 Enrollment</div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-purple-800">⏱ Recent Activity</div>
            <div className="text-xs text-slate-500">Today</div>
          </div>
          <ul className="mt-3 space-y-3">
            {loading ? (
              <li>
                <SkeletonText lines={5} />
              </li>
            ) : activity.length === 0 ? (
              <li className="text-sm text-slate-500">No recent activity.</li>
            ) : (
              activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${SEVERITY_DOT[a.severity] || 'bg-slate-400'}`} />
                  <div>
                    <div className="text-slate-800">{a.summary}</div>
                    <div className="text-xs text-slate-500">{formatTime(a.created_at)}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </>
  )
}

export default Overview
