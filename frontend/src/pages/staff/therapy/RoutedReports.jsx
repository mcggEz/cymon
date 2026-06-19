import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

// Mockup data — reports the psychologist routed to this therapist for visibility.
const DATA = {
  Speech: [
    { id: 1, title: 'Behavioral Assessment Report (FO-06)', patient: 'Leo Cruz', from: 'Dr. Jinky C. Malabanan', routedBy: 'Psychologist', date: 'Mar 30, 2026', state: 'New' },
    { id: 2, title: 'Progress Summary Report (FO-08)', patient: 'Mia Santos', from: 'Dr. Jinky C. Malabanan', routedBy: 'Psychologist', date: 'Mar 28, 2026', state: 'New' },
    { id: 3, title: 'Daily Activity Report (FO-07)', patient: 'Casey Williams', from: 'Dr. R. Faustino', routedBy: 'Psychometrician', date: 'Mar 26, 2026', state: 'Reviewed' },
  ],
  Occupational: [
    { id: 1, title: 'Behavioral Assessment Report (FO-06)', patient: 'Alex Johnson', from: 'Dr. Jinky C. Malabanan', routedBy: 'Psychologist', date: 'Mar 30, 2026', state: 'New' },
    { id: 2, title: 'Daily Activity Report (FO-07)', patient: 'Leo Cruz', from: 'Dr. R. Faustino', routedBy: 'Psychometrician', date: 'Mar 27, 2026', state: 'New' },
    { id: 3, title: 'Progress Summary Report (FO-08)', patient: 'Jordan Smith', from: 'Dr. Jinky C. Malabanan', routedBy: 'Psychologist', date: 'Mar 25, 2026', state: 'Reviewed' },
  ],
}

const stateTone = {
  New: 'bg-rose-100 text-rose-700',
  Reviewed: 'bg-emerald-100 text-emerald-700',
}

function RoutedReports() {
  const { discipline } = useOutletContext()
  const [reports, setReports] = useState(DATA[discipline] || [])

  const markReviewed = (id) =>
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, state: 'Reviewed' } : r)))

  return (
    <>
      <StaffHeader title={`${discipline} Therapy — Routed Reports`} subtitle="Reports shared with you by the clinical team" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          These reports were routed to you for visibility. Reviewing does not change the clinical
          sign-off — it only acknowledges that you have seen the document.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {reports.map((r) => (
            <article key={r.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-purple-800">{r.title}</div>
                  <div className="text-sm text-slate-600">Child: {r.patient}</div>
                  <div className="text-xs text-slate-500">
                    Routed by {r.from} ({r.routedBy}) · {r.date}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stateTone[r.state]}`}>
                  {r.state}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  👁 Open Report
                </button>
                <button
                  onClick={() => markReviewed(r.id)}
                  disabled={r.state === 'Reviewed'}
                  className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                >
                  {r.state === 'Reviewed' ? '✓ Reviewed' : 'Mark as Reviewed'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default RoutedReports
