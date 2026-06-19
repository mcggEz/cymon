import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'SUBMITTED', tone: 'bg-sky-100 text-sky-700' },
  processed: { label: 'PROCESSED & DRAFTED', tone: 'bg-sky-100 text-sky-700' },
  scored: { label: 'APPROVED BY RPSY', tone: 'bg-emerald-100 text-emerald-700' },
  flagged: { label: 'FLAGGED', tone: 'bg-rose-100 text-rose-700' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')

function ChecklistModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-purple-100 p-5">
          <div>
            <h2 className="text-xl font-bold text-purple-800">Caregiver Observation Checklist</h2>
            <div className="text-xs text-slate-500">CMPS:SE-FO-03 · Submitted via Parent Portal</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 text-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Student Name
            </div>
            <div className="font-semibold text-purple-800">{row.name}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Respondent (Caregiver)
            </div>
            <div className="font-semibold text-purple-800">
              {row.by} <span className="text-xs font-normal text-slate-500">({row.rel})</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Date of Submission
            </div>
            <div className="font-semibold text-purple-800">{row.date}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              System Flag
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-rose-600">
              <span>⚑</span> 1 Critical Observation
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="text-sm font-semibold text-purple-800">I. Social & Communication Skills</div>
          <div className="mt-2 divide-y divide-purple-100">
            <div className="flex items-center justify-between py-2 text-sm">
              <span>1. Initiates interaction with peers or adults appropriately.</span>
              <span className="rounded-md bg-rose-500 px-3 py-1 text-xs font-medium text-white">No</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span>2. Answers simple WH-questions effectively.</span>
              <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white">Yes</span>
            </div>
          </div>

          <div className="mt-4 text-sm font-semibold text-purple-800">II. Behavioral Indicators</div>
          <div className="mt-2 divide-y divide-purple-100">
            <div className="flex items-center justify-between rounded-md bg-rose-50 px-2 py-2 text-sm">
              <span className="text-rose-700">
                1. Experiences intense meltdowns lasting more than 10 minutes. <span>⚑</span>
              </span>
              <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white">Yes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-purple-100 bg-purple-50 px-5 py-3">
          <div className="text-xs text-slate-600">
            Use this data to draft the Behavioral Assessment Report.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-white"
            >
              Close Viewer
            </button>
            <button className="rounded-md bg-purple-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-800">
              Mark as Processed ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-purple-100/70 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-purple-700">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-purple-800">{value}</div>
        <div className="text-xs font-medium text-slate-600">{label}</div>
      </div>
    </div>
  )
}

function DataReview() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let on = true
    api.psychometrician
      .dataReview()
      .then((d) => {
        if (!on) return
        setRows(d.rows)
        setSummary(d.summary)
      })
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader
        title="Caregiver Data Review"
        subtitle="Behavioral Observation Checklists"
        showSearch={false}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-purple-800">Submitted Checklists</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Review parent observations to extract data for your Behavioral Reports.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={summary?.newSubmissions ?? '—'} label="New Submissions" icon="✉" />
          <StatCard value={summary?.flagged ?? '—'} label="Flagged Priority" icon="⚑" />
          <StatCard value={summary?.approved ?? '—'} label="Approved by RPsy" icon="✓" />
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex w-72 items-center gap-2 rounded-md bg-purple-50 px-3 py-1.5 text-sm text-slate-500">
              <span>🔍</span>
              <input placeholder="Search student" className="flex-1 bg-transparent outline-none" />
            </div>
            <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
              ▾ Filter List
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Student Name</th>
                  <th className="py-3 text-left">Submitted By</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Clinician Status</th>
                  <th className="py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {rows.map((r) => {
                  const meta = STATUS_META[r.status] || STATUS_META.submitted
                  return (
                  <tr key={r.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2 font-medium text-purple-800">
                        {r.name}
                        {r.flag ? <span className="text-rose-500">⚑</span> : null}
                      </div>
                      <div className="text-xs text-slate-500">ID: {r.sid}</div>
                    </td>
                    <td className="py-3 text-slate-700">
                      {r.by} <span className="text-xs text-slate-500">({r.rel})</span>
                    </td>
                    <td className="py-3 text-slate-600">{fmtDate(r.date)}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setActive(r)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
                      >
                        👁 View Details
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {active ? <ChecklistModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default DataReview
