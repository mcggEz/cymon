import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import RowAction from '../../../components/ui/RowAction'
import IepSpedForm from './IepSpedForm'
import { toast } from 'react-hot-toast'

const STATUS_META = {
  draft: { label: 'Draft', tone: 'bg-amber-100 text-amber-700 hover:bg-amber-200/60' },
  ready_for_review: { label: 'Under Review', tone: 'bg-sky-100 text-sky-700 hover:bg-sky-200/60' },
  approved: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200/60' },
  revise_requested: { label: 'Needs Revision', tone: 'bg-rose-100 text-rose-700 hover:bg-rose-200/60' },
}

function IepSped() {
  const [active, setActive] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [rows, setRows] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [query, setQuery] = useState('')

  const load = () =>
    api.psychometrician
      .iep()
      .then((d) => {
        setRows(d.rows || [])
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

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)
  const patientLogs = rows.filter((r) => r.patient_id === selectedPatientId)

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const handleOpenAddForm = () => {
    setActive(null)
    setOpenForm(true)
  }

  const handleOpenEdit = (log) => {
    setActive(log)
    setOpenForm(true)
  }

  const handleSaved = () => {
    setOpenForm(false)
    setActive(null)
    load()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StaffHeader title="Individualized Education Plan (IEP)" />
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col overflow-hidden">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 flex-1 overflow-hidden min-h-0">
            
            {/* Left Panel: Students List - Do not hide on form render */}
            <div className="rounded-2xl bg-white border border-purple-200 p-5 shadow-sm h-full flex flex-col overflow-hidden">
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
                        onClick={() => {
                          setSelectedPatientId(p.id)
                          // Close form to show dashboard details on click change
                          setOpenForm(false)
                          setActive(null)
                        }}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all hover:bg-purple-50/50 cursor-pointer group ${
                          isActive ? 'border-purple-300 bg-purple-100 shadow-sm text-purple-950 font-bold' : 'border-transparent'
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

            {/* Right Panel: Forms and Logs */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
              {openForm && selectedPatient ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setOpenForm(false)
                        setActive(null)
                      }}
                      className="rounded-lg border border-purple-200 bg-white px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      &larr; Back to Dashboard Tables
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <IepSpedForm
                      patient={selectedPatient}
                      report={active}
                      onSaved={handleSaved}
                      onClose={() => {
                        setOpenForm(false)
                        setActive(null)
                      }}
                      inline={true}
                    />
                  </div>
                </div>
              ) : selectedPatient ? (
                <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                  {/* Selected Student header */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h1 className="text-xl font-bold text-purple-800">
                          {selectedPatient.name}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage SPED Individualized Educational Plan progress and activity plans.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenAddForm}
                        className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 cursor-pointer"
                      >
                        + Write IEP Plan
                      </button>
                    </div>
                  </div>

                  {/* Student History Logs list */}
                  <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3">
                      IEP Plan History
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs font-semibold tracking-wider text-purple-700 border-b border-purple-100">
                            <th className="py-2.5 px-3 text-left">Plan Title</th>
                            <th className="py-2.5 px-3 text-left">Last Updated</th>
                            <th className="py-2.5 px-3 text-left">Status</th>
                            <th className="py-2.5 px-3 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-50/40">
                          {patientLogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                No IEP plans recorded for this student yet.
                              </td>
                            </tr>
                          ) : (
                            patientLogs.map((log) => {
                              const meta = STATUS_META[log.status] || STATUS_META.draft
                              return (
                                <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                                  <td className="py-3 px-3 text-slate-800 font-semibold">
                                    {log.title}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 text-xs">
                                    {new Date(log.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.tone.split(' ')[0]} ${meta.tone.split(' ')[1]}`}>
                                      {meta.label}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3">
                                    <RowAction variant="edit" onClick={() => handleOpenEdit(log)}>
                                      Edit / View
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
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-purple-200 p-12 text-center text-slate-500 bg-white h-full flex flex-col items-center justify-center">
                  Please select a student from the list to view or prepare IEP records.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default IepSped
