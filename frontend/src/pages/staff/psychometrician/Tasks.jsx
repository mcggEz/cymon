import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'
import { useAuth } from '../../../auth/useAuth'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'

const statusTone = {
  SCHEDULED: 'bg-sky-100 text-sky-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
}

function Tasks() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('sessions')

  useEffect(() => {
    let on = true
    api.psychometrician
      .tasks()
      .then((d) => {
        if (!on) return
        setTasks(d.tasks || [])
        setAssessments(d.assessments || [])
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  const completed = tasks.filter((t) => t.status === 'COMPLETED').length

  return (
    <>
      <StaffHeader title={`Good Day, ${profile?.display_name || 'Doctor'}!`} />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900 p-5 text-white">
          <div className="text-base font-semibold">
            Daily Clinical Reminders & Instructions
          </div>
          <ul className="mt-3 space-y-2 text-sm text-purple-50">
            <li>
              <span className="font-semibold">Pre-Assessment:</span> Ensure a quiet testing
              environment and establish rapport before initiating the MMSE (CMPS:SE-FO-04) or CAFAT
              (CMPS:SE-FO-05).
            </li>
            <li>
              <span className="font-semibold">Data Encoding:</span> Record all raw scores accurately
              during the session. Mark items as &quot;N/A&quot; rather than &quot;0&quot; if the
              child refused to answer due to behavioral non-compliance.
            </li>
            <li>
              <span className="font-semibold">Observations:</span> During the session, actively
              monitor and log any perceptual disturbances or stimming behaviors in the provided form
              sections.
            </li>
            <li>
              <span className="font-semibold">Post-Assessment:</span> Draft the Behavioral
              Assessment Report (CMPS:SE-FO-06) synthesizing today&apos;s scores and submit it to
              the Chief Psychologist for approval within 24 hours.
            </li>
          </ul>
        </section>

        <section className="mt-5 rounded-2xl border-2 border-purple-300 bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-purple-100">
            <h2 className="text-xl font-bold text-purple-800">Today&apos;s Task List</h2>
            <div className="flex rounded-lg bg-purple-50 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`rounded-md px-3 py-1.5 transition cursor-pointer ${
                  activeTab === 'sessions' ? 'bg-purple-700 text-white shadow' : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                Sessions ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`rounded-md px-3 py-1.5 transition cursor-pointer ${
                  activeTab === 'assessments' ? 'bg-purple-700 text-white shadow' : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                Assessments ({assessments.length})
              </button>
            </div>
          </div>

          <ul className="mt-4 divide-y divide-purple-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="py-4">
                  <Skeleton className="h-12 w-full" />
                </li>
              ))
            ) : (
              <>
                {activeTab === 'sessions' ? (
                  <>
                    {tasks.length === 0 ? (
                      <li className="py-4 text-sm text-slate-500">No scheduled sessions.</li>
                    ) : null}
                    {tasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-4 py-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-purple-800">{t.name}</div>
                            <div className="text-xs text-slate-500">{t.meta}</div>
                          </div>
                          <div className="mt-0.5 text-sm text-slate-600">
                            {t.detail}{' '}
                            <span className="ml-2 inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              {t.room}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-slate-700">{t.time}</div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[t.status]}`}>
                          {t.status}
                        </span>
                        <button
                          onClick={() =>
                            navigate(t.status === 'COMPLETED' ? '/psychometrician/reports' : '/psychometrician/assessments')
                          }
                          className={[
                            'rounded-md px-3 py-2 text-sm font-medium cursor-pointer',
                            t.status === 'COMPLETED'
                              ? 'border border-purple-300 text-purple-700 hover:bg-purple-50'
                              : 'bg-purple-700 text-white hover:bg-purple-800',
                          ].join(' ')}
                        >
                          {t.status === 'COMPLETED' ? 'Draft Report' : 'Start Assessment'}
                        </button>
                      </li>
                    ))}
                  </>
                ) : (
                  <>
                    {assessments.length === 0 ? (
                      <li className="py-4 text-sm text-slate-500">No pending assessments.</li>
                    ) : null}
                    {assessments.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-4 py-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-purple-800">{a.patientName}</div>
                            <div className="text-xs text-slate-500">{a.meta}</div>
                          </div>
                          <div className="mt-0.5 text-sm text-slate-600">
                            {a.title}{' '}
                            <span className="ml-2 inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
                              {a.code}
                            </span>
                          </div>
                          {a.dueDate ? (
                            <div className="mt-1 text-xs text-slate-500">
                              Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 uppercase">
                            {a.status}
                          </span>
                          <button
                            onClick={() => navigate('/psychometrician/assessments')}
                            className="rounded-md bg-purple-700 px-3 py-2 text-sm font-medium text-white hover:bg-purple-800 cursor-pointer"
                          >
                            Administer
                          </button>
                        </div>
                      </li>
                    ))}
                  </>
                )}
              </>
            )}
          </ul>
        </section>
      </div>
    </>
  )
}

export default Tasks
