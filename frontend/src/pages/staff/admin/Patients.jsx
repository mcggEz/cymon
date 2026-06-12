import { useState } from 'react'
import StaffHeader from '../StaffHeader'

const ROWS = [
  { id: 'CMPS-2026-042', name: 'Alex Johnson', age: 8, status: 'Active', tone: 'emerald', form: 'Complete', formTone: 'text-emerald-600' },
  { id: 'CMPS-2026-088', name: 'Jordan Smith', age: 10, status: 'Active', tone: 'emerald', form: 'Pending', formTone: 'text-amber-600' },
  { id: 'CMPS-2026-015', name: 'Casey Williams', age: 7, status: 'Pending', tone: 'amber', form: 'In Progress', formTone: 'text-amber-600' },
]

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
}

function ProfileModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <div className="text-xl font-bold text-purple-800">Patient Profile</div>
        <div className="text-xs text-slate-500">{row.id}</div>

        <div className="mt-4 text-xs font-semibold tracking-wider text-purple-700">
          ◧ PERSONAL INFORMATION
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Full Name</div>
            <div className="font-semibold text-purple-800">{row.name}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Age / Sex</div>
            <div className="font-semibold text-purple-800">{row.age} / Male</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Status</div>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[row.tone]}`}>
              {row.status}
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Admission Form</div>
            <div className={`text-sm font-semibold ${row.formTone}`}>{row.form}</div>
          </div>
        </div>

        <div className="mt-5 text-xs font-semibold tracking-wider text-purple-700">
          ◔ CLINICAL HISTORY
        </div>
        <p className="mt-2 text-sm text-slate-700">
          No active medical alerts. Patient is currently enrolled in the Standard SPED Program. See
          Document Vault for latest Assessment Reports.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close
          </button>
          <button className="rounded-md bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-600">
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

function Patients() {
  const [active, setActive] = useState(null)
  return (
    <>
      <StaffHeader title="Patient Management" subtitle="Monday, March 30, 2026 — Clinic Operations" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Patient Management</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Manage student records, statuses, and admission forms.
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-purple-200 bg-white px-3 py-1.5 text-sm text-slate-500">
              <span>🔍</span>
              <input placeholder="Search by name…" className="flex-1 bg-transparent outline-none" />
            </div>
            <select className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Pending</option>
            </select>
            <button className="rounded-md border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
              ⬇ Export List
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wider text-purple-700">
                <th className="py-3 text-left">Name</th>
                <th className="py-3 text-left">Age</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-left">Admission Form</th>
                <th className="py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="py-3">
                    <div className="font-semibold text-slate-800">{r.name}</div>
                    <div className="text-xs text-slate-500">ID: {r.id}</div>
                  </td>
                  <td className="py-3">{r.age}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${tone[r.tone]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className={`py-3 font-medium ${r.formTone}`}>{r.form}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActive(r)}
                        className="rounded-md border border-purple-300 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50"
                      >
                        View
                      </button>
                      <button className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {active ? <ProfileModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default Patients
