import FormShell from '../../components/ui/FormShell'
import FormHeading from '../../components/ui/FormHeading'
import BlankField from '../../components/ui/BlankField'

const CLAUSES = [
  {
    numeral: '',
    title: 'Nature and Purpose of the Program',
    body: [
      'I understand that the Special Education (SPED) Program of ClearMind Psychological Services (CMPS) provides specialized educational, behavioral, and play-based interventions designed to address the individual needs of my child. Services may include assessment, individualized instruction, behavioral support, structured play activities, and related developmental interventions administered by the clinic.',
    ],
  },
  {
    numeral: 'A',
    title: 'Student Attendance and Schedule of Sessions',
    body: [
      'I understand that the number of sessions will be conducted based on the enrolled program of my child. In the event of absence, the missed session will be counted and deducted from the total number of sessions, regardless of the reason, unless officially excused by the administration. Unused sessions are non-transferable, non-convertible to cash, and non-refundable.',
      'Furthermore, I understand that CMPS shall determine and assign my child’s schedule based on program considerations and student needs. I acknowledge that the schedule may be modified by the clinic depending on my child’s performance, progress, or behavioral adjustment during the course of the program.',
    ],
  },
  {
    numeral: 'B',
    title: 'Parental Disclosure of Information',
    body: [
      'I affirm that I have fully disclosed all relevant medical, psychological, developmental, and behavioral information about my child. I agree to update CMPS regarding any significant changes in my child’s condition that may affect participation in the program.',
    ],
  },
  {
    numeral: 'C',
    title: 'Confidentiality and Data Privacy',
    body: [
      'I consent to the collection, use, storage, and processing of my child’s personal, behavioral, and medical information for purposes related to assessment, intervention planning, monitoring, and documentation. I understand that all information will be treated with confidentiality and will be disclosed only to authorized personnel or as required by law.',
    ],
  },
  {
    numeral: 'D',
    title: 'Student Safety Monitoring',
    body: [
      'For safety and security purposes, I acknowledge that CCTV cameras are installed in designated areas, including the play area. I understand that CCTV recordings are strictly and solely for monitoring safety, security, and incident review purposes and will be accessed only by authorized personnel in accordance with school policies and applicable laws.',
    ],
  },
  {
    numeral: 'E',
    title: 'Health, Safety, and Emergency Medical Consent',
    body: [
      'I understand that reasonable precautions will be taken to ensure my child’s safety during sessions and school activities. In case of emergency and I cannot be reached immediately, I authorize the clinic and its representatives to secure appropriate medical treatment for my child. I agree to assume responsibility for any medical expenses incurred.',
    ],
  },
  {
    numeral: 'F',
    title: 'Participation and Behavioral Interventions',
    body: [
      'I understand that my child will be expected to follow clinic rules and routines. Appropriate behavioral management strategies and interventions may be implemented when necessary to ensure a safe and structured learning environment.',
    ],
  },
  {
    numeral: 'G',
    title: 'Liability Waiver',
    body: [
      'I acknowledge that participation in educational and play-based activities involves inherent risks despite reasonable care and supervision. I hereby release and hold free from liability the clinic, its administrators, staff, and representatives from claims arising from accidents, injuries, or incidents that may occur in the ordinary course of program participation, except in cases of gross negligence or willful misconduct.',
    ],
  },
  {
    numeral: 'H',
    title: 'Parental Cooperation',
    body: [
      'I agree to cooperate with the CMPS by attending scheduled meetings, participating in case conferences when required, and supporting recommended strategies at home to promote my child’s development and progress based on his/her Individualized Educational Plan (IEP). I further acknowledge my responsibility to ensure that my child is brought to the clinic on time for scheduled sessions and is fetched promptly after each session by myself or an authorized representative. I understand that CMPS is not responsible for the student outside of official session hours and designated supervision periods.',
    ],
  },
]

const HOUSE_RULES = [
  {
    title: 'Attendance and Punctuality',
    text: 'Students are expected to attend classes regularly and arrive on time. Absences should be communicated by the parent/guardian in advance or a day before the scheduled class.',
  },
  {
    title: 'Health and Safety',
    text: 'Students who are ill should remain at home. Parents must inform the clinic of any medical conditions, allergies, or medication requirements.',
  },
  {
    title: 'Respect and Inclusion',
    text: 'Respect toward staff, peers, and clinic property is required at all times. Bullying, aggression, or discrimination will not be tolerated.',
  },
  {
    title: 'Supervision and Dismissal',
    text: 'Students must be picked up on time by authorized individuals only. Proper identification may be required.',
  },
  {
    title: 'Personal Belongings',
    text: 'CMPS is not responsible for lost or damaged personal items unless negligence is proven.',
  },
  {
    title: 'School Property Responsibility',
    text: 'Any damage, destruction, or loss of clinic property caused by the student, whether intentional or due to negligence, shall be financially charged to the parent/guardian for repair or replacement.',
  },
  {
    title: 'Policy Amendments',
    text: 'CMPS reserves the right to modify policies when necessary for the safety and well-being of students.',
  },
]

const inlineBlank =
  'inline-block min-w-[240px] border-b border-slate-400 bg-transparent px-1 text-sm text-slate-900 focus:border-purple-600 focus:outline-none'

function ConsentWaiverForm({ onClose }) {
  return (
    <FormShell
      title="Special Education (SPED) Program"
      subtitle="Parent/Caregiver Consent and Waiver Form"
      code="CMPS:SE-FO-02 rev.0 02192026"
      confidential={false}
      onClose={onClose}
    >
      {CLAUSES.map((c) => (
        <section key={c.title}>
          <FormHeading numeral={c.numeral}>{c.title}</FormHeading>
          {c.body.map((p, j) => (
            <p key={j} className="mb-2 text-sm leading-snug text-slate-700">
              {p}
            </p>
          ))}
        </section>
      ))}

      <FormHeading numeral="">Cymon&rsquo;s House Rules</FormHeading>
      <div className="space-y-2">
        {HOUSE_RULES.map((r) => (
          <div key={r.title}>
            <div className="text-sm font-bold text-slate-800">{r.title}</div>
            <ul className="list-disc pl-6 text-sm leading-snug text-slate-700">
              <li>{r.text}</li>
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-center text-base font-bold uppercase tracking-wide text-purple-800">
        Parent/Caregiver
        <br />
        Acknowledgement Form
      </h2>

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        I, <input className={inlineBlank} aria-label="Parent/legal guardian name" />, the
        parent/legal guardian of{' '}
        <input className={inlineBlank} aria-label="Child name" />, hereby voluntarily enroll my child
        in the Special Education (SPED) Program of{' '}
        <span className="font-bold underline">CLEARMIND PSYCHOLOGICAL SERVICES</span>.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        By signing below, I affirm that I have read and understood the contents of this consent and
        waiver form and voluntarily agree to its terms.
      </p>

      <div className="mt-6 space-y-2">
        <BlankField label="Parent/Guardian Name:" labelClassName="w-48" />
        <BlankField label="Signature/Date:" labelClassName="w-48" />
        <BlankField label="Contact Number:" labelClassName="w-48" />
      </div>

      <div className="mt-6 space-y-2">
        <BlankField label="CMPS Representative:" labelClassName="w-48" />
        <BlankField label="Signature/Date:" labelClassName="w-48" />
        <BlankField label="Contact Number:" labelClassName="w-48" />
      </div>
    </FormShell>
  )
}

export default ConsentWaiverForm
