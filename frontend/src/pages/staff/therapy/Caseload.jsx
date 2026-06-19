import { useOutletContext } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

// Mockup data — placeholder UX for the speech / occupational therapist portals.
const DATA = {
  Speech: [
    { id: 'CMPS-2026-001', name: 'Leo Cruz', age: 7, focus: 'Articulation /s/, /r/', sessions: 8, status: 'Active', next: 'Apr 3' },
    { id: 'CMPS-2026-004', name: 'Casey Williams', age: 7, focus: 'Expressive language', sessions: 4, status: 'Active', next: 'Apr 5' },
    { id: 'CMPS-2026-005', name: 'Mia Santos', age: 8, focus: 'Fluency / stuttering', sessions: 12, status: 'Review due', next: 'Apr 1' },
  ],
  Occupational: [
    { id: 'CMPS-2026-002', name: 'Alex Johnson', age: 8, focus: 'Pencil grip & handwriting', sessions: 10, status: 'Active', next: 'Apr 2' },
    { id: 'CMPS-2026-001', name: 'Leo Cruz', age: 7, focus: 'Sensory integration', sessions: 6, status: 'Active', next: 'Apr 4' },
    { id: 'CMPS-2026-003', name: 'Jordan Smith', age: 10, focus: 'Bilateral coordination', sessions: 3, status: 'Intake', next: 'Apr 6' },
  ],
}

const statusTone = {
  Active: 'bg-emerald-100 text-emerald-700',
  'Review due': 'bg-amber-100 text-amber-700',
  Intake: 'bg-sky-100 text-sky-700',
}

function Caseload() {
  const { discipline } = useOutletContext()
  const rows = DATA[discipline] || []

  return (
    <>
      <StaffHeader title={`${discipline} Therapy — Caseload`} subtitle="Children assigned to your discipline" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Active Children</div>
            <div className="mt-1 text-3xl font-bold text-purple-800">{rows.filter((r) => r.status === 'Active').length}</div>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Sessions This Month</div>
            <div className="mt-1 text-3xl font-bold text-purple-800">{rows.reduce((a, r) => a + r.sessions, 0)}</div>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Reviews Due</div>
            <div className="mt-1 text-3xl font-bold text-amber-600">{rows.filter((r) => r.status === 'Review due').length}</div>
          </div>
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-purple-800">My Caseload</h1>
          <p className="text-sm text-slate-500">Children referred to {discipline.toLowerCase()} therapy by the clinician.</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Child</th>
                  <th className="py-3 text-left">Focus Area</th>
                  <th className="py-3 text-left">Sessions</th>
                  <th className="py-3 text-left">Next</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3">
                      <div className="font-semibold text-slate-800">{r.name}</div>
                      <div className="text-xs text-slate-500">ID: {r.id} · {r.age} yrs</div>
                    </td>
                    <td className="py-3 text-slate-700">{r.focus}</td>
                    <td className="py-3 text-slate-700">{r.sessions}</td>
                    <td className="py-3 text-slate-600">{r.next}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusTone[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="py-3">
                      <button className="rounded-md border border-purple-300 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50">
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

export default Caseload
