import { useMemo, useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput, fieldTextarea, fieldReadonly } from '../../../components/ui/formStyles'

const CORE_DOMAINS = [
  'Practical Domain',
  'Social Domain',
  'Conceptual Domain',
  'Fine Motor Skills',
  'Gross Motor Skills',
]
const ADAPTIVE_DOMAINS = ['Mathematics', 'Literacy', 'Writing']

const REFERRAL_DEFAULT =
  'The client is referred to the clinic for evaluation of his/her adaptive functioning, as part of his/her Special Needs Education (SNED) program enrollment.'

const DEFAULT_SOURCES = [
  { name: 'Caregiver Checklist · FO-03', status: 'processed', from: '', note: '' },
  { name: 'MMSE · FO-04', status: 'scored', from: '', note: '' },
  { name: 'Adaptive Functioning Tool · FO-05', status: 'pending', from: '', note: '' },
]

const STATUS_OPTIONS = ['pending', 'processed', 'scored', 'approved']

function calcAge(birthdate, evalDate) {
  if (!birthdate) return ''
  const dob = new Date(birthdate)
  if (Number.isNaN(dob.getTime())) return ''
  const ref = evalDate ? new Date(evalDate) : new Date()
  let age = ref.getFullYear() - dob.getFullYear()
  const m = ref.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age--
  return age >= 0 ? `${age} years old` : ''
}

