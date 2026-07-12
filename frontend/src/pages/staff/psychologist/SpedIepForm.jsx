import FormShell from '../../../components/ui/FormShell'
import { cellInput } from '../../../components/ui/formStyles'

const th =
  'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-purple-800'
const infoLabel =
  'border border-slate-500 bg-purple-50 px-2 py-1 text-left text-sm font-bold text-purple-800 whitespace-nowrap'
const infoCell = 'border border-slate-500 p-0'
const domainCell =
  'border border-slate-500 bg-purple-50 px-2 py-1 text-center text-sm font-bold text-slate-800'
const inputCell = 'border border-slate-500 p-0 align-top'
const cellArea = `${cellInput} block resize-none`

const LEVELS = [
  'a. Low Support Needs Program (LSN)',
  'b. Moderate Support Needs Program (MSN)',
  'c. High Support Needs Program (HSN)',
]

const WEEKS = [1, 2, 3, 4]

function ContentCells() {
  return (
    <>
      <td className={inputCell}>
        <textarea rows={2} className={cellArea} />
      </td>
      <td className={inputCell}>
        <textarea rows={2} className={cellArea} />
      </td>
    </>
  )
}

function WeekBlock({ week }) {
  return (
    <>
      <tr>
        <td className="border border-slate-500 text-center align-middle text-sm font-bold text-purple-800" rowSpan={5}>
          {week}
        </td>
        <td className="border border-slate-500 px-2 py-1 align-top text-xs text-slate-800" rowSpan={5}>
          <div className="space-y-3">
            {LEVELS.map((lvl) => (
              <label key={lvl} className="flex items-start gap-1.5">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-purple-700" />
                <span>{lvl}</span>
              </label>
            ))}
          </div>
        </td>
        <td className={domainCell}>Practical Domain</td>
        <td className={inputCell}>
          <textarea rows={2} className={cellArea} />
        </td>
        <ContentCells />
      </tr>

      <tr>
        <td className={domainCell}>Social Domain</td>
        <td className={inputCell}>
          <textarea rows={2} className={cellArea} />
        </td>
        <ContentCells />
      </tr>

      <tr>
        <td className={domainCell}>Conceptual Domain</td>
        <td className={inputCell}>
          <textarea rows={2} className={cellArea} />
        </td>
        <ContentCells />
      </tr>

      <tr>
        <td className={domainCell} rowSpan={2}>
          Bodily Kinesthetics
        </td>
        <td className={inputCell}>
          <div className="px-1.5 pt-1 text-xs font-bold italic text-slate-800">Fine Motor Skills:</div>
          <textarea rows={2} className={cellArea} />
        </td>
        <ContentCells />
      </tr>

      <tr>
        <td className={inputCell}>
          <div className="px-1.5 pt-1 text-xs font-bold italic text-slate-800">Gross Motor Skills:</div>
          <textarea rows={2} className={cellArea} />
        </td>
        <ContentCells />
      </tr>
    </>
  )
}

function Signatory({ role, name, title }) {
  return (
    <td className="border border-slate-500 p-2 align-top">
      <div className="text-xs text-slate-800">{role}</div>
      <div className="mt-6">
        {name ? <div className="text-xs font-bold text-slate-900">{name}</div> : null}
        <div className="text-xs text-slate-700">{title}</div>
      </div>
    </td>
  )
}

function SpedIepForm({ onClose }) {
  return (
    <FormShell
      title="SPECIAL EDUCATION (SPED) PROGRAM"
      subtitle="INDIVIDUALIZED EDUCATIONAL PLAN"
      code="CMPS:SE-FO-10 rev.0 03182026"
      confidential={false}
      onClose={onClose}
    >
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={infoLabel}>Date</td>
            <td className={infoCell} colSpan={3}>
              <input className={cellInput} />
            </td>
          </tr>
          <tr>
            <td className={infoLabel}>Full Name of Student</td>
            <td className={infoCell}>
              <input className={cellInput} />
            </td>
            <td className={infoLabel}>Diagnosis</td>
            <td className={infoCell}>
              <input className={cellInput} />
            </td>
          </tr>
          <tr>
            <td className={infoLabel}>Age/Sex</td>
            <td className={infoCell}>
              <input className={cellInput} />
            </td>
            <td className={infoLabel}>Date of Birth</td>
            <td className={infoCell}>
              <input className={cellInput} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <colgroup>
            <col className="w-10" />
            <col className="w-40" />
            <col className="w-32" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className={th}>Week</th>
              <th className={th}>Level of Needs</th>
              <th className={th}>Targeted Domains</th>
              <th className={th}>Name of Activity</th>
              <th className={th}>Objectives</th>
              <th className={th}>Instructional Materials Needed</th>
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((week) => (
              <WeekBlock key={week} week={week} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <tbody>
            <tr>
              <Signatory role="Prepared by:" title="Behavioral Technician" />
              <Signatory
                role="Checked by:"
                name="MARWIN A. GILBERO JR, RPm, CHRA"
                title="SPED Program Coordinator"
              />
              <Signatory
                role="Verified by:"
                name="LEERA MAE C. GUEVARRA, RPm, CHRA"
                title="Learning Head"
              />
              <Signatory
                role="Noted by:"
                name="DR. JINKY C. MALABANAN, RPm, RPsy, CHRA"
                title="Chief Psychologist"
              />
            </tr>
          </tbody>
        </table>
      </div>
    </FormShell>
  )
}

export default SpedIepForm
