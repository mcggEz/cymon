import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput, fieldTextarea } from '../../../components/ui/formStyles'

const RUBRIC = [
  {
    key: 'assistance',
    title: 'Assistance',
    sub: '(Physical Support)',
    min: 'Completes task independently; 1–2 instances of physical assistance.',
    mod: 'Requires 3–4 brief physical assists (e.g., HOHA positioning).',
    max: 'Requires 5+ physical assists OR sustained hand-over-hand/full physical support for most of the task.',
  },
  {
    key: 'prompts',
    title: 'Prompts',
    sub: '(Instructional Guidance)',
    min: 'Follows task after 1–2 simple prompt.',
    mod: 'Requires 3–4 structured prompts (e.g., step reminders).',
    max: 'Requires 5+ prompts OR full step-by-step prompting for majority of task components.',
  },
  {
    key: 'cues',
    title: 'Cues',
    sub: '(Verbal/Visual Signals)',
    min: 'Responds appropriately after 1–2 cue.',
    mod: 'Requires 3–4 cues to initiate or complete task.',
    max: 'Requires 5+ cues OR continuous cueing throughout the task.',
  },
  {
    key: 'prodding',
    title: 'Prodding',
    sub: '(Motivation/Redirection)',
    min: 'Needs 1–2 redirection to stay engaged.',
    mod: 'Needs 3–4 redirections to sustain participation.',
    max: 'Needs 5+ redirections OR continuous motivational support to remain on task.',
  },
]

const DOMAINS = [
  'Practical Domain',
  'Social Domain',
  'Conceptual Domain',
  'Fine Motor Skills',
  'Gross Motor Skills',
]

const emptyAttendance = () => ({ date: '', status: '', timeIn: '', timeOut: '', remarks: '' })
const emptySession = () => ({
  date: '',
  domain: '',
  activity: '',
  assistance: '',
  prompts: '',
  cues: '',
  prodding: '',
  notes: '',
})

