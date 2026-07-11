import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'
import SignatureField from '../../../components/ui/SignatureField'
import { cellInput } from '../../../components/ui/formStyles'

const th = 'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-slate-800'
const rowLabelCell = 'border border-slate-500 bg-purple-50 px-2 py-1 text-center text-sm font-semibold text-slate-800'
const inputCell = 'border border-slate-500 p-0'

function ScoreTable({ headers, rows }) {
  const dataCols = headers.length - 1
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((label) => (
            <tr key={label}>
              <td className={rowLabelCell}>{label}</td>
              {Array.from({ length: dataCols }).map((_, i) => (
                <td key={i} className={inputCell}>
                  <input className={cellInput} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Signatory({ role, name, title, license }) {
  return (
    <div>
      <div className="text-slate-800">{role}</div>
      <div className="mt-3">
        <SignatureField label={name} />
      </div>
      <div className="text-slate-700">{title}</div>
      <div className="text-slate-700">
        License Number:{' '}
        {license ? license : <span className="inline-block w-40 border-b border-slate-400 align-bottom" />}
      </div>
    </div>
  )
}

function BehavioralAssessmentForm({ onClose }) {
  return (
    <FormShell
      title="BEHAVIORAL ASSESSMENT REPORT"
      subtitle="SPECIAL EDUCATION PROGRAM"
      code="CMPS:SE-FO-06 rev.0 03032026"
      onClose={onClose}
    >
      <FormHeading numeral="I">Personal Information</FormHeading>
      <div className="space-y-1.5">
        <BlankField label="Full Name (LN, FN MI):" labelClassName="w-48" />
        <BlankField label="Birthdate:" labelClassName="w-48" />
        <BlankField label="Age/Sex:" labelClassName="w-48" />
        <BlankField label="Date of Evaluation:" labelClassName="w-48" />
      </div>

      <FormHeading numeral="II">Background Information</FormHeading>
      <p className="text-xs italic leading-snug text-slate-500">
        Relevant developmental, medical, academic, and behavioral history as reported by the
        parent/guardian and/or teacher. Include previous diagnoses (if any), interventions received,
        and pertinent family or school information.
      </p>
      <textarea rows={4} className="mt-1.5 w-full border border-slate-400 p-2 text-sm focus:border-purple-600 focus:outline-none" />

      <FormHeading numeral="III">Behavioral Tests Administered</FormHeading>
      <ul className="ml-5 list-disc space-y-0.5 text-sm text-slate-800">
        <li>Caregiver Behavioral Observation Checklist</li>
        <li>Mini-Mental Status Examination (MMSE)</li>
        <li>Child Adaptive Functioning Assessment Tool</li>
        <li>Comprehensive Test of Nonverbal Intelligence-2 (CTONI-2)</li>
        <li>Gilliam&rsquo;s Autism Rating Scale-3 (GARS-3)</li>
      </ul>

      <FormHeading numeral="IV">Behavioral Observations</FormHeading>

      <div className="mb-1 text-sm font-bold text-slate-800">A. Caregiver Behavioral Observation Checklist</div>
      <ScoreTable
        headers={['Domain', 'Raw Score', 'Verbal Interpretation']}
        rows={['Practical Domain', 'Social Domain', 'Conceptual Domain', 'Motor Skills', 'Total']}
      />

      <div className="mt-3 text-sm font-bold text-slate-800">B. Mini-Mental Status Examination (MMSE)</div>
      <div className="mt-1 text-sm font-bold text-slate-800">C. Child Adaptive Functioning Assessment Tool</div>

      <div className="mt-2 mb-1 text-sm font-bold text-slate-800">
        D. Comprehensive Test of Nonverbal Intelligence-2 (CTONI-2)
      </div>
      <ScoreTable
        headers={['Subtest', 'Raw Score', 'Age Equivalent', 'Percentile Rank', 'Scaled Score', 'Descriptive Term']}
        rows={[
          'Pictorial Analogies (PA)',
          'Geometric Analogies (GA)',
          'Pictorial Categories (PC)',
          'Geometric Categories (GC)',
          'Pictorial Sequences (PS)',
          'Geometric Sequences (GS)',
        ]}
      />
      <div className="mt-3">
        <ScoreTable
          headers={['Composite', 'Sum of Scaled Scores', 'Percentile Rank', 'Descriptive Term']}
          rows={['Pictorial Scale', 'Geometric Scale', 'Full Scale']}
        />
      </div>

      <div className="mt-3 mb-1 text-sm font-bold text-slate-800">E. Gilliam&rsquo;s Autism Rating Scale-3 (GARS-3)</div>
      <ScoreTable
        headers={['Subscales', 'Raw Score', 'Percentile Rank', 'Scaled Score']}
        rows={[
          'Restricted/Repetitive Behaviors (RB)',
          'Social Interaction (SI)',
          'Social Communication (SC)',
          'Emotional Responses (ER)',
          'Cognitive Style (CS)',
          'Maladaptive Speech (MS)',
        ]}
      />
      <div className="mt-3">
        <ScoreTable
          headers={['Composites', 'Sum of Scaled Scores', 'Percentile Rank', 'Autism Index', 'Severity Level']}
          rows={['4 scores', '6 scores']}
        />
      </div>

      <FormHeading numeral="V">Working Diagnosis</FormHeading>
      <textarea rows={3} className="w-full border border-slate-400 p-2 text-sm focus:border-purple-600 focus:outline-none" />

      <FormHeading numeral="VI">Recommendations</FormHeading>
      <textarea rows={4} className="w-full border border-slate-400 p-2 text-sm focus:border-purple-600 focus:outline-none" />

      <div className="mt-8 space-y-6">
        <Signatory
          role="Prepared by:"
          name="MR. MARWIN A. GILBERO JR., RPm, CHRA"
          title="Registered Psychometrician"
          license="0039850"
        />
        <Signatory
          role="Noted by:"
          name="DR. JINKY C. MALABANAN, RPsy, RPm, LPT"
          title="Chief Psychologist"
        />
      </div>
    </FormShell>
  )
}

export default BehavioralAssessmentForm
