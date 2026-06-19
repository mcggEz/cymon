import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const levelTone = {
  HSN: 'bg-rose-100 text-rose-700',
  MSN: 'bg-amber-100 text-amber-700',
  LSN: 'bg-emerald-100 text-emerald-700',
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

function RosterOverview() {
  const [clients, setClients] = useState([])
  useEffect(() => {
    let on = true
    api.psychologist.roster().then((d) => on && setClients(d.clients)).catch(() => {})
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader title="Rooster Overview" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-purple-800">Client Roster Overview</h1>
          <p className="text-sm text-slate-500">
            All assigned clients with current Support Level and milestone completion
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 text-left">Client Name</th>
                  <th className="py-3 text-center">Support Level</th>
                  <th className="py-3 text-left">Progress</th>
                  <th className="py-3 text-left">Last Update</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${levelTone[c.level] || 'bg-slate-100 text-slate-600'}`}>
                        {c.level}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 rounded-full bg-purple-100">
                          <div
                            className="h-full rounded-full bg-purple-700"
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{c.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{fmtDate(c.updated)}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-3 text-purple-700">
                        <button aria-label="View" className="hover:text-purple-900">👁</button>
                        <button aria-label="Edit" className="hover:text-purple-900">✏</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1 text-sm text-purple-700">
            <button className="px-2">«</button>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={[
                  'h-7 w-7 rounded-md',
                  n === 1 ? 'bg-purple-700 text-white' : 'hover:bg-purple-50',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
            <span>…</span>
            <button className="h-7 w-7 rounded-md hover:bg-purple-50">15</button>
            <button className="px-2">»</button>
          </div>
        </section>
      </div>
    </>
  )
}

export default RosterOverview
