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
      {
        p: 'I understand that the SummerScape Program, organized by ClearMind Psychological Services (CMPS), is a summer play-based activity program designed to provide children with structured opportunities for social interaction, creativity, emotional expression, and developmental engagement.',
      },
      {
        p: 'Program activities may include structured play, group games, creative tasks, cooperative activities, sensory play, and guided recreational learning experiences. I acknowledge that the SummerScape Program is intended as an enrichment and recreational program and does not replace formal therapy, or psychological treatment, unless specifically indicated by the clinic.',
      },
    ],
  },
  {
    title: 'A. Program Schedule, Session Coverage, and Fees',
    body: [
      {
        p: (
          <>
            I understand that the SummerScape Program consists of <strong>ten (10) sessions</strong>{' '}
            conducted during the April and May summer program period, following the schedule assigned
            by ClearMind Psychological Services (CMPS). CMPS reserves the right to modify schedules,
            activities, or program arrangements when necessary due to specific student accommodations,
            operational needs, or unforeseen circumstances.
          </>
        ),
      },
      {
        p: (
          <>
            I acknowledge that the program fee covers participation in the scheduled sessions and
            facilitation of activities only. In the event of absence, I acknowledge that missed
            sessions will still be counted as part of the total number of sessions and are generally
            non-transferable, non-convertible to cash, and non-refundable, unless officially approved
            by the program administration of CMPS. Furthermore, I understand that the program fee{' '}
            <strong>does not cover the cost of materials or supplies</strong> that may be required for
            certain activities during the sessions. Parents or caregivers may be requested to provide
            or shoulder the cost of specific materials when necessary, and prior notice will be given
            whenever possible.
          </>
        ),
      },
    ],
  },
  {
    title: 'B. Parental Disclosure of Information',
    body: [
      {
        p: "I affirm that I have fully disclosed relevant medical conditions, allergies, developmental concerns, behavioral considerations, or special needs (if applicable) that may affect my child's participation in the SummerScape Program. I agree to inform CMPS of any significant changes in my child's health or condition before or during the program that may affect participation or safety.",
      },
    ],
  },
  {
    title: 'C. Confidentiality and Data Privacy',
    body: [
      {
        p: "I consent to the collection, use, storage, and processing of my child's personal information for purposes related to program participation, documentation, safety monitoring, and administrative record-keeping. I understand that all information will be treated with strict confidentiality and will only be accessed by authorized personnel in accordance with applicable data privacy laws and professional ethical standards.",
      },
    ],
  },
  {
    title: 'D. Student Safety and Monitoring',
    body: [
      {
        p: 'For safety and security purposes, I acknowledge that CCTV cameras are installed in designated areas of the clinic, including activity and play areas. These are used solely for safety monitoring, security purposes, and incident review, and will only be accessed by authorized personnel in accordance with applicable policies and laws.',
      },
    ],
  },
  {
    title: 'E. Health, Safety, and Emergency Medical Consent',
    body: [
      {
        p: 'I understand that reasonable precautions will be taken to ensure the safety and well-being of all participants during SummerScape sessions and activities. In the event of an emergency and I cannot be reached immediately, I authorize the clinic and its representatives to seek appropriate medical care or assistance for my child. I agree to assume responsibility for any medical expenses incurred.',
      },
    ],
  },
  {
    title: 'F. Participation in Activities',
    body: [
      {
        p: 'I understand that the SummerScape Program involves physical movement, interactive play, and group-based activities appropriate for children. While supervision and safety precautions are provided, I acknowledge that participation in such activities may involve minor risks such as slips, falls, or minor injuries, which may occur despite proper supervision. Moreover, I agree that my child will be expected to follow program rules, safety instructions, and facilitator guidance to ensure a safe and respectful environment for all participants.',
      },
    ],
  },
  {
    title: 'G. Parental Cooperation and Responsibility',
    body: [
      { p: 'I agree to cooperate with the SummerScape Program by:' },
      {
        list: [
          'Ensuring my child arrives on time for scheduled sessions',
          'Bringing my child to the clinic for scheduled sessions and fetching them promptly after each session',
          'Supporting program guidelines and staff instructions',
          'Communicating relevant concerns or updates regarding my child',
        ],
      },
      {
        p: 'I understand that CMPS is not responsible for the child outside official program hours or outside designated supervision areas.',
      },
    ],
  },
  {
    title: 'H. Photo and Video Documentation Consent (Data Privacy Compliance)',
    body: [
      {
        p: 'I understand that during the SummerScape Program, photos or videos may be taken for purposes such as program documentation, educational presentations, and promotional materials of ClearMind Psychological Services (CMPS). In compliance with the Data Privacy Act of 2012, I acknowledge that any photo or video that may be used for public materials, social media posts, or promotional publications will ensure that children’s identities are protected.',
      },
      { p: 'CMPS commits that:' },
      {
        list: [
          'Children’s faces will be blurred or obscured in publicly shared photos or videos.',
          'No personally identifiable information (such as full name, address, or personal details) will be disclosed without additional consent.',
          'Media files will be used only for legitimate program-related purposes and will be accessed only by authorized personnel.',
        ],
      },
    ],
  },
  {
    title: 'I. Program Withdrawal and Discharge Policy',
    body: [
      {
        p: 'I understand that participation in the SummerScape Program is voluntary, and I reserve the right to withdraw my child from the program at any time. However, I acknowledge that if the withdrawal is initiated by me (client-initiated withdrawal) after the program has already started, program fees already paid will not be refunded, as resources, scheduling, and program slots have already been allocated.',
      },
      {
        p: 'On the other hand, I further understand that ClearMind Psychological Services (CMPS) reserves the right to discharge a participant from the program when necessary, including but not limited to situations involving:',
      },
      {
        list: [
          'safety concerns',
          'behavioral concerns that significantly disrupt the program',
          'health considerations',
          'non-compliance with program policies',
          'other circumstances deemed appropriate by the clinic administration',
        ],
      },
      {
        p: 'In the event of a clinic-initiated discharge, the parent or caregiver may be eligible for a refund corresponding to the remaining unused sessions, subject to evaluation and approval by the CMPS clinic administration. All decisions regarding program discharge and refund eligibility will be reviewed and determined by the clinic administration to ensure fairness, safety, and program integrity.',
      },
    ],
  },
  {
    group: "Cymon's House Rules",
    title: 'a. Attendance and Punctuality',
    body: [
      {
        p: 'Participants are expected to attend sessions regularly and arrive on time. Parents must inform the clinic in advance in case of absence whenever possible.',
      },
    ],
  },
  {
    title: 'b. Health and Safety',
    body: [
      {
        p: 'Children who are ill or experiencing contagious symptoms should remain at home. Parents must inform the clinic of any medical conditions, allergies, or health concerns.',
      },
    ],
  },
  {
    title: 'c. Supervision and Dismissal',
    body: [
      {
        p: 'Students must be picked up on time by parents or authorized individuals only. Proper identification may be required for security purposes.',
      },
    ],
  },
  {
    title: 'd. Personal Belongings',
    body: [{ p: 'CMPS is not responsible for lost or damaged personal belongings brought into the program.' }],
  },
  {
    title: 'e. Property Responsibility',
    body: [
      {
        p: 'Any damage, destruction, or loss of clinic property caused intentionally or due to negligence may be charged to the parent or guardian for repair or replacement.',
      },
    ],
  },
  {
    title: 'f. Policy Amendments',
    body: [
      {
        p: 'CMPS reserves the right to modify program policies when necessary to ensure the safety, well-being, and smooth implementation of the program.',
      },
    ],
  },
]

