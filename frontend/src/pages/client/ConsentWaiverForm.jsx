import { useState } from 'react'
import FormShell from '../../components/ui/FormShell'
import FormSection from '../../components/ui/FormSection'
import FormField from '../../components/ui/FormField'
import { fieldInput } from '../../components/ui/formStyles'
import SignaturePad from '../../components/ui/SignaturePad'

const CLAUSES = [
  {
    title: 'Nature and Purpose of the Program',
    body: [
      'I understand that the Special Education (SPED) Program of ClearMind Psychological Services (CMPS) provides specialized educational, behavioral, and play-based interventions designed to address the individual needs of my child. Services may include assessment, individualized instruction, behavioral support, structured play activities, and related developmental interventions administered by the clinic.',
    ],
  },
  {
    title: 'A. Student Attendance and Schedule of Sessions',
    body: [
      'I understand that the number of sessions will be conducted based on the enrolled program of my child. In the event of absence, the missed session will be counted and deducted from the total number of sessions, regardless of the reason, unless officially excused by the administration. Unused sessions are non-transferable, non-convertible to cash, and non-refundable.',
      "Furthermore, I understand that CMPS shall determine and assign my child's schedule based on program considerations and student needs. I acknowledge that the schedule may be modified by the clinic depending on my child's performance, progress, or behavioral adjustment during the course of the program.",
    ],
  },
  {
    title: 'B. Parental Disclosure of Information',
    body: [
      "I affirm that I have fully disclosed all relevant medical, psychological, developmental, and behavioral information about my child. I agree to update CMPS regarding any significant changes in my child's condition that may affect participation in the program.",
    ],
  },
  {
    title: 'C. Confidentiality and Data Privacy',
    body: [
      "I consent to the collection, use, storage, and processing of my child's personal, behavioral, and medical information for purposes related to assessment, intervention planning, monitoring, and documentation. I understand that all information will be treated with confidentiality and will be disclosed only to authorized personnel or as required by law.",
    ],
  },
  {
    title: 'D. Student Safety Monitoring',
    body: [
      'For safety and security purposes, I acknowledge that CCTV cameras are installed in designated areas, including the play area. I understand that CCTV recordings are strictly and solely for monitoring safety, security, and incident review purposes and will be accessed only by authorized personnel in accordance with school policies and applicable laws.',
    ],
  },
  {
    title: 'E. Health, Safety, and Emergency Medical Consent',
    body: [
      "I understand that reasonable precautions will be taken to ensure my child's safety during sessions and school activities. In case of emergency and I cannot be reached immediately, I authorize the clinic and its representatives to secure appropriate medical treatment for my child. I agree to assume responsibility for any medical expenses incurred.",
    ],
  },
  {
    title: 'F. Participation and Behavioral Interventions',
    body: [
      'I understand that my child will be expected to follow clinic rules and routines. Appropriate behavioral management strategies and interventions may be implemented when necessary to ensure a safe and structured learning environment.',
    ],
  },
  {
    title: 'G. Liability Waiver',
    body: [
      'I acknowledge that participation in educational and play-based activities involves inherent risks despite reasonable care and supervision. I hereby release and hold free from liability the clinic, its administrators, staff, and representatives from claims arising from accidents, injuries, or incidents that may occur in the ordinary course of program participation, except in cases of gross negligence or willful misconduct.',
    ],
  },
  {
    title: 'H. Parental Cooperation',
    body: [
      "I agree to cooperate with the CMPS by attending scheduled meetings, participating in case conferences when required, and supporting recommended strategies at home to promote my child's development and progress based on his/her Individualized Educational Plan (IEP). I further acknowledge my responsibility to ensure that my child is brought to the clinic on time for scheduled sessions and is fetched promptly after each session by myself or an authorized representative. I understand that CMPS is not responsible for the student outside of official session hours and designated supervision periods.",
    ],
  },
  {
    group: "Cymon's House Rules",
    title: 'Attendance and Punctuality',
    body: [
      'Students are expected to attend classes regularly and arrive on time. Absences should be communicated by the parent/guardian in advance or a day before the scheduled class.',
    ],
  },
  {
    title: 'Health and Safety',
    body: [
      'Students who are ill should remain at home. Parents must inform the clinic of any medical conditions, allergies, or medication requirements.',
    ],
  },
  {
    title: 'Respect and Inclusion',
    body: [
      'Respect toward staff, peers, and clinic property is required at all times. Bullying, aggression, or discrimination will not be tolerated.',
    ],
  },
  {
    title: 'Supervision and Dismissal',
    body: [
      'Students must be picked up on time by authorized individuals only. Proper identification may be required.',
    ],
  },
  {
    title: 'Personal Belongings',
    body: ['CMPS is not responsible for lost or damaged personal items unless negligence is proven.'],
  },
  {
    title: 'School Property Responsibility',
    body: [
      'Any damage, destruction, or loss of clinic property caused by the student, whether intentional or due to negligence, shall be financially charged to the parent/guardian for repair or replacement.',
    ],
  },
  {
    title: 'Policy Amendments',
    body: [
      'CMPS reserves the right to modify policies when necessary for the safety and well-being of students.',
    ],
  },
]

