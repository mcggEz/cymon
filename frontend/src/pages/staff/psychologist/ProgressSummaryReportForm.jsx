import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import FormHeading from '../../../components/ui/FormHeading'
import BlankField from '../../../components/ui/BlankField'
import SignatureField from '../../../components/ui/SignatureField'
import { blankInput } from '../../../components/ui/formStyles'
import { api } from '../../../lib/api'

const th =
  'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-slate-800'
const inputCell = 'border border-slate-500 p-0 align-top'
const planCellInput =
  'w-full resize-y bg-transparent px-2 py-1 text-sm text-slate-900 focus:bg-purple-50 focus:outline-none'

const DATA_DOMAINS = [
  'Conceptual Domain',
  'Social Domain',
  'Bodily Kinesthetics Domain',
  'Practical Domain',
]

const emptyRow = () => ({
  objective: '',
  activities: '',
  timeFrame: '',
  responsible: '',
  outcome: '',
})

function ProgressSummaryReportForm({ patients = [], onSaved, onClose }) {
  const [rows, setRows] = useState(() => [emptyRow(), emptyRow(), emptyRow()])
  const [patientId, setPatientId] = useState('')
  const [period, setPeriod] = useState('')
  const [trend, setTrend] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const save = async () => {
    setError(null)
    if (!patientId) {
      setError('Please choose a student.')
      return
    }
    setSaving(true)
    try {
      await api.psychologist.addProgressReport({
        patient_id: patientId,
        title: 'Monthly Progress Summary',
        period,
        trend,
      })
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const update = (i, key, value) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  const addRow = () => setRows((r) => [...r, emptyRow()])
  const removeRow = (i) => setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r))

  const actions = (
    <div>
      {error ? <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-purple-800">
            Trend (optional)
          </label>
          <input
            className={blankInput}
            value={trend}
            onChange={(e) => setTrend(e.target.value)}
            placeholder="e.g. Improving"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Progress Report'}
        </button>
      </div>
    </div>
  )

  return (
    <FormShell
      title="Monthly Progress Summary Report (PSR)"
      code="CMPS:SE-FO-09 rev.0 03172026"
      confidential={false}
      actions={actions}
      onClose={onClose}
    >
      {/* Reporting period + client information header */}
      <div className="mb-4 space-y-2">
        <BlankField label="Reporting Period" hint="e.g. March – May 2026" labelClassName="w-40">
          <input className={blankInput} value={period} onChange={(e) => setPeriod(e.target.value)} />
        </BlankField>
        <BlankField label="Student" labelClassName="w-40">
          <select className={blankInput} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Select a student…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </BlankField>
        <BlankField label="Age / Sex" labelClassName="w-40" />
        <BlankField label="Diagnosis" labelClassName="w-40" />
      </div>

      <FormHeading numeral="">Data</FormHeading>
      <p className="text-sm text-slate-800">
        The client participated in a series of group activities that measured the client&apos;s
        adaptive functioning in the following domains:
      </p>
      <ul className="mt-1 mb-2 list-disc pl-8 text-sm text-slate-800">
        {DATA_DOMAINS.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <textarea
        rows={4}
        className="w-full border border-slate-400 p-2 text-sm focus:border-purple-600 focus:outline-none"
        placeholder="Describe the group activities conducted and the domains they measured during this reporting period."
      />

      <FormHeading numeral="">Assessment</FormHeading>
      <textarea
        rows={16}
        className="w-full border border-slate-400 p-2 text-sm focus:border-purple-600 focus:outline-none"
        placeholder="Summarize the client's overall demeanor and engagement, then describe observations per domain (Conceptual, Social, Practical, Bodily Kinesthetics): independence level, assistance required, and specific behaviors observed across attempts."
      />

      <FormHeading numeral="">Plan</FormHeading>
      <p className="mb-2 text-sm text-slate-800">
        These are the following Activity Plan to be implemented:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className={th}>Objective</th>
              <th className={th}>Activities</th>
              <th className={th}>Time Frame</th>
              <th className={th}>Responsible Person</th>
              <th className={th}>Expected Outcome</th>
              <th className={`${th} w-10 print:hidden`} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className={inputCell}>
                  <textarea
                    rows={4}
                    className={planCellInput}
                    value={row.objective}
                    onChange={(e) => update(i, 'objective', e.target.value)}
                  />
                </td>
                <td className={inputCell}>
                  <textarea
                    rows={4}
                    className={planCellInput}
                    value={row.activities}
                    onChange={(e) => update(i, 'activities', e.target.value)}
                  />
                </td>
                <td className={inputCell}>
                  <textarea
                    rows={4}
                    className={planCellInput}
                    value={row.timeFrame}
                    onChange={(e) => update(i, 'timeFrame', e.target.value)}
                  />
                </td>
                <td className={inputCell}>
                  <textarea
                    rows={4}
                    className={planCellInput}
                    value={row.responsible}
                    onChange={(e) => update(i, 'responsible', e.target.value)}
                  />
                </td>
                <td className={inputCell}>
                  <textarea
                    rows={4}
                    className={planCellInput}
                    value={row.outcome}
                    onChange={(e) => update(i, 'outcome', e.target.value)}
                  />
                </td>
                <td className="border border-slate-500 p-0 text-center align-middle print:hidden">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800"
                    title="Remove row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 border border-dashed border-purple-400 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50 print:hidden"
      >
        Add row
      </button>

      {/* Sign-off */}
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="text-slate-800">Prepared by:</div>
          <div className="mt-3">
            <SignatureField label="MARWIN A. GILBERO JR." />
          </div>
          <div className="text-slate-700">Clinic Intern – Pamantasan ng Cabuyao</div>
        </div>
        <div>
          <div className="text-slate-800">Reviewed by:</div>
          <div className="mt-3">
            <SignatureField label="MS. CRISTINE LAE C. ERASGA, RPsy, RPm, CHRA" />
          </div>
          <div className="text-slate-700">Supervising Psychologist · License Number: 0001942</div>
        </div>
        <div>
          <div className="text-slate-800">Noted by:</div>
          <div className="mt-3">
            <SignatureField label="DR. JINKY C. MALABANAN, RPm, RPsy, LPT, CHRA" />
          </div>
          <div className="text-slate-700">Executive Director · License Number: 0002278</div>
        </div>
      </div>
    </FormShell>
  )
}

export default ProgressSummaryReportForm