function ScoreTable({ domains }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-purple-100 bg-purple-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
              Domain
            </th>
            <th className="w-32 border border-purple-100 bg-purple-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
              Raw Score
            </th>
            <th className="border border-purple-100 bg-purple-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-purple-800">
              Verbal Interpretation
            </th>
          </tr>
        </thead>
        <tbody>
          {domains.map((d) => (
            <tr key={d}>
              <td className="whitespace-nowrap border border-purple-100 bg-purple-50/40 px-3 py-2 text-sm font-semibold text-slate-700">
                {d}
              </td>
              <td className="border border-purple-100 p-1">
                <input type="number" className={fieldInput} placeholder="Raw score" />
              </td>
              <td className="border border-purple-100 p-1">
                <input type="text" className={fieldInput} placeholder="e.g. Average" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SignCard({ role, person, defaultLicense = '', sigLabel }) {
  const [sig, setSig] = useState(null)
  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
      <div className="font-serif text-sm font-semibold text-purple-900">{role}</div>
      <div className="mb-3 text-xs text-slate-500">{person}</div>
      <FormField label="Name" className="mb-3">
        <input className={fieldInput} defaultValue={person} />
      </FormField>
      <FormField label="License Number" className="mb-3">
        <input className={fieldInput} defaultValue={defaultLicense} placeholder="License no." />
      </FormField>
      <SignaturePad label={sigLabel} value={sig} onChange={setSig} />
      <FormField label="Date" className="mt-3">
        <input type="date" className={fieldInput} />
      </FormField>
    </div>
  )
}

function DataSources() {
  const [sources, setSources] = useState(DEFAULT_SOURCES)

  const update = (i, key, value) =>
    setSources((s) => s.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  const remove = (i) => setSources((s) => s.filter((_, idx) => idx !== i))
  const add = () =>
    setSources((s) => [...s, { name: 'New source', status: 'pending', from: '', note: '' }])

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">
        Reference the source documents behind this assessment. Update status as each comes in.
      </p>
      {sources.map((row, i) => (
        <div key={i} className="rounded-xl border border-purple-100 bg-purple-50/40 p-3">
          <div className="flex items-start gap-2">
            <input
              className={fieldInput}
              value={row.name}
              onChange={(e) => update(i, 'name', e.target.value)}
            />
            <select
              className={fieldInput + ' w-36 shrink-0'}
              value={row.status}
              onChange={(e) => update(i, 'status', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Source" className="mt-2">
            <input
              className={fieldInput}
              value={row.from}
              onChange={(e) => update(i, 'from', e.target.value)}
              placeholder="Who provided this"
            />
          </FormField>
          <FormField label="Flagged note" className="mt-2">
            <textarea
              className={fieldTextarea}
              value={row.note}
              onChange={(e) => update(i, 'note', e.target.value)}
              placeholder="Key observation or flagged note"
            />
          </FormField>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs font-medium text-rose-600 hover:text-rose-800"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border-2 border-dashed border-purple-300 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50"
      >
        Add data source
      </button>
    </div>
  )
}

function FormBody() {
  const [birthdate, setBirthdate] = useState('')
  const [evalDate, setEvalDate] = useState('')
  const age = useMemo(() => calcAge(birthdate, evalDate), [birthdate, evalDate])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <FormSection eyebrow="I" title="Personal Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name (LN, FN MI)">
              <input className={fieldInput} placeholder="e.g. Dela Cruz, Juan M." />
            </FormField>
            <FormField label="Sex">
              <select className={fieldInput} defaultValue="">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </FormField>
            <FormField label="Birthdate">
              <input
                type="date"
                className={fieldInput}
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </FormField>
            <FormField label="Age (auto-calculated)">
              <input className={fieldReadonly} value={age} readOnly placeholder="—" />
            </FormField>
            <FormField label="Date of Evaluation">
              <input
                type="date"
                className={fieldInput}
                value={evalDate}
                onChange={(e) => setEvalDate(e.target.value)}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection eyebrow="II" title="Reason for Referral">
          <textarea className={fieldTextarea} defaultValue={REFERRAL_DEFAULT} />
          <p className="mt-1 text-[11px] text-slate-400">
            Standard referral text — edit to reflect this client's specific circumstances if needed.
          </p>
        </FormSection>

        <FormSection eyebrow="III" title="Background Information">
          <textarea
            className={fieldTextarea + ' min-h-[110px]'}
            placeholder="Relevant developmental, medical, academic, and behavioral history as reported by the parent/guardian and/or teacher. Include previous diagnoses (if any), interventions received, and pertinent family or school information."
          />
        </FormSection>

        <FormSection eyebrow="IV" title="Assessment Methods">
          <div className="space-y-2">
            {[
              'Caregiver Behavioral Observation Checklist',
              'Mini-Mental Status Examination',
              'Child Adaptive Functioning Assessment Tool',
            ].map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-purple-600" />
                {m}
              </label>
            ))}
          </div>
          <FormField label="Other method used (optional)" className="mt-3">
            <input className={fieldInput} placeholder="e.g. Vineland Adaptive Behavior Scales" />
          </FormField>
        </FormSection>

        <FormSection eyebrow="V" title="Behavioral Observations">
          <h3 className="mb-2 text-[13px] font-bold text-purple-900">
            A. Caregiver Behavioral Observation Checklist
          </h3>
          <ScoreTable domains={CORE_DOMAINS} />
          <h3 className="mb-2 mt-5 text-[13px] font-bold text-purple-900">
            B. Mini-Mental Status Examination
          </h3>
          <ScoreTable domains={CORE_DOMAINS} />
          <h3 className="mb-2 mt-5 text-[13px] font-bold text-purple-900">
            C. Child Adaptive Functioning Assessment Tool
          </h3>
          <ScoreTable domains={ADAPTIVE_DOMAINS} />
        </FormSection>

        <FormSection eyebrow="VI" title="Summary of Findings">
          <textarea
            className={fieldTextarea + ' min-h-[100px]'}
            placeholder="Summarize the overall pattern across the assessments above."
          />
        </FormSection>

        <FormSection eyebrow="VII" title="Areas of Concern">
          <textarea
            className={fieldTextarea + ' min-h-[90px]'}
            placeholder="Note domains or behaviors that need continued attention or intervention."
          />
        </FormSection>

        <FormSection eyebrow="VIII" title="Recommendations">
          <textarea
            className={fieldTextarea + ' min-h-[90px]'}
            placeholder="List recommended interventions, referrals, or program placements."
          />
        </FormSection>

        <FormSection eyebrow="Sign-off" title="Authentication & Approval">
          <div className="grid gap-4 sm:grid-cols-2">
            <SignCard
              role="Prepared by — Registered Psychometrician (RPm)"
              person="Mr. Marwin A. Gilbero Jr., RPm, CHRA"
              defaultLicense="0039850"
              sigLabel="Prepared by signature"
            />
            <SignCard
              role="Noted / Approved by — Registered Psychologist (RPsy)"
              person="Ms. Cristine Lae C. Erasga, RPm, RPsy, CHRA"
              sigLabel="Noted / Approved by signature"
            />
          </div>
        </FormSection>
      </div>

      <aside>
        <FormSection title="Clinical Data Sources">
          <DataSources />
        </FormSection>
      </aside>
    </div>
  )
}

function BehavioralAssessmentForm({ onClose }) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <FormShell
      title="Behavioral Assessment Report"
      subtitle="Special Education Program"
      code="CMPS:SE-FO-06 rev.0 03032026"
      onReset={() => setResetKey((k) => k + 1)}
      onClose={onClose}
    >
      <FormBody key={resetKey} />
    </FormShell>
  )
}

export default BehavioralAssessmentForm
