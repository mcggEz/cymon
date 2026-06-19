import { useOutletContext } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

// Mockup data — therapy session notes authored by this therapist.
const DATA = {
  Speech: [
    { id: 1, day: '29', mon: 'MAR', child: 'Leo Cruz', activity: 'Articulation drill — /s/ blends', status: 'Draft' },
    { id: 2, day: '27', mon: 'MAR', child: 'Mia Santos', activity: 'Fluency shaping — easy onset', status: 'Finalized' },
    { id: 3, day: '25', mon: 'MAR', child: 'Casey Williams', activity: 'Expressive language — naming', status: 'Finalized' },
  ],
  Occupational: [
    { id: 1, day: '28', mon: 'MAR', child: 'Alex Johnson', activity: 'Handwriting — letter formation', status: 'Draft' },
    { id: 2, day: '26', mon: 'MAR', child: 'Leo Cruz', activity: 'Sensory diet — brushing protocol', status: 'Finalized' },
    { id: 3, day: '24', mon: 'MAR', child: 'Jordan Smith', activity: 'Bilateral coordination — beading', status: 'Finalized' },
  ],
}

const statusTone = {
  Draft: 'bg-amber-100 text-amber-700',
  Finalized: 'bg-emerald-100 text-emerald-700',
}

function SessionNotes() {
  const { discipline } = useOutletContext()
  const rows = DATA[discipline] || []

  return (
    <>
      <StaffHeader title={`${discipline} Therapy — Session Notes`} subtitle="Document each therapy session" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Session History</h1>
              <p className="text-sm text-slate-500">Recent {discipline.toLowerCase()} therapy sessions.</p>
            </div>
            <a href="#new" className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
              + New Session Note
            </a>
          </div>

          <ul className="mt-4 divide-y divide-purple-100">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-purple-100 text-purple-800">
                  <div className="text-base font-bold leading-none">{r.day}</div>
                  <div className="text-[9px] font-semibold tracking-wider">{r.mon}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-purple-800">{r.child}</div>
                  <div className="text-xs text-slate-500">{r.activity}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[r.status]}`}>{r.status}</span>
                <button className="rounded-md border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-50">
                  {r.status === 'Draft' ? 'Edit' : 'View'}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section id="new" className="mt-6 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-purple-800">New Session Note</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs">
              <div className="font-semibold text-purple-700">CHILD</div>
              <select className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm">
                <option>Select from caseload…</option>
              </select>
            </label>
            <label className="text-xs">
              <div className="font-semibold text-purple-700">SESSION DATE</div>
              <input type="date" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
            </label>
            <label className="text-xs sm:col-span-2">
              <div className="font-semibold text-purple-700">FOCUS / ACTIVITY</div>
              <input className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" placeholder={discipline === 'Speech' ? 'e.g. Articulation drill — /r/' : 'e.g. Handwriting — letter formation'} />
            </label>
            <label className="text-xs sm:col-span-2">
              <div className="font-semibold text-purple-700">OBSERVATIONS</div>
              <textarea rows={3} className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm" placeholder="Responses, prompts required, progress toward goals…" />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="rounded-md border border-purple-300 px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50">💾 Save Draft</button>
            <button className="rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800">✓ Finalize Note</button>
          </div>
        </section>
      </div>
    </>
  )
}

export default SessionNotes
