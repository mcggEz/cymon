import { useState } from 'react'
import StaffHeader from '../StaffHeader'

const ROWS = [
  { name: 'Leo Cruz', beh: 35, gars: 112, cafat: 78, status: 'Mastered', tone: 'emerald' },
  { name: 'Alex Johnson', beh: 28, gars: 105, cafat: 72, status: 'Developing', tone: 'amber' },
  { name: 'Jordan Smith', beh: 22, gars: 98, cafat: 65, status: 'Needs Support', tone: 'rose' },
]

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
}

const Stat = ({ value, label, icon, color }) => (
  <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-slate-800">{value}</div>
    </div>
    <div className={`flex h-9 w-9 items-center justify-center rounded-md ${color}`}>{icon}</div>
  </div>
)

function ReportModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-purple-100 pb-3">
          <div>
            <div className="text-xl font-bold text-purple-800">Finalized Behavioral Assessment Report</div>
            <div className="text-xs text-slate-500">
              {row.name} · Approved Mar 30, 2026 ·{' '}
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Approved</span>
            </div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-slate-700">
          <section>
            <div className="text-sm font-semibold tracking-wider text-purple-700">SUMMARY OF FINDINGS</div>
            <p className="mt-1">
              {row.name} demonstrated an excellent grasp of numerical and spatial concepts during
              testing. He followed multi-step instructions effortlessly.
            </p>
          </section>
          <section>
            <div className="text-sm font-semibold tracking-wider text-purple-700">AREAS OF CONCERN</div>
            <p className="mt-1">No significant behavioral concerns at this time.</p>
          </section>
          <section>
            <div className="text-sm font-semibold tracking-wider text-purple-700">RECOMMENDATIONS</div>
            <p className="mt-1">
              Recommend continuing the current mainstreaming plan without additional support hours.
            </p>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close Preview
          </button>
          <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            🖨 Print Official Report
          </button>
        </div>
      </div>
    </div>
  )
}

function ScoringAnalytics() {
  const [active, setActive] = useState(null)
  return (
    <>
      <StaffHeader title="Student Scoring Analytics" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat value="75.2" label="Avg. CAFAT Score" icon="📝" color="bg-purple-100 text-purple-700" />
          <Stat value="24" label="Assessments This Month" icon="📋" color="bg-emerald-100 text-emerald-700" />
          <Stat value="5" label="Students Needing Support" icon="⚠" color="bg-amber-100 text-amber-700" />
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-purple-200 bg-white px-3 py-1.5 text-sm text-slate-500">
              <span>🔍</span>
              <input placeholder="Search student name…" className="flex-1 bg-transparent outline-none" />
            </div>
            <select className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm">
              <option>All Statuses</option>
            </select>
            <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
              ⬇ Export CSV Report
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Student</th>
                  <th className="py-3 text-left">Behavioral Score</th>
                  <th className="py-3 text-left">GARS-3 Index</th>
                  <th className="py-3 text-left">CAFAT Score</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {ROWS.map((r) => (
                  <tr key={r.name}>
                    <td className="py-3 font-medium text-slate-800">{r.name}</td>
                    <td className="py-3">{r.beh}</td>
                    <td className="py-3">{r.gars}</td>
                    <td className="py-3">{r.cafat}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[r.tone]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setActive(r)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
                      >
                        📝 Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {active ? <ReportModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default ScoringAnalytics
