import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput, fieldTextarea } from '../../../components/ui/formStyles'

const DOMAINS = ['Conceptual', 'Social', 'Bodily Kinesthetics', 'Practical']

const ASSESS_PLACEHOLDERS = {
  Conceptual:
    'e.g. During the cup-stacking activity, describe independence level, hand-over-hand assistance needed, and progress across attempts.',
  Social:
    'e.g. During group activities (Zumba, action imitation), describe engagement, ability to follow steps, and peer interaction.',
  'Bodily Kinesthetics':
    'e.g. During ball throwing/catching or gross motor activities, describe coordination, force/control, and response to guidance.',
  Practical:
    'e.g. During ADL board or self-care tasks, describe independence, verbal/physical assistance required, and specific difficulties observed.',
}

// Some domains contribute more than one plan card (Conceptual appears twice in
// the standard plan). Cards follow the domain order below, filtered by the Data
// checklist above.
const PLAN_ROW_TEMPLATE = {
  Practical: ['Practical Domain'],
  Conceptual: ['Conceptual Domain', 'Conceptual Domain (Receptive/Expressive Labeling)'],
  'Bodily Kinesthetics': ['Bodily Kinesthetic Domain'],
  Social: ['Social Domain'],
}
const PLAN_ORDER = ['Practical', 'Conceptual', 'Bodily Kinesthetics', 'Social']

function ProgressSummaryReportForm({ onClose }) {
  const [domains, setDomains] = useState(() =>
    DOMAINS.reduce((acc, d) => ({ ...acc, [d]: true }), {})
  )
  const [preparedSig, setPreparedSig] = useState(null)
  const [notedSig, setNotedSig] = useState(null)

  const toggleDomain = (d) => setDomains((s) => ({ ...s, [d]: !s[d] }))
  const activeDomains = DOMAINS.filter((d) => domains[d])
  const planCards = PLAN_ORDER.filter((d) => domains[d]).flatMap((d) =>
    PLAN_ROW_TEMPLATE[d].map((label) => ({ domain: d, label }))
  )

  return (
    <FormShell
      title="Monthly Progress Summary Report (PSR)"
      subtitle="Reporting period, domain assessment, and activity plan"
      code="CMPS:SE-FO-08 rev.0"
      onClose={onClose}
    >
      <FormSection eyebrow="Period" title="Reporting Period">
        <FormField label="Reporting Period" hint="e.g. March – May 2026">
          <input type="text" className={fieldInput} placeholder="e.g. March – May 2026" />
        </FormField>
      </FormSection>

      <FormSection eyebrow="01" title="Client Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Full Name">
            <input type="text" className={fieldInput} placeholder="e.g. Dela Cruz, Juan M." />
          </FormField>
          <FormField label="Age / Sex">
            <input type="text" className={fieldInput} placeholder="e.g. 6 / Male" />
          </FormField>
          <FormField label="Diagnosis">
            <input type="text" className={fieldInput} placeholder="e.g. ASD, Level 1" />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="02" title="Data">
        <p className="mb-3 text-[11px] text-slate-400">
          Select which domains this reporting period&apos;s activities measured. This also
          determines which sections appear below in Assessment and Plan.
        </p>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => {
            const on = domains[d]
            return (
              <label
                key={d}
                className={[
                  'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold',
                  on
                    ? 'border-purple-400 bg-purple-50 text-purple-900'
                    : 'border-purple-200 text-slate-600',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-purple-700"
                  checked={on}
                  onChange={() => toggleDomain(d)}
                />
                {d} Domain
              </label>
            )
          })}
        </div>
      </FormSection>

      <FormSection eyebrow="03" title="Assessment">
        <FormField label="General Overview" className="mb-4">
          <textarea
            className={fieldTextarea}
            placeholder="Describe the client's overall demeanor, engagement, and general observations across the reporting period."
          />
        </FormField>
        <div className="space-y-3">
          {activeDomains.map((d) => (
            <div key={d} className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
              <div className="mb-2 font-serif text-sm font-semibold text-purple-900">
                {d} Domain
              </div>
              <textarea className={fieldTextarea} placeholder={ASSESS_PLACEHOLDERS[d]} />
            </div>
          ))}
          {activeDomains.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Select at least one domain in Data above to add assessment sections.
            </p>
          ) : null}
        </div>
      </FormSection>

      <FormSection eyebrow="04" title="Plan">
        <p className="mb-3 text-[11px] text-slate-400">
          Activity plan to be implemented next. Cards follow the domains selected in Data above —
          fill in each field as your own observation/plan.
        </p>
        <div className="space-y-3">
          {planCards.map((card, i) => (
            <div
              key={`${card.label}-${i}`}
              className="rounded-xl border border-purple-100 bg-purple-50/30 p-4"
            >
              <div className="mb-3 font-serif text-sm font-semibold text-purple-900">
                {card.label}
              </div>
              <FormField label="Objective" className="mb-3">
                <textarea className={fieldTextarea} placeholder="Type the objective for this domain" />
              </FormField>
              <FormField label="Activities" className="mb-3">
                <textarea
                  className={fieldTextarea}
                  placeholder="Type the activities / observations for this domain"
                />
              </FormField>
              <div className="mb-3 grid gap-4 sm:grid-cols-2">
                <FormField label="Time Frame">
                  <input type="text" className={fieldInput} placeholder="e.g. Once a week" />
                </FormField>
                <FormField label="Responsible Person">
                  <input type="text" className={fieldInput} placeholder="e.g. Activity Therapist" />
                </FormField>
              </div>
              <FormField label="Expected Outcome">
                <textarea className={fieldTextarea} placeholder="Type the expected outcome" />
              </FormField>
            </div>
          ))}
          {planCards.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">
              Select at least one domain in Data above to add plan cards.
            </p>
          ) : null}
        </div>
      </FormSection>

      <FormSection eyebrow="05" title="Sign-off">
        <p className="mb-3 text-[11px] text-slate-400">
          Prepared by the assigned Registered Psychometrician (RPm); noted and approved by the
          Registered Psychologist (RPsy).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
            <div className="mb-1 font-serif text-sm font-semibold text-purple-900">Prepared by</div>
            <div className="mb-3 text-xs text-slate-500">Registered Psychometrician (RPm)</div>
            <FormField label="Name" className="mb-3">
              <input type="text" className={fieldInput} placeholder="Full name of RPm" />
            </FormField>
            <FormField label="License Number" className="mb-3">
              <input type="text" className={fieldInput} placeholder="RPm license no." />
            </FormField>
            <SignaturePad label="Signature" value={preparedSig} onChange={setPreparedSig} />
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/30 p-4">
            <div className="mb-1 font-serif text-sm font-semibold text-purple-900">
              Noted / Approved by
            </div>
            <div className="mb-3 text-xs text-slate-500">Registered Psychologist (RPsy)</div>
            <FormField label="Name" className="mb-3">
              <input type="text" className={fieldInput} placeholder="Full name of RPsy" />
            </FormField>
            <FormField label="License Number" className="mb-3">
              <input type="text" className={fieldInput} placeholder="RPsy license no." />
            </FormField>
            <SignaturePad label="Signature" value={notedSig} onChange={setNotedSig} />
          </div>
        </div>
      </FormSection>
    </FormShell>
  )
}

export default ProgressSummaryReportForm
