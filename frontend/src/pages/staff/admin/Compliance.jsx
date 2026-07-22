import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import Pagination from '../../../components/ui/Pagination'
import Modal from '../../../components/ui/Modal'
import { api } from '../../../lib/api'

const PAGE_SIZE = 20

const TABS = ['All Issues', 'Overdue', 'Pending Signature', 'Submitted', 'Approved', 'SPED (FO-02)', 'SummerScape (FO-13)']

const tone = {
  rose: 'text-rose-700',
  amber: 'text-amber-700',
  emerald: 'text-emerald-700',
}

const STATUS_LABEL = { overdue: 'OVERDUE', pending_signature: 'PENDING SIG.', submitted: 'SUBMITTED', approved: 'APPROVED' }
const fmtDue = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

function toRow(r) {
  const statusTone = r.status === 'overdue' ? 'rose' : (r.status === 'submitted' || r.status === 'approved' ? 'emerald' : 'amber')
  return {
    ...r,
    due: fmtDue(r.due_date),
    label: STATUS_LABEL[r.status] || r.status,
    tone: statusTone,
  }
}

function WaiverViewModal({ row, onClose }) {
  const sa = row.provisions_agreed || {}
  const signature = sa.signature_image || null

  return (
    <Modal title={row.doc} subtitle={`Form: ${row.code} · Student ID: ${row.sid}`} onClose={onClose}>
      <div className="space-y-5">
        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5 text-sm">
          <div className="font-semibold text-purple-800">Acknowledgement Summary</div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Parent / Guardian Name</span>
              <span className="font-bold text-slate-800">{sa.parent_name || row.signature_text || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Signed Date</span>
              <span className="font-bold text-slate-800">
                {sa.date ? fmtDue(sa.date) : (row.signed_at ? fmtDue(row.signed_at) : '—')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Student Name</span>
              <span className="font-bold text-slate-800">{sa.child_name || row.student || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Relationship</span>
              <span className="font-bold text-slate-800">{sa.relationship || '—'}</span>
            </div>
          </div>
        </section>

        {row.code !== 'CMPS:SE-FO-01' && row.code !== 'CMPS:SE-FO-13' && (
          <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm space-y-2">
            <div className="font-semibold text-purple-800 text-sm">Agreements & Provisions</div>
            <p className="text-xs text-slate-600">
              The parent agreed to the nature of the program, authority to provide services, confidentiality guidelines, health and safety policies, and financial commitments.
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded px-2.5 py-1 inline-flex items-center gap-1.5">
              ✓ Agreed to all clauses & house rules
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="font-semibold text-purple-800 text-sm">E-Signature Image</div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 flex justify-center">
            {signature ? (
              <img src={signature} alt="Parent Signature" className="max-h-28 object-contain mx-auto" />
            ) : (
              <span className="text-xs text-slate-400 italic">No signature image available</span>
            )}
          </div>
        </section>
      </div>
    </Modal>
  )
}

const Stat = ({ value, label, color }) => (
  <div className={`rounded-2xl border border-purple-200 bg-white p-5 text-center shadow-sm`}>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
  </div>
)

function Compliance() {
  const [tab, setTab] = useState('All Issues')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [active, setActive] = useState(null)
  const [viewWaiver, setViewWaiver] = useState(null)

  const load = () => api.admin.compliance().then(setData).catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const remind = async (r) => {
    setBusyId(r.id)
    try {
      await api.admin.remindCompliance(r.id)
      toast.success(`Reminder sent to ${r.parent} about ${r.student}'s ${r.doc}.`)
    } catch (e) {
      toast.error(`Could not send reminder: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const markProcessed = async (r) => {
    setBusyId(r.id)
    try {
      await api.admin.processCompliance(r.id)
      toast.success(`Marked ${r.student}'s ${r.doc} as received.`)
      await load()
    } catch (e) {
      toast.error(`Could not process: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const summary = data?.summary
  const rows = (data?.rows || []).map(toRow)

  const foMatch = tab.match(/FO-\d+/)
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => {
    const matchesTab =
      tab === 'All Issues'
        ? true
        : tab === 'Overdue'
          ? r.status === 'overdue'
          : tab === 'Pending Signature'
            ? r.status === 'pending_signature'
            : tab === 'Submitted'
              ? r.status === 'submitted'
              : tab === 'Approved'
                ? r.status === 'approved'
                : foMatch
                  ? (r.code || '').includes(foMatch[0])
                  : true
    const matchesQuery =
      !q ||
      (r.student || '').toLowerCase().includes(q) ||
      (r.parent || '').toLowerCase().includes(q) ||
      (r.sid || '').toLowerCase().includes(q)
    return matchesTab && matchesQuery
  })
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <StaffHeader title="Compliance & Waivers" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Compliance & Waiver Tracking</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Monitor missing documents, overdue forms, and pending signatures
        </div>


        <div className="mt-5 flex gap-6">
        <section className="min-w-0 flex-1 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-purple-100 pb-3">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setPage(1)
                }}
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  tab === t ? 'bg-purple-700 text-white' : 'text-purple-700 hover:bg-purple-50',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setPage(1)
              }}
              placeholder="Search students…"
              className="ml-auto w-56"
            />
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Parent / Guardian</th>
                  <th className="py-3 px-4 text-left">Missing Document</th>
                  <th className="py-3 px-4 text-left">Form Code</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`s${i}`}>
                        <td colSpan={7} className="py-3 px-4">
                          <Skeleton className="h-11 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-sm text-slate-500">
                      No compliance issues match your search.
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
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{r.student}</div>
                          <div className="text-xs text-slate-500">ID: {r.sid}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-700">{r.parent}</div>
                          <div className="text-xs text-slate-500">{r.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{r.doc}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{r.code}</td>
                        <td className={`py-3 px-4 text-xs font-semibold ${tone[r.tone]}`}>{r.due}</td>
                        <td className={`py-3 px-4 text-xs font-semibold ${tone[r.tone]}`}>{r.label}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <RowAction variant="view" onClick={() => setActive(r)}>
                              View
                            </RowAction>
                            <button
                              onClick={() => remind(r)}
                              disabled={busyId === r.id}
                              className="rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                            >
                              Remind
                            </button>
                            <button
                              onClick={() => markProcessed(r)}
                              disabled={busyId === r.id}
                              className="rounded-md border border-purple-200 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                            >
                              {busyId === r.id ? '…' : 'Process'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div>Showing {filtered.length} compliance issues</div>
            <div className="font-semibold text-rose-600">
              {filtered.filter((r) => r.status === 'overdue').length} require immediate attention
            </div>
          </div>
        </section>

        {active ? (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setActive(null)} aria-hidden="true" />
            <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl lg:static lg:z-auto lg:block lg:w-96 lg:max-w-none lg:shrink-0 lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:border-purple-200 lg:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold text-purple-800">Details</div>
                <button onClick={() => setActive(null)} aria-label="Close" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Student</dt>
                  <dd className="font-medium text-purple-800">{active.student || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Student ID</dt>
                  <dd className="font-medium text-purple-800">{active.sid || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Parent / Guardian</dt>
                  <dd className="font-medium text-purple-800">{active.parent || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Email</dt>
                  <dd className="font-medium text-purple-800">{active.email || '—'}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Missing Document</dt>
                  <dd className="font-medium text-purple-800">{active.doc || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Form Code</dt>
                  <dd className="font-medium text-purple-800">{active.code || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Due Date</dt>
                  <dd className={`font-medium ${tone[active.tone] || 'text-purple-800'}`}>{active.due || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">Status</dt>
                  <dd className={`font-medium ${tone[active.tone] || 'text-purple-800'}`}>{active.label || '—'}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-2">
                {(active.status === 'submitted' || active.status === 'approved') && (
                  <button
                    onClick={() => setViewWaiver(active)}
                    className="w-full rounded-md border border-purple-300 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 cursor-pointer text-center"
                  >
                    View Signed Form
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => remind(active)}
                    disabled={busyId === active.id}
                    className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  >
                    {busyId === active.id ? '…' : 'Remind'}
                  </button>
                  <button
                    onClick={() => markProcessed(active)}
                    disabled={busyId === active.id || active.status === 'approved'}
                    className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-50"
                  >
                    {active.status === 'approved' ? 'Processed' : (busyId === active.id ? '…' : 'Process')}
                  </button>
                </div>
              </div>
            </aside>
          </>
        ) : null}
        </div>
      </div>
      {viewWaiver ? <WaiverViewModal row={viewWaiver} onClose={() => setViewWaiver(null)} /> : null}
    </>
  )
}

export default Compliance