function AttendanceSessionForm({ onClose }) {
  const [attendance, setAttendance] = useState([emptyAttendance()])
  const [sessions, setSessions] = useState([emptySession()])
  const [facilitatorSig, setFacilitatorSig] = useState(null)

  const setAttendanceCell = (i, key, value) =>
    setAttendance((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  const setSessionCell = (i, key, value) =>
    setSessions((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))

  const presentCount = attendance.filter((r) => r.status === 'Present').length
  const absentCount = attendance.filter((r) => r.status === 'Absent').length
  const excusedCount = attendance.filter((r) => r.status === 'Excused').length

  return (
    <FormShell
      title="Attendance & Session Record"
      subtitle="Special Education Program"
      code="CMPS:SE-FO-11 rev.0 03092026"
      onClose={onClose}
      multiPage={true}
    >
      <div>
        <FormSection eyebrow="01" title="Student Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Name of Student" className="sm:col-span-1">
            <input className={fieldInput} placeholder="Full name" />
          </FormField>
          <FormField label="Program Enrolled">
            <select className={fieldInput} defaultValue="">
              <option value="">Select</option>
              <option>Higher Support Needs (HSN)</option>
              <option>Moderate Support Needs (MSN)</option>
              <option>Low Support Needs (LSN)</option>
              <option>Individual Session</option>
            </select>
          </FormField>
          <FormField label="Month / Year">
            <input className={fieldInput} placeholder="e.g. March 2026" />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="02" title="Attendance Record">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-purple-100 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                <th className="border border-purple-200 px-2 py-2">Date</th>
                <th className="border border-purple-200 px-2 py-2">Status</th>
                <th className="border border-purple-200 px-2 py-2">Time In</th>
                <th className="border border-purple-200 px-2 py-2">Time Out</th>
                <th className="border border-purple-200 px-2 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((row, i) => (
                <tr key={i}>
                  <td className="border border-purple-200 p-1">
                    <input
                      type="date"
                      className={fieldInput}
                      value={row.date}
                      onChange={(e) => setAttendanceCell(i, 'date', e.target.value)}
                    />
                  </td>
                  <td className="border border-purple-200 p-1">
                    <select
                      className={fieldInput}
                      value={row.status}
                      onChange={(e) => setAttendanceCell(i, 'status', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Excused</option>
                    </select>
                  </td>
                  <td className="border border-purple-200 p-1">
                    <input
                      type="time"
                      className={fieldInput}
                      value={row.timeIn}
                      onChange={(e) => setAttendanceCell(i, 'timeIn', e.target.value)}
                    />
                  </td>
                  <td className="border border-purple-200 p-1">
                    <input
                      type="time"
                      className={fieldInput}
                      value={row.timeOut}
                      onChange={(e) => setAttendanceCell(i, 'timeOut', e.target.value)}
                    />
                  </td>
                  <td className="border border-purple-200 p-1">
                    <input
                      className={fieldInput}
                      value={row.remarks}
                      onChange={(e) => setAttendanceCell(i, 'remarks', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setAttendance((rows) => [...rows, emptyAttendance()])}
            className="rounded-md border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 print:hidden"
          >
            Add row
          </button>
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600">
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-emerald-700">Present: {presentCount}</span>
            <span className="rounded-md bg-rose-100 px-3 py-1 text-rose-700">Absent: {absentCount}</span>
            <span className="rounded-md bg-amber-100 px-3 py-1 text-amber-700">Excused: {excusedCount}</span>
          </div>
        </div>
      </FormSection>
      </div>

      <div>
        <FormSection eyebrow="03" title="Session Log">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-purple-100 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                <th className="border border-purple-200 px-2 py-2">No.</th>
                <th className="border border-purple-200 px-2 py-2">Date</th>
                <th className="border border-purple-200 px-2 py-2">Targeted Domain</th>
                <th className="border border-purple-200 px-2 py-2">Title of Activity</th>
                <th className="border border-purple-200 px-2 py-2">Assistance</th>
                <th className="border border-purple-200 px-2 py-2">Prompts</th>
                <th className="border border-purple-200 px-2 py-2">Cues</th>
                <th className="border border-purple-200 px-2 py-2">Prodding</th>
                <th className="border border-purple-200 px-2 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((row, i) => (
                <tr key={i}>
                  <td className="border border-purple-200 px-2 py-1 text-center text-slate-500">{i + 1}</td>
                  <td className="border border-purple-200 p-1">
                    <input
                      type="date"
                      className={fieldInput}
                      value={row.date}
                      onChange={(e) => setSessionCell(i, 'date', e.target.value)}
                    />
                  </td>
                  <td className="border border-purple-200 p-1">
                    <select
                      className={fieldInput}
                      value={row.domain}
                      onChange={(e) => setSessionCell(i, 'domain', e.target.value)}
                    >
                      <option value="">Select</option>
                      {DOMAINS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-purple-200 p-1">
                    <input
                      className={fieldInput}
                      value={row.activity}
                      onChange={(e) => setSessionCell(i, 'activity', e.target.value)}
                    />
                  </td>
                  {['assistance', 'prompts', 'cues', 'prodding'].map((k) => (
                    <td key={k} className="border border-purple-200 p-1">
                      <input
                        className={fieldInput}
                        placeholder="Min / Mod / Max"
                        value={row[k]}
                        onChange={(e) => setSessionCell(i, k, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border border-purple-200 p-1">
                    <input
                      className={fieldInput}
                      value={row.notes}
                      onChange={(e) => setSessionCell(i, 'notes', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setSessions((rows) => [...rows, emptySession()])}
            className="rounded-md border border-purple-300 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 print:hidden"
          >
            Add row
          </button>
        </div>
      </FormSection>
      </div>

      <div>
        <FormSection eyebrow="Reference" title="Support Level Guide">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-purple-100 text-left font-semibold text-purple-800">
                <th className="border border-purple-200 px-2 py-2">Category</th>
                <th className="border border-purple-200 px-2 py-2">Minimum Support</th>
                <th className="border border-purple-200 px-2 py-2">Moderate Support</th>
                <th className="border border-purple-200 px-2 py-2">Maximum Support</th>
              </tr>
            </thead>
            <tbody>
              {RUBRIC.map((r) => (
                <tr key={r.key}>
                  <td className="border border-purple-200 bg-purple-50/40 px-2 py-2 font-bold text-slate-700">
                    {r.title}
                    <span className="block text-[11px] font-normal text-slate-500">{r.sub}</span>
                  </td>
                  <td className="border border-purple-200 px-2 py-2 align-top text-slate-700">{r.min}</td>
                  <td className="border border-purple-200 px-2 py-2 align-top text-slate-700">{r.mod}</td>
                  <td className="border border-purple-200 px-2 py-2 align-top text-slate-700">{r.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormSection eyebrow="Sign-off" title="Facilitator Sign-off">
        <div className="max-w-md">
          <SignaturePad
            label="Signature over Printed Name of Facilitator"
            value={facilitatorSig}
            onChange={setFacilitatorSig}
          />
          <FormField label="Date" className="mt-3">
            <input type="date" className={fieldInput} />
          </FormField>
          <FormField label="Additional Notes (optional)" className="mt-3">
            <textarea className={fieldTextarea} placeholder="Anything else worth recording about this month" />
          </FormField>
        </div>
      </FormSection>
      </div>
    </FormShell>
  )
}

export default AttendanceSessionForm
