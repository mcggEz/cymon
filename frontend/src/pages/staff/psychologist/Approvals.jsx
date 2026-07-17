import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import Pagination from '../../../components/ui/Pagination'
import { api } from '../../../lib/api'

const PAGE_SIZE = 5

const priorityTone = {
  'High Priority': 'bg-rose-100 text-rose-700',
  'Medium Priority': 'bg-amber-100 text-amber-700',
  'Low Priority': 'bg-sky-100 text-sky-700',
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')

function Approvals() {
  const [activeTab, setActiveTab] = useState('reports')
  const [reports, setReports] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const load = () =>
    api.psychologist
      .approvals()
      .then((d) => {
        setReports(d.reports || [])
        setPermissions(d.permissions || [])
      })
      .catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  
  const visibleReports = q
    ? reports.filter((r) => r.name.toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q))
    : reports

  const visiblePermissions = q
    ? permissions.filter(
        (p) =>
          p.student_name.toLowerCase().includes(q) ||
          p.requested_by.toLowerCase().includes(q)
      )
    : permissions

  const visibleItems = activeTab === 'reports' ? visibleReports : visiblePermissions
  const pageRows = visibleItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const act = async (id, status) => {
    setBusyId(id)
    try {
      await api.psychologist.updateReport(id, { status })
      await load()
      toast.success(status === 'approved' ? 'Report approved and signed.' : 'Revision requested.')
    } catch (e) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  const handlePermission = async (patientId, status) => {
    setBusyId(patientId)
    try {
      await api.psychologist.grantAssessmentPermission({ patient_id: patientId, status })
      toast.success(status === 'granted' ? 'Assessment permission granted.' : 'Assessment permission denied.')
      await load()
    } catch (e) {
      toast.error(`Error: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <StaffHeader title="Approvals" />
      <div className="flex-1 overflow-y-auto p-6">
        {reports.length > 0 ? (
          <div className="rounded-xl bg-rose-100/80 px-4 py-3 text-sm text-rose-800 mb-5">
            <span className="font-bold">{reports.length} Report{reports.length === 1 ? '' : 's'} Pending Your Review!</span>
            <div className="mt-0.5 text-xs text-rose-700/80">
              These reports are ready for your final review and digital signature.
            </div>
          </div>
        ) : null}

        {/* Tab Selection */}
        <div className="mb-6 flex border-b border-purple-200">
          <button
            onClick={() => {
              setActiveTab('reports')
              setPage(1)
              setQuery('')
            }}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            Pending Reports ({reports.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('permissions')
              setPage(1)
              setQuery('')
            }}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'permissions'
                ? 'border-purple-700 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            Assessment Permissions ({permissions.length})
          </button>
        </div>

        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v)
              setPage(1)
            }}
            placeholder={activeTab === 'reports' ? "Search reports by student or type…" : "Search permissions by student or requester…"}
          />
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
            ))
          ) : pageRows.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              {q ? 'No items match your search.' : 'Nothing pending review.'}
            </div>
          ) : null}
          
          {!loading && activeTab === 'reports' && pageRows.map((r) => (
            <article key={r.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-purple-800">{r.name}</div>
                  <div className="text-sm text-slate-600">{r.type}</div>
                  <div className="text-xs text-slate-500">Submitted: {fmtDate(r.date)}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityTone[r.priority]}`}>
                  {r.priority}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => act(r.id, 'approved')}
                  disabled={busyId === r.id}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
                >
                  {busyId === r.id ? 'Working…' : 'Approve & Sign'}
                </button>
                <button
                  type="button"
                  onClick={() => act(r.id, 'revise_requested')}
                  disabled={busyId === r.id}
                  className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60 cursor-pointer"
                >
                  Request Revision
                </button>
              </div>
            </article>
          ))}

          {!loading && activeTab === 'permissions' && pageRows.map((p) => (
            <article key={p.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-purple-800">{p.student_name}</div>
                  <div className="text-sm text-slate-600">Request for Assessment Authorization</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Requested by: <span className="font-semibold text-purple-700">{p.requested_by}</span>
                  </div>
                  <div className="text-xs text-slate-400">Submitted: {fmtDate(p.date)}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handlePermission(p.patient_id, 'granted')}
                  disabled={busyId === p.patient_id}
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60 cursor-pointer animate-pulse-subtle"
                >
                  {busyId === p.patient_id ? 'Working…' : 'Allow Assessment'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePermission(p.patient_id, 'none')}
                  disabled={busyId === p.patient_id}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
                >
                  Deny
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length > PAGE_SIZE && (
          <div className="mt-5">
            <Pagination page={page} pageSize={PAGE_SIZE} total={visibleItems.length} onPage={setPage} />
          </div>
        )}
      </div>
    </>
  )
}

export default Approvals;
