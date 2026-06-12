import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

const ROWS = [
  { student: 'Leo Cruz', sid: 'STU-0049', parent: 'Maria Cruz', email: '[email protected]', doc: 'SPED Consent & Waiver', code: 'CMPS:SE-FO-02', due: 'Mar 15, 2026', status: 'OVERDUE', tone: 'rose' },
  { student: 'Mia Santos', sid: 'STU-0072', parent: 'John Santos', email: '[email protected]', doc: 'SummerScape Waiver', code: 'CMPS:SE-FO-12', due: 'Mar 29, 2026', status: 'PENDING SIG.', tone: 'amber' },
  { student: 'Zara Mendoza', sid: 'STU-0017', parent: 'Lidia Mendoza', email: '[email protected]', doc: 'SPED Consent & Waiver', code: 'CMPS:SE-FO-02', due: 'Mar 10, 2026', status: 'OVERDUE', tone: 'rose' },
  { student: 'Carlos Bautista', sid: 'STU-0061', parent: 'Rosa Bautista', email: '[email protected]', doc: 'SummerScape Waiver', code: 'CMPS:SE-FO-12', due: 'Apr 5, 2026', status: 'PENDING SIG.', tone: 'amber' },
  { student: 'Nina Aquino', sid: 'STU-0033', parent: 'Bea Aquino', email: '[email protected]', doc: 'SPED Consent & Waiver', code: 'CMPS:SE-FO-02', due: 'Feb 28, 2026', status: 'OVERDUE', tone: 'rose' },
]

const TABS = ['All Issues', 'Overdue', 'Pending Signature', 'SPED (FO-02)', 'SummerScape (FO-13)']

const tone = {
  rose: 'text-rose-700',
  amber: 'text-amber-700',
}

const Stat = ({ value, label, color }) => (
  <div className={`rounded-2xl border border-purple-200 bg-white p-5 text-center shadow-sm`}>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
  </div>
)

function Compliance() {
  const [tab, setTab] = useState('All Issues')
  const navigate = useNavigate()
  return (
    <>
      <StaffHeader title="Compliance & Waivers" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 inline-flex items-center gap-1 rounded-md border border-purple-200 bg-white px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          ← Back to Overview
        </button>
        <h1 className="text-3xl font-bold text-purple-800">Compliance & Waiver Tracking</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Monitor missing documents, overdue forms, and pending signatures
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value="3" label="Overdue" color="text-rose-600" />
          <Stat value="5" label="Pending Signature" color="text-amber-600" />
          <Stat value="73" label="Fully Compliant" color="text-emerald-600" />
          <Stat value="20" label="Total Students" color="text-sky-600" />
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
            <div className="ml-auto flex w-56 items-center gap-2 rounded-md border border-purple-200 bg-white px-3 py-1.5 text-sm text-slate-500">
              <span>🔍</span>
              <input placeholder="Search students…" className="flex-1 bg-transparent outline-none" />
            </div>
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
                {ROWS.map((r) => (
                  <tr key={r.sid}>
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
                    <td className={`py-3 text-xs font-semibold ${tone[r.tone]}`}>● {r.status}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button className="rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50">
                          Remind
                        </button>
                        <button className="rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50">
                          Process
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div>Showing 5 compliance issues</div>
            <div className="font-semibold text-rose-600">3 require immediate attention</div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Compliance
