import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import ReportDocument from './ReportDocument'
import { buildReport, printReport } from './report'
import { api } from '../../../lib/api'

const PAGE_SIZE = 20

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

// Full-screen PDF-style viewer: dark toolbar + gray canvas + the white A4 page.
function DocumentViewer({ row, onClose }) {
  const report = buildReport(row)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/80"
      role="dialog"
      aria-modal="true"
      aria-label={`${report.title} preview`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 text-white">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{report.title}</div>
          <div className="truncate text-xs text-slate-400">
            {report.meta[0]?.value} · Form {report.code}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => printReport(report)}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-500/30 p-4 sm:p-10">
        <ReportDocument report={report} />
      </div>
    </div>
  )
}

function ClinicalRecords() {
  const [active, setActive] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)

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
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Clinical Records" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Clinical Records</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Finalized clinic document records
        </div>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search student name"
              className="flex-1"
            />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setPage(1)
              }}
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
                <th className="py-3 px-4 text-left">Student Name</th>
                <th className="py-3 px-4 text-left">Document Type</th>
                <th className="py-3 px-4 text-left">Date Finalized</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`s${i}`}>
                      <td colSpan={4} className="py-3 px-4">
                        <Skeleton className="h-11 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-sm text-slate-500">
                    No documents match your search.
                  </td>
                </tr>
              ) : null}
              {!loading &&
                pageRows.map((r) => {
                  const isSelected = active && active.id === r.id
                  return (
                    <tr
                      key={r.id}
                      className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">{r.name}</td>
                      <td className="py-3 px-4 text-slate-700">{r.type}</td>
                      <td className="py-3 px-4 text-slate-600">{r.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => printReport(buildReport(r))}
                            className="text-sm font-medium text-purple-700 hover:text-purple-900"
                          >
                            Download PDF
                          </button>
                          <RowAction variant="view" onClick={() => setActive(r)}>
                            View
                          </RowAction>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
        </section>

        {active ? <DocumentViewer row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default ClinicalRecords
