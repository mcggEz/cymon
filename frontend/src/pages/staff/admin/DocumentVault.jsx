import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function PreviewModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-purple-100 pb-3">
          <div>
            <div className="text-xl font-bold text-purple-800">Progress Summary Report (PSR)</div>
            <div className="text-xs text-slate-500">{row.name} · Requested: 2026-03-28</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>

        <pre className="mt-4 whitespace-pre-wrap rounded-md bg-purple-50 p-4 font-mono text-xs text-slate-700">
{`PROGRESS SUMMARY REPORT
ClearMind Psychological Services
============================================

Student: ${row.name}
Age/Sex: 7 / Male
Date of Report: March 28, 2026

SUMMARY OF PROGRESS:
${row.name} has shown significant improvement in his fine motor skills over the last 3 months. He can now successfully sort pegs by color with minimal prompting. However, attention span during seated tasks remains a target area for the next quarter.

RECOMMENDATIONS:
- Continue 2x/week occupational therapy.
- Implement a visual timer for seated tasks at home and school.`}
        </pre>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close Preview
          </button>
          <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            🖨 Print Document
          </button>
        </div>
      </div>
    </div>
  )
}

function DocumentVault() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let on = true
    api.admin
      .documents()
      .then((d) => on && setRows(d.documents.map((x) => ({ ...x, date: fmtDate(x.finalized_at) }))))
      .catch(() => {})
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <StaffHeader title="Document Vault" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 inline-flex items-center gap-1 rounded-md border border-purple-200 bg-white px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          ← Back to Overview
        </button>
        <h1 className="text-3xl font-bold text-purple-800">Document Vault</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Finalized clinic document records
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-purple-200 bg-white px-3 py-1.5 text-sm text-slate-500">
              <span>🔍</span>
              <input placeholder="Search student name" className="flex-1 bg-transparent outline-none" />
            </div>
            <select className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm">
              <option>All Document Types</option>
              <option>FO-01 Admissions</option>
              <option>FO-06 Assessment Reports</option>
              <option>Signed Waivers</option>
            </select>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wider text-purple-700">
                <th className="py-3 text-left">Student Name</th>
                <th className="py-3 text-left">Document Type</th>
                <th className="py-3 text-left">Date Finalized</th>
                <th className="py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="py-3 text-slate-700">{r.type}</td>
                  <td className="py-3 text-slate-600">{r.date}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-sm font-medium text-purple-700 hover:text-purple-900">
                        Download PDF
                      </button>
                      <button
                        onClick={() => setActive(r)}
                        className="rounded-md border border-purple-300 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {active ? <PreviewModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default DocumentVault
