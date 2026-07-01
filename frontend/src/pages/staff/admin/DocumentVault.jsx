import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Modal from '../../../components/ui/Modal'
import { api } from '../../../lib/api'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function PreviewModal({ row, onClose }) {
  return (
    <Modal
      title="Progress Summary Report (PSR)"
      subtitle={`${row.name} · Requested: 2026-03-28`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close Preview
          </button>
          <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            🖨 Print Document
          </button>
        </div>
      }
    >
        <pre className="whitespace-pre-wrap rounded-md bg-purple-50 p-4 font-mono text-xs text-slate-700">
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
    </Modal>
  )
}

function DocumentVault() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    let on = true
    api.admin
      .documents()
      .then((d) => on && setRows(d.documents.map((x) => ({ ...x, date: fmtDate(x.finalized_at) }))))
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const types = [...new Set(rows.map((r) => r.type).filter(Boolean))]
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const mq = !q || (r.name || '').toLowerCase().includes(q)
    const mt = typeFilter === 'all' || r.type === typeFilter
    return mq && mt
  })

  return (
    <>
      <StaffHeader title="Document Vault" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Document Vault</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Finalized clinic document records
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search student name"
              className="flex-1"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-purple-200 bg-white px-3 text-sm"
            >
              <option value="all">All Document Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs font-semibold tracking-wider text-purple-700">
                <th className="py-3 text-left">Student Name</th>
                <th className="py-3 text-left">Document Type</th>
                <th className="py-3 text-left">Date Finalized</th>
                <th className="py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`s${i}`}>
                      <td colSpan={4} className="py-3">
                        <Skeleton className="h-11 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                    No documents match your search.
                  </td>
                </tr>
              ) : null}
              {!loading &&
                filtered.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="py-3 text-slate-700">{r.type}</td>
                  <td className="py-3 text-slate-600">{r.date}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button className="text-sm font-medium text-purple-700 hover:text-purple-900">
                        Download PDF
                      </button>
                      <RowAction variant="view" onClick={() => setActive(r)}>
                        View
                      </RowAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>

        {active ? <PreviewModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default DocumentVault
