import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'
import Skeleton from '../../../components/ui/Skeleton'
import Avatar from '../../../components/ui/Avatar'

const STATUS_META = {
  draft: { label: 'DRAFT', tone: 'bg-amber-100 text-amber-700', primary: 'Continue Drafting' },
  in_progress: { label: 'IN PROGRESS', tone: 'bg-amber-100 text-amber-700', primary: 'Continue Drafting' },
  ready_for_review: { label: 'READY FOR REVIEW', tone: 'bg-emerald-100 text-emerald-700', primary: 'View Submitted Draft' },
  revise_requested: { label: 'REVISION REQUESTED', tone: 'bg-rose-100 text-rose-700', primary: 'Revise & Re-submit' },
  approved: { label: 'APPROVED', tone: 'bg-emerald-100 text-emerald-700', primary: 'View Report' },
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')

const Stat = ({ value, label, icon, loading }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 text-purple-700">
      {icon}
    </div>
    <div>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <div className="text-3xl font-bold text-slate-800">{value}</div>
      )}
      <div className="text-xs font-medium text-slate-600">{label}</div>
    </div>
  </div>
)

function PreviewModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between border-b border-purple-100 pb-3">
          <div>
            <div className="text-xl font-bold text-purple-800">Behavioral Assessment Report</div>
            <div className="text-xs text-slate-500">{row.name} · Updated Mar 28, 2026</div>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <section>
            <div className="text-xs font-semibold tracking-wider text-purple-700">BACKGROUND INFORMATION</div>
            <p className="mt-1">
              {row.name} was referred for assessment due to observed difficulties in sustaining
              attention during tasks and frequent emotional dysregulation at home.
            </p>
          </section>
          <section>
            <div className="text-xs font-semibold tracking-wider text-purple-700">SUMMARY OF FINDINGS</div>
            <p className="mt-1">
              During testing, {row.name} displayed high levels of distractibility. He required
              multiple verbal prompts.
            </p>
          </section>
          <section>
            <div className="text-xs font-semibold tracking-wider text-purple-700">AREAS OF CONCERN</div>
            <p className="mt-1 italic text-slate-500">[Pending Clinician Input]</p>
          </section>
          <section>
            <div className="text-xs font-semibold tracking-wider text-purple-700">RECOMMENDATIONS</div>
            <p className="mt-1 italic text-slate-500">[Pending Clinician Input]</p>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Close
          </button>
          <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
            🖨 Print / Download
          </button>
        </div>
      </div>
    </div>
  )
}