const inlineFill =
  'inline-block min-w-[200px] border-0 border-b border-purple-400 bg-transparent px-1 text-sm text-slate-800 focus:bg-purple-50 focus:outline-none'

function ConsentWaiverForm({ onClose }) {
  const [checked, setChecked] = useState({})
  const [parentSig, setParentSig] = useState(null)
  const [repSig, setRepSig] = useState(null)

  const total = CLAUSES.length
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / total) * 100)

  const toggle = (i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))

  return (
    <FormShell
      title="Special Education (SPED) Program"
      subtitle="Parent/Caregiver Consent and Waiver Form"
      code="CMPS:SE-FO-02 rev.0 02192026"
      confidential={false}
      onClose={onClose}
    >
      <FormSection eyebrow="Progress" title="Acknowledgment status">
        <div className="h-2 w-full overflow-hidden rounded-full bg-purple-100">
          <div className="h-full rounded-full bg-purple-700 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>
            {done} of {total} items acknowledged
          </span>
          <span>{pct}%</span>
        </div>
        {done === total ? (
          <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
            All sections have been read and acknowledged
          </div>
        ) : null}
      </FormSection>

      <FormSection eyebrow="Terms" title="Read each section and confirm">
        {CLAUSES.map((c, i) => (
          <div key={i}>
            {c.group ? (
              <div className="mt-6 border-t-2 border-purple-100 pt-4 font-serif text-base font-semibold text-purple-900">
                {c.group}
              </div>
            ) : null}
            <div className="mb-4 border-b border-purple-100 pb-4 last:mb-0 last:border-none last:pb-0">
              <div className="mb-2 flex items-baseline gap-2.5">
                <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[11px] text-purple-500">
                  Item {i + 1}
                </span>
                <span className="font-serif text-sm font-semibold text-purple-900">{c.title}</span>
              </div>
              <div className="mb-3 space-y-2 text-sm text-slate-600">
                {c.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-purple-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => toggle(i)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-purple-700"
                />
                <span className="text-xs font-semibold text-purple-900">
                  I have read, understood, and agree to the terms as cited in item {i + 1}.
                </span>
              </label>
            </div>
          </div>
        ))}
      </FormSection>

      <FormSection eyebrow="Final step" title="Parent/Caregiver Acknowledgement Form">
        <p className="text-sm text-slate-600">
          I,{' '}
          <input className={inlineFill} placeholder="Parent/Legal Guardian full name" />, the
          parent/legal guardian of{' '}
          <input className={inlineFill} placeholder="Child's full name" />, hereby voluntarily enroll
          my child in the Special Education (SPED) Program of{' '}
          <strong>CLEARMIND PSYCHOLOGICAL SERVICES</strong>.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          By signing below, I affirm that I have read and understood the contents of this consent and
          waiver form and voluntarily agree to its terms.
        </p>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-3 font-serif text-sm font-semibold text-purple-900">Parent/Guardian</div>
            <FormField label="Contact Number" className="mb-3">
              <input className={fieldInput} type="tel" placeholder="09XX XXX XXXX" />
            </FormField>
            <SignaturePad label="Signature" value={parentSig} onChange={setParentSig} />
            <FormField label="Date" className="mt-3">
              <input className={fieldInput} type="date" />
            </FormField>
          </div>

          <div>
            <div className="mb-3 font-serif text-sm font-semibold text-purple-900">
              CMPS Representative
            </div>
            <FormField label="Representative Name" className="mb-3">
              <input className={fieldInput} type="text" />
            </FormField>
            <FormField label="Contact Number" className="mb-3">
              <input className={fieldInput} type="tel" placeholder="09XX XXX XXXX" />
            </FormField>
            <SignaturePad label="Signature" value={repSig} onChange={setRepSig} />
            <FormField label="Date" className="mt-3">
              <input className={fieldInput} type="date" />
            </FormField>
          </div>
        </div>
      </FormSection>
    </FormShell>
  )
}

export default ConsentWaiverForm
