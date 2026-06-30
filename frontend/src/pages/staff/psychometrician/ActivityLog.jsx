import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import Avatar from '../../../components/ui/Avatar'

const STATUS_META = {
  draft: { label: 'Draft', tone: 'bg-amber-100 text-amber-700', action: 'Edit Log' },
  pending: { label: 'Pending', tone: 'bg-sky-100 text-sky-700', action: 'View Details' },
  approved: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-700', action: 'View Details' },
}
const dayOf = (d) => (d ? String(new Date(d).getDate()) : '')
const monOf = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '')

function PreviewModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-purple-100 pb-3">
          <div>
            <div className="text-xl font-bold text-purple-800">Daily Activity Report Preview</div>
            <div className="text-xs text-slate-500">Undergraduate Level · CMPS:SE-FO-07</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>

        <div className="mt-4 text-xs font-semibold tracking-wider text-purple-700">
          ⏱ ACTIVITY DETAILS
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Student Name</div>
            <div className="font-semibold text-purple-800">{row.name}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Date of Activity</div>
            <div className="font-semibold text-purple-800">{row.mon} {row.day}, 2026 · Session 04</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Activity Title</div>
            <div className="font-semibold text-purple-800">{row.detail}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Target Domain</div>
            <div className="font-semibold text-purple-800">Cognition / Fine Motor</div>
          </div>
        </div>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
          ✦ PROCEDURE & OBJECTIVE
        </div>
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">Objective:</span> Student will sort 10 pegs by color with
          minimum verbal prompting.
          <br />
          <span className="font-semibold">Procedure:</span> The therapist placed a board/box of pegs
          in front of the student. The student was asked to &quot;Find the red ones.&quot;
        </p>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
          🧠 BEHAVIORAL OBSERVATIONS
        </div>
        <p className="mt-2 text-sm text-slate-700">
          ★ <span className="font-semibold">Prepared by:</span> Erika Faustino, RPm ·{' '}
          <span className="text-amber-600">Pending Review</span>
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close
          </button>
          <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            🖨 Print Report
          </button>
        </div>
      </div>
    </div>
  )
}

function ActivityLog() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    api.psychometrician
      .activityLogs()
      .then((d) => on && setRows(d.rows))
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader
        title="Daily Activity Logging"
        subtitle="Internal session activities and behavioral responses · CMPS:SE-FO-07"
        showSearch={false}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Session Log History</h1>
              <p className="text-sm text-slate-500">
                Review past sessions, edit drafts, or track approval statuses.
              </p>
            </div>
            <a
              href="#new"
              className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              + New Log Entry
            </a>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm text-slate-500">
              <span>🔍</span>
              <input placeholder="Search by student name or activity…" className="flex-1 bg-transparent outline-none" />
            </div>
            <select className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm">
              <option>All Statuses</option>
            </select>
          </div>

          <ul className="mt-4 divide-y divide-purple-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="py-4">
                  <Skeleton className="h-12 w-full" />
                </li>
              ))
            ) : (
              <>
            {rows.length === 0 ? (
              <li className="py-4 text-sm text-slate-500">No session logs yet.</li>
            ) : null}
            {rows.map((r) => {
              const meta = STATUS_META[r.status] || STATUS_META.draft
              return (
              <li key={r.id} className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-purple-100 text-purple-800">
                  <div className="text-base font-bold leading-none">{dayOf(r.date)}</div>
                  <div className="text-[9px] font-semibold tracking-wider">{monOf(r.date)}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-800">{r.name}</div>
                  <div className="text-xs text-slate-500">
                    {r.session_number ? `Session ${r.session_number} · ` : ''}{r.detail}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                  {meta.label}
                </span>
                <button
                  onClick={() => setActive({ ...r, day: dayOf(r.date), mon: monOf(r.date) })}
                  className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50"
                >
                  {meta.action}
                </button>
              </li>
              )
            })}
              </>
            )}
          </ul>
        </section>

        <section id="new" className="mt-6 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar name="Jordan Smith" size="lg" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-purple-800 text-center">Daily Activity Report</h2>
              <div className="text-center text-xs text-slate-500">
                Undergraduate Level · CMPS:SE-FO-07 rev.4 03/22/2026
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-purple-200 bg-purple-50 p-4">
            <div className="text-sm font-semibold text-purple-800">⏱ Activity Details</div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs">
                <div className="font-semibold text-purple-700">SESSION NUMBER</div>
                <input className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm" placeholder="12" />
              </label>
              <label className="text-xs">
                <div className="font-semibold text-purple-700">DATE OF THE ACTIVITY</div>
                <input type="date" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm" />
              </label>
              <label className="text-xs">
                <div className="font-semibold text-purple-700">NAME OF THE STUDENT</div>
                <input className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm" placeholder="Jordan Smith" />
              </label>
              <label className="text-xs">
                <div className="font-semibold text-purple-700">TARGETED DOMAINS</div>
                <input className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm" placeholder="Motor Skills" />
              </label>
              <label className="text-xs sm:col-span-2">
                <div className="font-semibold text-purple-700">TITLE OF THE ACTIVITY</div>
                <input className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-white px-3 text-sm" placeholder="Sensory Integration Play" />
              </label>
              <label className="text-xs sm:col-span-2">
                <div className="font-semibold text-purple-700">OBJECTIVES</div>
                <textarea rows={2} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-3 py-2 text-sm" />
              </label>
              <label className="text-xs sm:col-span-2">
                <div className="font-semibold text-purple-700">ACTIVITY PROCEDURE</div>
                <textarea rows={3} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-3 py-2 text-sm" />
              </label>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-purple-200 bg-purple-50 p-4">
            <div className="text-sm font-semibold text-purple-800">🧠 Behavioral Observations</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-semibold tracking-wider text-purple-700">
                    <th className="py-2 text-left">No.</th>
                    <th className="py-2 text-left">Name of Student</th>
                    <th className="py-2 text-left">Responses / Displayed Behavior</th>
                    <th className="py-2 text-left">Act</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">1</td>
                    <td className="py-2">Jordan Smith</td>
                    <td className="py-2">
                      <input className="h-8 w-full rounded-md border border-purple-200 bg-white px-2 text-xs" defaultValue="Initially hesitant. Engaged for 3 minutes before withdrawing." />
                    </td>
                    <td className="py-2">
                      <button className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700">−</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="mt-2 rounded-md border border-purple-300 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-white">
              + Add Student Observation
            </button>
          </div>

          <div className="mt-5 rounded-md border border-purple-200 bg-purple-50 p-4">
            <div className="text-sm font-semibold text-purple-800">⚖ Authentication & Approval</div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-purple-700">PREPARED BY:</div>
                <div className="mt-1 h-20 rounded-md border border-purple-200 bg-white" />
                <button className="mt-2 rounded-md border border-purple-300 px-3 py-1 text-xs text-purple-700 hover:bg-white">
                  Clear Canvas
                </button>
              </div>
              <div>
                <div className="text-xs font-semibold text-purple-700">SIGNATURE</div>
                <div className="mt-1 h-20 rounded-md border border-purple-200 bg-white" />
                <div className="mt-1 text-xs text-slate-500">Dr. Erika Faustino</div>
              </div>
            </div>
          </div>

          <button className="mt-5 w-full rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800">
            Submit Daily Activity Report
          </button>
        </section>

        {active ? <PreviewModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default ActivityLog