const inlineFill =
  'inline-block min-w-[200px] border-0 border-b border-purple-400 bg-transparent px-1 text-sm text-slate-800 focus:bg-purple-50 focus:outline-none'

function SummerScapeConsentForm({ onClose }) {
  const [checked, setChecked] = useState({})
  const [parentSig, setParentSig] = useState(null)
  const [repSig, setRepSig] = useState(null)

  const total = CLAUSES.length
  const done = Object.values(checked).filter(Boolean).length
  const pct = Math.round((done / total) * 100)

  const toggle = (i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))

  const getPages = () => [
    // Page 1
    <div key="page-1" className="space-y-4">
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
        {CLAUSES.slice(0, 4).map((c, i) => (
          <div key={i} className="mb-4 last:mb-0">
            <div className="mb-2 flex items-baseline gap-2.5">
              <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[11px] text-purple-500">
                Item {i + 1}
              </span>
              <span className="font-serif text-sm font-semibold text-purple-900">{c.title}</span>
            </div>
            <div className="mb-3 space-y-2 text-xs text-slate-600 leading-snug">
              {c.body.map((block, j) =>
                block.list ? (
                  <ul key={j} className="ml-5 list-disc space-y-1">
                    {block.list.map((li, k) => (
                      <li key={k}>{li}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={j}>{block.p}</p>
                )
              )}
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-purple-50 px-3 py-1.5">
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={() => toggle(i)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-purple-700"
              />
              <span className="text-[11px] font-semibold text-purple-900">
                I have read, understood, and agree to the terms as cited in item {i + 1}.
              </span>
            </label>
          </div>
        ))}
      </FormSection>
    </div>,

    // Page 2
    <div key="page-2" className="space-y-4">
      <FormSection eyebrow="Terms" title="Read each section and confirm (cont.)">
        {CLAUSES.slice(4, 9).map((c, idx) => {
          const i = idx + 4
          return (
            <div key={i} className="mb-4 last:mb-0">
              <div className="mb-2 flex items-baseline gap-2.5">
                <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[11px] text-purple-500">
                  Item {i + 1}
                </span>
                <span className="font-serif text-sm font-semibold text-purple-900">{c.title}</span>
              </div>
              <div className="mb-3 space-y-2 text-xs text-slate-600 leading-snug">
                {c.body.map((block, j) =>
                  block.list ? (
                    <ul key={j} className="ml-5 list-disc space-y-1">
                      {block.list.map((li, k) => (
                        <li key={k}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{block.p}</p>
                  )
                )}
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-purple-50 px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => toggle(i)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-purple-700"
                />
                <span className="text-[11px] font-semibold text-purple-900">
                  I have read, understood, and agree to the terms as cited in item {i + 1}.
                </span>
              </label>
            </div>
          )
        })}
      </FormSection>
    </div>,

    // Page 3
    <div key="page-3" className="space-y-4">
      <FormSection eyebrow="Terms" title="Read each section and confirm (cont.)">
        {CLAUSES.slice(9).map((c, idx) => {
          const i = idx + 9
          return (
            <div key={i} className="mb-4 last:mb-0">
              {c.group ? (
                <div className="mt-2 border-t-2 border-purple-100 pt-2 mb-2 font-serif text-sm font-semibold text-purple-900 uppercase tracking-wider">
                  {c.group}
                </div>
              ) : null}
              <div className="mb-2 flex items-baseline gap-2.5">
                <span className="shrink-0 rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[11px] text-purple-500">
                  Item {i + 1}
                </span>
                <span className="font-serif text-sm font-semibold text-purple-900">{c.title}</span>
              </div>
              <div className="mb-3 space-y-2 text-xs text-slate-600 leading-snug">
                {c.body.map((block, j) =>
                  block.list ? (
                    <ul key={j} className="ml-5 list-disc space-y-1">
                      {block.list.map((li, k) => (
                        <li key={k}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{block.p}</p>
                  )
                )}
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-purple-50 px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => toggle(i)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-purple-700"
                />
                <span className="text-[11px] font-semibold text-purple-900">
                  I have read, understood, and agree to the terms as cited in item {i + 1}.
                </span>
              </label>
            </div>
          )
        })}
      </FormSection>
    </div>,

    // Page 4
    <div key="page-4" className="space-y-4">
      <FormSection eyebrow="Final step" title="Parent/Caregiver Acknowledgement Form">
        <p className="text-xs text-slate-600 leading-relaxed">
          I,{' '}
          <input className={inlineFill} placeholder="Parent/Legal Guardian full name" />, the
          parent/legal guardian of{' '}
          <input className={inlineFill} placeholder="Child's full name" />, hereby voluntarily enroll
          my child in the <strong>CyMon SummerScape Program</strong> of{' '}
          <strong>CLEARMIND PSYCHOLOGICAL SERVICES</strong>.
        </p>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          By signing below, I affirm that I have read and understood the contents of this consent and
          waiver form and voluntarily agree to its terms.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 text-[11px]">
          <div className="border border-purple-100 p-3 rounded-xl bg-purple-50/20">
            <div className="mb-2 font-serif text-sm font-semibold text-purple-900">Parent/Guardian</div>
            <FormField label="Contact Number" className="mb-2">
              <input className={fieldInput} type="tel" placeholder="09XX XXX XXXX" />
            </FormField>
            <SignaturePad label="Signature" value={parentSig} onChange={setParentSig} />
            <FormField label="Date" className="mt-2">
              <input className={fieldInput} type="date" />
            </FormField>
          </div>

          <div className="border border-purple-100 p-3 rounded-xl bg-purple-50/20">
            <div className="mb-2 font-serif text-sm font-semibold text-purple-900">
              CMPS Representative
            </div>
            <FormField label="Representative Name" className="mb-2">
              <input className={fieldInput} type="text" />
            </FormField>
            <FormField label="Contact Number" className="mb-2">
              <input className={fieldInput} type="tel" placeholder="09XX XXX XXXX" />
            </FormField>
            <SignaturePad label="Signature" value={repSig} onChange={setRepSig} />
            <FormField label="Date" className="mt-2">
              <input className={fieldInput} type="date" />
            </FormField>
          </div>
        </div>
      </FormSection>
    </div>
  ]

  return (
    <FormShell
      title="CyMon SummerScape Program"
      subtitle="Parent/Caregiver Consent and Waiver Form"
      code="CMPS:SE-FO-12 rev.0 03122026"
      confidential={false}
      onClose={onClose}
      multiPage={true}
    >
      {getPages()}
    </FormShell>
  )
}

export default SummerScapeConsentForm
