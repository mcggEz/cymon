import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput, fieldTextarea } from '../../../components/ui/formStyles'

const DOMAIN_OPTIONS = [
  'Cognitive',
  'Emotional Regulation',
  'Social Skills',
  'Communication',
  'Attention & Focus',
  'Self-Help / Adaptive',
  'Sensory',
  'Behavioral',
  'Academic Readiness',
]

const SIGNATORIES = [
  {
    key: 'prepared',
    role: 'Prepared by — Registered Psychometrician (RPm)',
    name: 'Marwin A. Gilbero Jr., RPm, CHRA',
    fields: [{ label: 'Position', value: 'Clinic Intern' }],
  },
  {
    key: 'reviewed',
    role: 'Reviewed by',
    name: 'Marwin A. Gilbero Jr., RPm, CHRA',
    fields: [
      { label: 'Position', value: 'Special Education Program Coordinator' },
      { label: 'License Number', value: '0039850' },
    ],
  },
  {
    key: 'learningHead',
    role: 'Noted by — Learning Head',
    name: 'Leera Mae C. Guevarra, RPm, CHRA',
    fields: [{ label: 'License Number', value: '0039855' }],
  },
  {
    key: 'chief',
    role: 'Noted / Approved by — Chief Psychologist (RPsy)',
    name: 'Dr. Jinky C. Malabanan, RPm, RPsy, CHRA',
    fields: [{ label: 'License Number', value: '001475 / 002278' }],
  },
]

function DomainTags() {
  const [options, setOptions] = useState(DOMAIN_OPTIONS)
  const [active, setActive] = useState([])
  const [custom, setCustom] = useState('')

  const toggle = (d) =>
    setActive((a) => (a.includes(d) ? a.filter((x) => x !== d) : [...a, d]))
  const addCustom = () => {
    const val = custom.trim()
    if (!val) return
    if (!options.includes(val)) setOptions((o) => [...o, val])
    if (!active.includes(val)) setActive((a) => [...a, val])
    setCustom('')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((d) => {
          const on = active.includes(d)
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              className={`rounded-full border px-3 py-1.5 text-[12px] ${
                on
                  ? 'border-purple-600 bg-purple-600 font-semibold text-white'
                  : 'border-purple-200 bg-purple-50/60 text-slate-600 hover:border-purple-400'
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className={fieldInput}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder="Add another domain…"
        />
        <button
          type="button"
          onClick={addCustom}
          className="shrink-0 rounded-md border-2 border-dashed border-purple-300 px-4 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function ObservationTable() {
  const [rows, setRows] = useState([{ name: '', response: '' }])

  const update = (i, key, value) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  const add = () => setRows((r) => [...r, { name: '', response: '' }])
  const remove = (i) => setRows((r) => r.filter((_, idx) => idx !== i))

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-purple-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-12 border-b border-purple-100 bg-purple-50 px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                No.
              </th>
              <th className="border-b border-purple-100 bg-purple-50 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                Name of Student
              </th>
              <th className="border-b border-purple-100 bg-purple-50 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                Responses / Observed Behavior
              </th>
              <th className="w-14 border-b border-purple-100 bg-purple-50 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-purple-50 last:border-b-0 align-top">
                <td className="px-2 py-3 text-center text-sm font-bold text-purple-500">{i + 1}</td>
                <td className="p-1">
                  <input
                    className={fieldInput}
                    value={row.name}
                    onChange={(e) => update(i, 'name', e.target.value)}
                    placeholder="Student name"
                  />
                </td>
                <td className="p-1">
                  <textarea
                    className={fieldTextarea + ' min-h-[50px]'}
                    value={row.response}
                    onChange={(e) => update(i, 'response', e.target.value)}
                    placeholder="Describe the response or observed behavior…"
                  />
                </td>
                <td className="p-1 text-center">
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="rounded-full border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      title="Remove row"
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={add}
          className="rounded-md border-2 border-dashed border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          Add Student Row
        </button>
        <span className="text-xs text-slate-400">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'}
        </span>
      </div>
    </div>
  )
}

function SignatoryCard({ role, name, fields }) {
  const [sig, setSig] = useState(null)
  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
      <div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-purple-600">{role}</div>
      <FormField label="Full Name" className="mb-3">
        <input className={fieldInput} defaultValue={name} />
      </FormField>
      {fields.map((f) => (
        <FormField key={f.label} label={f.label} className="mb-3">
          <input className={fieldInput} defaultValue={f.value} />
        </FormField>
      ))}
      <SignaturePad label="Signature" value={sig} onChange={setSig} />
    </div>
  )
}

function Counter({ label, hint, maxLength }) {
  const [value, setValue] = useState('')
  return (
    <FormField label={label}>
      <textarea
        className={fieldTextarea + ' min-h-[90px]'}
        maxLength={maxLength}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={hint}
      />
      <div className="mt-1 text-right text-[11px] text-slate-400">
        {value.length}/{maxLength}
      </div>
    </FormField>
  )
}

function FormBody() {
  return (
    <div>
      <FormSection title="Activity Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Session Number">
            <input className={fieldInput} placeholder="e.g. SE-2026-014" />
          </FormField>
          <FormField label="Date of the Activity">
            <input type="date" className={fieldInput} />
          </FormField>
          <FormField
            label="Name of the Student/s"
            hint="Separate multiple names with a comma"
            className="sm:col-span-2"
          >
            <input className={fieldInput} placeholder="e.g. Juan Dela Cruz, Maria Santos" />
          </FormField>
          <FormField label="Title of the Activity/ies" className="sm:col-span-2">
            <input className={fieldInput} placeholder="e.g. Emotion Regulation Card Sort" />
          </FormField>
          <FormField
            label="Targeted Domain/s"
            hint="Click to select, or add your own"
            className="sm:col-span-2"
          >
            <DomainTags />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Objectives & Procedure">
        <div className="grid gap-4">
          <Counter
            label="Objectives"
            maxLength={800}
            hint="What this activity aims to achieve for the student/s…"
          />
          <Counter
            label="Activity Procedure"
            maxLength={1200}
            hint="Step-by-step description of how the activity was conducted…"
          />
        </div>
      </FormSection>

      <FormSection title="Responses / Observed Behavior">
        <ObservationTable />
      </FormSection>

      <FormSection title="Signatories">
        <div className="grid gap-4 sm:grid-cols-2">
          {SIGNATORIES.map((s) => (
            <SignatoryCard key={s.key} role={s.role} name={s.name} fields={s.fields} />
          ))}
        </div>
      </FormSection>
    </div>
  )
}

function DailyActivityReportForm({ onClose }) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <FormShell
      title="Daily Activity Report"
      code="CMPS:SE-FO-07 rev.0 03032026"
      onReset={() => setResetKey((k) => k + 1)}
      onClose={onClose}
    >
      <FormBody key={resetKey} />
    </FormShell>
  )
}

export default DailyActivityReportForm
