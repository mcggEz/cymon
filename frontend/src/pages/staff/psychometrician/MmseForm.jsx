import { useMemo, useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormSection from '../../../components/ui/FormSection'
import FormField from '../../../components/ui/FormField'
import SignaturePad from '../../../components/ui/SignaturePad'
import { fieldInput } from '../../../components/ui/formStyles'

const DOMAINS = [
  {
    title: 'I. Practical Domain',
    subs: [
      { label: 'A. Appearance', type: 'yna', items: ['Dresses appropriately for the occasion'] },
      {
        label: 'B. Activities of Daily Living',
        type: 'yna',
        items: [
          'Opens a simple container or zipper',
          'Can demonstrate handwashing when asked',
          'Removes or puts on a cloth/item (shoe, earring)',
          'Can independently drink from a cup or bottle',
        ],
      },
    ],
  },
  {
    title: 'II. Conceptual Domain',
    subs: [
      {
        label: 'A. Object Recognition',
        type: 'yna',
        items: [
          'Names at least two (2) familiar objects (pen, bottle)',
          'Can identify familiar faces (mother, father)',
        ],
      },
      {
        label: 'B. Identifying Details',
        type: 'yna',
        items: ['Can state his/her own name', 'Can tell his/her birthday and/or age'],
      },
      {
        label: 'C. Place Recognition',
        type: 'yna',
        items: ['Can identify the current location', 'Can tell his/her home address (landmark)'],
      },
      {
        label: 'D. Time Perception',
        type: 'yna',
        items: ['Can identify current time (approximate acceptable)', 'Can identify the current year'],
      },
      {
        label: 'E. Memory',
        type: 'yna',
        items: ['Can recall simple past details (food eaten yesterday)', 'Can repeat two named objects'],
      },
    ],
  },
  {
    title: 'III. Social Domain',
    subs: [
      {
        label: 'A. Affect & Interaction',
        type: 'yna',
        items: [
          'Makes eye contact when name is called',
          'Responds to greetings (verbal or gesture)',
          'Can show emotions (happy, sad)',
          'Does not show aggressive behaviors',
          'Can identify basic emotions',
        ],
      },
    ],
  },
  {
    title: 'IV. Bodily Kinesthetics Domain',
    subs: [
      {
        label: 'A. Fine Motor Skills',
        type: 'yna',
        items: [
          'Can hold objects appropriately (pencil)',
          'Writes letters or name legibly',
          'Can color within the lines',
          'Can demonstrate hand-eye coordination (tracing)',
          'Can copy basic shapes (circle, triangle, square)',
        ],
      },
      {
        label: 'B. Gross Motor Skills',
        type: 'yna',
        items: [
          'Can stand on one foot briefly',
          'Walks steadily across the room',
          'Can jump forward with both feet together',
          'Climb stairs using alternating feet',
        ],
      },
    ],
  },
  {
    title: 'Perceptual Disturbances',
    subs: [{ label: null, type: 'yna', items: ['Hallucination', 'Delusions'] }],
  },
  {
    title: 'Stimming',
    subs: [
      {
        label: null,
        type: 'yn',
        items: [
          'Verbal (echolalia, humming)',
          'Auditory (sound sensitivity)',
          'Visual (fixation to objects, constant eye movement)',
          'Proprioceptive (jumping, crashing into objects)',
          'Vestibular (rocking, spinning)',
          'Oral (chewing, biting, sucking)',
          'Tactile (excoriation, skin rubbing, fidgeting)',
        ],
      },
    ],
  },
]

const ROWS = []
DOMAINS.forEach((d, di) =>
  d.subs.forEach((s, si) =>
    s.items.forEach((text, ii) => ROWS.push({ id: `${di}-${si}-${ii}`, text, type: s.type }))
  )
)
const TOTAL_ITEMS = ROWS.length
const ROW_NUM = Object.fromEntries(ROWS.map((r, i) => [r.id, i + 1]))

const OPTION_STYLES = {
  yes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  no: 'bg-rose-100 text-rose-700 border-rose-200',
  na: 'bg-slate-100 text-slate-600 border-slate-300',
}

function AnswerGroup({ id, type, value, onChange }) {
  const opts =
    type === 'yn'
      ? [['yes', 'Yes'], ['no', 'No']]
      : [['yes', 'Yes'], ['no', 'No'], ['na', 'N/A']]
  return (
    <div className="flex gap-1">
      {opts.map(([v, label]) => {
        const active = value === v
        return (
          <label
            key={v}
            className={`flex-1 cursor-pointer rounded-md border px-2 py-1.5 text-center text-[11px] font-bold ${
              active ? OPTION_STYLES[v] : 'border-purple-200 text-slate-500 hover:bg-purple-50'
            }`}
          >
            <input
              type="radio"
              name={`row-${id}`}
              className="sr-only"
              checked={active}
              onChange={() => onChange(id, v)}
            />
            {label}
          </label>
        )
      })}
    </div>
  )
}

function FormBody() {
  const [answers, setAnswers] = useState({})
  const [prevDiag, setPrevDiag] = useState('')
  const [sig, setSig] = useState(null)
  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }))

  const answered = useMemo(
    () => ROWS.filter((r) => answers[r.id]).length,
    [answers]
  )
  const pct = TOTAL_ITEMS ? Math.round((answered / TOTAL_ITEMS) * 100) : 0

  return (
    <div>
      <FormSection eyebrow="01" title="Personal Information of Student">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Date">
            <input type="date" className={fieldInput} />
          </FormField>
          <FormField label="Full Name (LN, FN MI)">
            <input className={fieldInput} placeholder="e.g. Dela Cruz, Juan M." />
          </FormField>
          <FormField label="Age / Sex">
            <input className={fieldInput} placeholder="e.g. 7 / Male" />
          </FormField>
          <FormField label="Birthdate">
            <input type="date" className={fieldInput} />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="02" title="Diagnosis">
        <FormField label="Was the student previously diagnosed / assessed?" className="mb-4">
          <div className="flex max-w-xs gap-2">
            {['Yes', 'No'].map((v) => (
              <label
                key={v}
                className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-semibold ${
                  prevDiag === v
                    ? 'border-purple-400 bg-purple-100 text-purple-900'
                    : 'border-purple-200 text-slate-600 hover:bg-purple-50'
                }`}
              >
                <input
                  type="radio"
                  name="prevDiag"
                  className="sr-only"
                  checked={prevDiag === v}
                  onChange={() => setPrevDiag(v)}
                />
                {v}
              </label>
            ))}
          </div>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Diagnosis">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Medical History">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Family History">
            <input className={fieldInput} />
          </FormField>
        </div>
      </FormSection>

      <FormSection eyebrow="Progress" title="Checklist completion">
        <div className="h-2 overflow-hidden rounded-full bg-purple-100">
          <div className="h-full rounded-full bg-purple-700 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{`${answered} of ${TOTAL_ITEMS} items answered`}</span>
          <span>{pct}%</span>
        </div>
      </FormSection>

      <FormSection eyebrow="03" title="Behavioral Checklist">
        {DOMAINS.map((domain, di) => (
          <div key={di}>
            <div className="mt-6 border-t-2 border-purple-100 pt-3 font-serif text-base font-semibold text-purple-900 first:mt-0 first:border-t-0 first:pt-0">
              {domain.title}
            </div>
            {domain.subs.map((sub, si) => (
              <div key={si}>
                {sub.label ? (
                  <div className="mt-4 text-[12px] font-bold uppercase tracking-wide text-purple-500">
                    {sub.label}
                  </div>
                ) : null}
                {sub.items.map((text, ii) => {
                  const id = `${di}-${si}-${ii}`
                  return (
                    <div key={id} className="border-b border-dashed border-purple-100 py-3 last:border-b-0">
                      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[24px_1fr_200px]">
                        <div className="font-mono text-[11px] text-purple-300">{ROW_NUM[id]}</div>
                        <div className="text-sm text-slate-700">{text}</div>
                        <AnswerGroup id={id} type={sub.type} value={answers[id]} onChange={setAnswer} />
                      </div>
                      <input
                        className={fieldInput + ' mt-2 py-1.5 text-xs sm:ml-8 sm:w-[calc(100%-2rem)]'}
                        placeholder="Remarks (optional)"
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </FormSection>

      <FormSection eyebrow="Sign-off" title="Signature over Printed Name of Evaluator / Date">
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Printed Name of Evaluator">
            <input className={fieldInput} />
          </FormField>
          <FormField label="Date">
            <input type="date" className={fieldInput} />
          </FormField>
        </div>
        <SignaturePad label="Evaluator signature" value={sig} onChange={setSig} />
      </FormSection>
    </div>
  )
}

function MmseForm({ onClose }) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <FormShell
      title="Mini-Mental Status Examination"
      code="CMPS:SE-FO-04 rev.0 02192026"
      onReset={() => setResetKey((k) => k + 1)}
      onClose={onClose}
    >
      <FormBody key={resetKey} />
    </FormShell>
  )
}

export default MmseForm