function DraftingReports() {
  const [active, setActive] = useState(null)
  const [drafts, setDrafts] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = () =>
    api.psychometrician
      .reports()
      .then((d) => {
        setDrafts(d.drafts)
        setSummary(d.summary)
      })
      .catch(() => {})

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const submitForReview = async (id) => {
    setBusyId(id)
    try {
      await api.psychometrician.updateReport(id, { status: 'ready_for_review', completeness: 100 })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <StaffHeader
        title="Drafting Reports"
        subtitle="Behavioral Assessment Form (FO-06) ready for Psychologist review"
        showSearch={false}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-purple-800">Report Ledger</h1>
        <p className="text-sm text-slate-500">
          Synthesize assessment scores and observations into official reports.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Stat value={summary?.inProgress ?? '—'} label="Drafts in Progress" icon="📝" loading={loading} />
          <Stat value={summary?.readyForReview ?? '—'} label="Ready for Review" icon="✅" loading={loading} />
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-24" rounded="rounded-full" />
                </div>
                <Skeleton className="mt-4 h-2 w-full" rounded="rounded-full" />
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))
          ) : (
            <>
          {drafts.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              No reports in the ledger yet.
            </div>
          ) : null}
          {drafts.map((d) => {
            const meta = STATUS_META[d.status] || STATUS_META.draft
            return (
            <article key={d.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{d.name}</div>
                  <div className="text-xs text-slate-500">ID: {d.sid}</div>
                  <div className="text-xs text-slate-500">Last edit: {fmtDate(d.updated_at)}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                  {meta.label}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-500">Completeness</div>
                <div className="mt-1 h-2 w-full rounded-full bg-purple-100">
                  <div
                    className={`h-full rounded-full ${d.completeness === 100 ? 'bg-emerald-500' : 'bg-purple-700'}`}
                    style={{ width: `${d.completeness}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href="#editor"
                  className="rounded-md bg-purple-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-purple-800"
                >
                  ✏ {meta.primary}
                </a>
                <button
                  onClick={() => setActive(d)}
                  className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  👁 Preview
                </button>
              </div>
              {['draft', 'in_progress', 'revise_requested'].includes(d.status) ? (
                <button
                  onClick={() => submitForReview(d.id)}
                  disabled={busyId === d.id}
                  className="mt-3 w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {busyId === d.id ? 'Submitting…' : '✓ Submit for Psychologist Review'}
                </button>
              ) : null}
            </article>
            )
          })}
            </>
          )}
        </div>

        <section id="editor" className="mt-8 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar name="Casey Williams" size="lg" />
            <div className="flex-1">
              <h2 className="text-center text-2xl font-bold text-purple-800">Behavioral Assessment Report</h2>
              <div className="text-center text-xs text-slate-500">
                Special Education Program · CMPS:SE-FO-06 rev.6 03/22/2026
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">👤 I. Personal Information</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <label>
                    <div className="font-semibold text-purple-700">Full Name</div>
                    <input className="mt-1 h-9 w-full rounded-md border border-purple-200 bg-white px-2 text-sm" />
                  </label>
                  <label>
                    <div className="font-semibold text-purple-700">Birthdate</div>
                    <input type="date" className="mt-1 h-9 w-full rounded-md border border-purple-200 bg-white px-2 text-sm" />
                  </label>
                  <label>
                    <div className="font-semibold text-purple-700">Sex</div>
                    <select className="mt-1 h-9 w-full rounded-md border border-purple-200 bg-white px-2 text-sm">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </label>
                  <label>
                    <div className="font-semibold text-purple-700">Date of Assessment</div>
                    <input type="date" className="mt-1 h-9 w-full rounded-md border border-purple-200 bg-white px-2 text-sm" />
                  </label>
                </div>
              </div>

              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">📚 II & III. Background Information</div>
                <label className="mt-3 block text-xs">
                  <div className="font-semibold text-purple-700">A. Reason for Referral</div>
                  <textarea rows={2} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1 text-sm" />
                </label>
                <label className="mt-3 block text-xs">
                  <div className="font-semibold text-purple-700">B. Background Information</div>
                  <textarea rows={3} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1 text-sm" />
                </label>
              </div>

              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">🧪 IV. Assessment Methods</div>
                <div className="mt-2 space-y-1 text-sm">
                  {['Caregiver Behavioral Observation Checklist', 'Mini-Mental Status Examination', 'Child Adaptive Functioning Assessment Tool'].map((m) => (
                    <label key={m} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-slate-700">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">📊 V. Behavioral Observations Data</div>
                <div className="mt-2 text-xs font-semibold text-purple-700">
                  A. Caregiver Behavioral Checklist Summary
                </div>
                <table className="mt-2 w-full text-sm">
                  <thead>
                    <tr className="text-xs text-purple-700">
                      <th className="py-1 text-left">Domain</th>
                      <th className="py-1 text-left">Raw Score</th>
                      <th className="py-1 text-left">Verbal Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="py-1">Practical Domain</td><td>4</td><td>Average</td></tr>
                    <tr><td className="py-1">Social Domain</td><td>3</td><td>Functional</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">✏ Clinical Synthesis</div>
                <label className="mt-3 block text-xs">
                  <div className="font-semibold text-purple-700">VI. Summary of Findings</div>
                  <textarea rows={2} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1 text-sm" />
                </label>
                <label className="mt-3 block text-xs">
                  <div className="font-semibold text-purple-700">VII. Areas of Concern</div>
                  <textarea rows={2} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1 text-sm" />
                </label>
                <label className="mt-3 block text-xs">
                  <div className="font-semibold text-purple-700">VIII. Recommendations</div>
                  <textarea rows={2} className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1 text-sm" />
                </label>
              </div>

              <div className="rounded-md border border-purple-200 bg-purple-50 p-4">
                <div className="text-sm font-semibold text-purple-800">⚖ Authentication & Approval</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-purple-700">PREPARED BY:</div>
                    <div className="mt-1 h-16 rounded-md border border-purple-200 bg-white" />
                    <button className="mt-1 text-xs text-purple-700 underline">Clear Signature</button>
                    <div className="mt-1 text-xs text-slate-500">Erika Faustino, RPm</div>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-700">NOTED BY:</div>
                    <div className="mt-1 h-16 rounded-md border border-purple-200 bg-white" />
                    <button className="mt-1 text-xs text-purple-700 underline">Clear Signature</button>
                    <div className="mt-1 text-xs text-slate-500">Dr. Jinky Malabanan, RPsy</div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-md border border-purple-200 bg-purple-50 p-4">
              <div className="text-sm font-semibold text-purple-800">📋 CLINICAL DATA SOURCES</div>
              <div className="mt-3 space-y-3 text-xs">
                {[
                  { code: 'Caregiver FO-03', label: 'Source: Maria (Mother)', flag: 'Flagged: "Experiences intense meltdowns lasting >10 mins."', status: 'Processed', tone: 'emerald' },
                  { code: 'MMSE FO-04', label: 'Score: 12/28', sub: 'Practical Domain: 3/5 · Conceptual Domain: 2/7', status: 'Scored', tone: 'sky' },
                  { code: 'Daily Activity FO-07', label: 'Observation: Showed frustration with color pegs.', sub: 'Required 3 verbal cue time.', status: 'Approved', tone: 'amber' },
                ].map((s) => (
                  <div key={s.code} className="rounded-md border border-purple-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-purple-800">{s.code}</div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${{
                        emerald: 'bg-emerald-100 text-emerald-700',
                        sky: 'bg-sky-100 text-sky-700',
                        amber: 'bg-amber-100 text-amber-700',
                      }[s.tone]}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-700">{s.label}</div>
                    {s.flag ? <div className="mt-1 text-rose-600">{s.flag}</div> : null}
                    {s.sub ? <div className="mt-0.5 text-slate-500">{s.sub}</div> : null}
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="rounded-md border border-purple-300 px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50">
              💾 Save Draft
            </button>
            <button className="rounded-md bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600">
              ✓ Finalize & Submit
            </button>
          </div>
        </section>

        {active ? <PreviewModal row={active} onClose={() => setActive(null)} /> : null}
      </div>
    </>
  )
}

export default DraftingReports
