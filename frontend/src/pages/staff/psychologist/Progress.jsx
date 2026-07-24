import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StaffHeader from '../StaffHeader'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import ProgressSummaryReportForm from './ProgressSummaryReportForm'
import { api } from '../../../lib/api'

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200/60',
  sky: 'bg-sky-100 text-sky-700 hover:bg-sky-200/60',
}

const STATUS_META = {
  approved: { label: 'Approved', tone: 'sky' },
  ready_for_review: { label: 'Ready', tone: 'sky' },
  draft: { label: 'Draft', tone: 'amber' },
  in_progress: { label: 'In Progress', tone: 'amber' },
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function Progress() {
  const [active, setActive] = useState(null)
  const [items, setItems] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [openForm, setOpenForm] = useState(false)
  const [formPrefill, setFormPrefill] = useState({ patientId: '', period: '' })

  const load = () =>
    api.psychologist
      .progress()
      .then((d) => {
        setItems(d.items || [])
        setPatients(d.patients || [])
        if (d.patients && d.patients.length > 0 && !selectedPatientId) {
          setSelectedPatientId(d.patients[0].id)
        }
      })
      .catch(() => {})

  useEffect(() => {
    let on = true
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const prevYear = () => setSelectedYear((y) => y - 1)
  const nextYear = () => setSelectedYear((y) => y + 1)

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const patientReports = items.filter((i) => i.patient_id === selectedPatientId)

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const handleOpenAddForm = (periodStr) => {
    setFormPrefill({ patientId: selectedPatientId, period: periodStr })
    setOpenForm(true)
  }

  const handleOpenEdit = (report) => {
    setActive(report)
    setOpenForm(true)
  }

  return (
    <>
      <StaffHeader title="Monthly Summary Progress Reports" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* Left Panel: Students List */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-[650px] flex flex-col">
              <h2 className="text-sm font-semibold text-purple-800 border-b border-purple-100 pb-3 shrink-0">
                Enrolled Students
              </h2>
              <div className="mt-3 shrink-0">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search students…"
                  className="w-full"
                />
              </div>
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
                {loading ? (
                  <SkeletonText lines={10} />
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">
                    No students found.
                  </div>
                ) : (
                  filteredPatients.map((p) => {
                    const isActive = selectedPatientId === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          isActive ? 'border-purple-300 bg-purple-100 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold text-sm ${isActive ? 'text-purple-900' : 'text-slate-800'}`}>
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            ID: {p.patient_id || 'N/A'}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Monthly Summary Progress Dashboard */}
            <div className="lg:col-span-2 space-y-6">
              {selectedPatient ? (
                <>
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Track and draft Monthly Progress Summary Reports (PSR) synthesizing child trajectory milestones.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenAddForm(`${MONTHS[new Date().getMonth()]} ${selectedYear}`)}
                        className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 cursor-pointer"
                      >
                        + New Progress Report
                      </button>
                    </div>
                  </div>

                  {/* Reports list */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3">
                      Progress Reports History
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                            <th className="py-2.5 px-3 text-left">Period</th>
                            <th className="py-2.5 px-3 text-left">Status</th>
                            <th className="py-2.5 px-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50/40">
                          {patientReports.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-xs text-slate-400">
                                No monthly progress reports recorded for this student yet.
                              </td>
                            </tr>
                          ) : (
                            patientReports.map((report) => {
                              const meta = STATUS_META[report.status] || STATUS_META.draft
                              return (
                                <tr key={report.id} className="hover:bg-purple-50/20 transition-colors">
                                  <td className="py-3 px-3 text-slate-800 font-semibold">
                                    {report.period || '—'}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone[meta.tone].split(' ')[0]} ${tone[meta.tone].split(' ')[1]}`}>
                                      {meta.label}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <RowAction variant="view" onClick={() => handleOpenEdit(report)}>
                                      Open
                                    </RowAction>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-purple-200 p-12 text-center text-slate-500 bg-white">
                  Please select a student from the list to view or log monthly summary progress.
                </div>
              )}
            </div>
          </div>
        </div>

        {openForm ? (
          <ProgressSummaryReportForm
            patients={patients}
            initialPatientId={formPrefill.patientId}
            initialPeriod={formPrefill.period}
            detail={active}
            onSaved={() => {
              load()
              setActive(null)
              setOpenForm(false)
            }}
            onClose={() => {
              setActive(null)
              setOpenForm(false)
            }}
          />
        ) : null}
      </div>
    </>
  )
}

export default Progress
