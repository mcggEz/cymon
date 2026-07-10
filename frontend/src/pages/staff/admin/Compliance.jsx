import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'

const TABS = ['All Issues', 'Overdue', 'Pending Signature', 'SPED (FO-02)', 'SummerScape (FO-13)']

const tone = {
  rose: 'text-rose-700',
  amber: 'text-amber-700',
}

const STATUS_LABEL = { overdue: 'OVERDUE', pending_signature: 'PENDING SIG.' }
const fmtDue = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function toRow(r) {
  return {
    ...r,
    due: fmtDue(r.due_date),
    label: STATUS_LABEL[r.status] || r.status,
    tone: r.status === 'overdue' ? 'rose' : 'amber',
  }
}

const Stat = ({ value, label, color }) => (
  <div className={`rounded-2xl border border-purple-200 bg-white p-5 text-center shadow-sm`}>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
  </div>
)

function Compliance() {
  const [tab, setTab] = useState('All Issues')
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)

  const load = () => api.admin.compliance().then(setData).catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const remind = async (r) => {
    setBusyId(r.id)
    setNotice(null)
    try {
      await api.admin.remindCompliance(r.id)
      setNotice(`Reminder sent to ${r.parent} about ${r.student}'s ${r.doc}.`)
    } catch (e) {
      setNotice(`Could not send reminder: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const markProcessed = async (r) => {
    setBusyId(r.id)
    setNotice(null)
    try {
      await api.admin.processCompliance(r.id)
      setNotice(`Marked ${r.student}'s ${r.doc} as received.`)
      await load()
    } catch (e) {
      setNotice(`Could not process: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const summary = data?.summary
  const rows = (data?.rows || []).map(toRow)

  const foMatch = tab.match(/FO-\d+/)
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const matchesTab =
      tab === 'All Issues'
        ? true
        : tab === 'Overdue'
          ? r.status === 'overdue'
          : tab === 'Pending Signature'
            ? r.status === 'pending_signature'
            : foMatch
              ? (r.code || '').includes(foMatch[0])
              : true
    const matchesQuery =
      !q ||
      (r.student || '').toLowerCase().includes(q) ||
      (r.parent || '').toLowerCase().includes(q) ||
      (r.sid || '').toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })

  return (
    <>
      <StaffHeader title="Compliance & Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Compliance & Waiver Tracking</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Monitor missing documents, overdue forms, and pending signatures
        </div>
        {notice ? (
          <div className="mt-3 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.overdue ?? '—'} label="Overdue" color="text-rose-600" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.pending ?? '—'} label="Pending Signature" color="text-amber-600" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.compliant ?? '—'} label="Fully Compliant" color="text-emerald-600" />
          <Stat value={loading ? <Skeleton className="h-8 w-16" /> : summary?.total ?? '—'} label="Total Students" color="text-sky-600" />
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-purple-100 pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  tab === t ? 'bg-purple-700 text-white' : 'text-purple-700 hover:bg-purple-50',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search students…"
              className="ml-auto w-56"
            />
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Student</th>
                  <th className="py-3 text-left">Parent / Guardian</th>
                  <th className="py-3 text-left">Missing Document</th>
                  <th className="py-3 text-left">Form Code</th>
                  <th className="py-3 text-left">Due Date</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`s${i}`}>
                        <td colSpan={7} className="py-3">
                          <Skeleton className="h-11 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-sm text-slate-500">
                      No compliance issues match your search.
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3">
                      <div className="font-medium text-slate-800">{r.student}</div>
                      <div className="text-xs text-slate-500">ID: {r.sid}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-700">{r.parent}</div>
                      <div className="text-xs text-slate-500">{r.email}</div>
                    </td>
                    <td className="py-3 text-slate-700">{r.doc}</td>
                    <td className="py-3 text-xs text-slate-500">{r.code}</td>
                    <td className={`py-3 text-xs font-semibold ${tone[r.tone]}`}>{r.due}</td>
                    <td className={`py-3 text-xs font-semibold ${tone[r.tone]}`}>● {r.label}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => remind(r)}
                          disabled={busyId === r.id}
                          className="rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                        >
                          Remind
                        </button>
                        <button
                          onClick={() => markProcessed(r)}
                          disabled={busyId === r.id}
                          className="rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                        >
                          {busyId === r.id ? '…' : 'Process'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div>Showing {filtered.length} compliance issues</div>
            <div className="font-semibold text-rose-600">
              {filtered.filter((r) => r.status === 'overdue').length} require immediate attention
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Compliance
