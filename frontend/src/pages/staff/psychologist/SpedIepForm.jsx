import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput, fieldTextarea } from '../../../components/ui/formStyles'

const DOMAINS = [
  { key: 'practical', name: 'Practical Domain' },
  { key: 'social', name: 'Social Domain' },
  { key: 'conceptual', name: 'Conceptual Domain' },
]

const LEVELS = [
  { code: 'LSN', name: 'Low Support Needs Program', badge: 'bg-emerald-600' },
  { code: 'MSN', name: 'Moderate Support Needs Program', badge: 'bg-amber-600' },
  { code: 'HSN', name: 'High Support Needs Program', badge: 'bg-rose-600' },
]

const SIGN_OFF = [
  { key: 'prepared', role: 'Prepared by', person: 'Behavioral Technician' },
  {
    key: 'checked',
    role: 'Checked by',
    person: 'Marwin A. Gilbero Jr, RPm, CHRA — SPED Program Coordinator',
  },
  {
    key: 'verified',
    role: 'Verified by',
    person: 'Leera Mae C. Guevarra, RPm, CHRA — Learning Head',
  },
  {
    key: 'noted',
    role: 'Noted by',
    person: 'Dr. Jinky C. Malabanan, RPm, RPsy, CHRA — Chief Psychologist',
  },
]

function DomainFields({ prefix }) {
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      <FormField label="Name of Activity">
        <textarea className={fieldTextarea} name={`${prefix}-activity`} />
      </FormField>
      <FormField label="Objectives">
        <textarea className={fieldTextarea} name={`${prefix}-objectives`} />
      </FormField>
      <FormField label="Instructional Materials Needed">
        <textarea className={fieldTextarea} name={`${prefix}-materials`} />
      </FormField>
      <FormField label="Notes">
        <textarea className={fieldTextarea} name={`${prefix}-notes`} />
      </FormField>
    </div>
  )
}

function WeekPanel({ week, index, canRemove, onRemove }) {
  return (
    <FormSection eyebrow={`Week ${index + 1}`} title="Level of Needs & Activity Plan">
      {canRemove ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Remove week
          </button>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {LEVELS.map((lvl) => (
          <label
            key={lvl.code}
            className="inline-flex flex-1 min-w-[160px] cursor-pointer items-center gap-2 rounded-xl border border-purple-200 px-3 py-2 hover:bg-purple-50"
          >
            <input type="radio" name={`level-${week}`} value={lvl.code} className="h-4 w-4 accent-purple-700" />
            <span className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold text-white ${lvl.badge}`}>
              {lvl.code}
            </span>
            <span className="text-xs text-slate-700">{lvl.name}</span>
          </label>
        ))}
      </div>

      <div className="space-y-3">
        {DOMAINS.map((d) => (
          <div key={d.key} className="overflow-hidden rounded-xl border border-purple-100">
            <div className="bg-purple-50 px-4 py-2 font-serif text-sm font-semibold text-purple-900">
              {d.name}
            </div>
            <div className="p-4">
              <DomainFields prefix={`w${week}-${d.key}`} />
            </div>
          </div>
        ))}

        <div className="overflow-hidden rounded-xl border border-purple-100">
          <div className="bg-purple-50 px-4 py-2 font-serif text-sm font-semibold text-purple-900">
            Bodily Kinesthetics
          </div>
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-purple-500">
                Fine Motor Skills
              </div>
              <DomainFields prefix={`w${week}-kin-fine`} />
            </div>
            <div className="border-t border-dashed border-purple-200 pt-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-purple-500">
                Gross Motor Skills
              </div>
              <DomainFields prefix={`w${week}-kin-gross`} />
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

function SpedIepForm({ onClose }) {
  const [weeks, setWeeks] = useState([1, 2, 3, 4])
  const [nextWeek, setNextWeek] = useState(5)
  const [signatures, setSignatures] = useState({})

  const addWeek = () => {
    setWeeks((w) => [...w, nextWeek])
    setNextWeek((n) => n + 1)
  }
  const removeWeek = (id) => setWeeks((w) => w.filter((x) => x !== id))
  const setSig = (key) => (value) => setSignatures((s) => ({ ...s, [key]: value }))

  return (
    <FormShell
      title="Special Education (SPED) Program"
      subtitle="Individualized Educational Plan — weekly activity and progress record"
      code="CMPS:SE-FO-10 rev.0"
      onClose={onClose}
    >
      <FormSection eyebrow="01" title="Learner Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Learner's Name">
            <input type="text" className={fieldInput} placeholder="Full name" />
          </FormField>
          <FormField label="Date of Birth">
            <input type="date" className={fieldInput} />
          </FormField>
          <FormField label="Plan Start Date">
            <input type="date" className={fieldInput} />
          </FormField>
          <FormField label="Behavioral Technician">
            <input type="text" className={fieldInput} placeholder="Prepared by" />
          </FormField>
          <FormField label="Diagnosis / Profile">
            <input type="text" className={fieldInput} placeholder="e.g. ASD, Level 1" />
          </FormField>
          <FormField label="Case Reference No.">
            <input type="text" className={fieldInput} placeholder="Optional" />
          </FormField>
        </div>
      </FormSection>

      {weeks.map((id, index) => (
        <WeekPanel
          key={id}
          week={id}
          index={index}
          canRemove={weeks.length > 1}
          onRemove={() => removeWeek(id)}
        />
      ))}

      <div className="mb-4 print:hidden">
        <button
          type="button"
          onClick={addWeek}
          className="w-full rounded-xl border-2 border-dashed border-purple-300 px-4 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-50"
        >
          + Add week
        </button>
      </div>

      <FormSection eyebrow="02" title="Sign-off">
        <div className="grid gap-4 sm:grid-cols-2">
          {SIGN_OFF.map((s) => (
            <div key={s.key} className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
              <div className="font-serif text-sm font-semibold text-purple-900">{s.role}</div>
              <div className="mb-3 text-xs text-slate-500">{s.person}</div>
              <SignaturePad
                label="Signature"
                value={signatures[s.key] || null}
                onChange={setSig(s.key)}
              />
              <FormField label="Date" className="mt-3">
                <input type="date" className={fieldInput} />
              </FormField>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Sign with mouse, trackpad, or touchscreen. Signatures are kept only in this browser.
        </p>
      </FormSection>
    </FormShell>
  )
}

export default SpedIepForm
