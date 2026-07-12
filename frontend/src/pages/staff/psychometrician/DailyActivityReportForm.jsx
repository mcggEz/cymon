import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import SignatureField from '../../../components/ui/SignatureField'
import { api } from '../../../lib/api'
import { cellInput } from '../../../components/ui/formStyles'

const labelCell =
  'border border-slate-500 bg-purple-50 px-2 py-1 align-top text-left text-sm font-bold text-purple-800'
const th = 'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-slate-800'
const inputCell = 'border border-slate-500 p-0 align-top'
const paperTextarea =
  'w-full resize-y bg-transparent px-2 py-1 text-sm text-slate-900 focus:bg-purple-50 focus:outline-none'

const blank = {
  session_number: '',
  patient_id: '',
  activity_title: '',
  target_domain: '',
  objectives: '',
  procedure: '',
  session_date: '',
}

function DailyActivityReportForm({ patients = [], onSaved, onClose }) {
  const [f, setF] = useState(blank)
  const [rows, setRows] = useState(() => Array.from({ length: 6 }, () => ({ name: '', response: '' })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const addRow = () => setRows((r) => [...r, { name: '', response: '' }])
  const removeRow = (i) => setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r))

  const save = async (status) => {
    setError(null)
    if (!f.patient_id || !f.activity_title.trim()) {
      setError('Please choose a student and enter the title of the activity.')
      return
    }
    setSaving(true)
    try {
      const observations = rows
        .filter((r) => r.name.trim() || r.response.trim())
        .map((r) => (r.name.trim() ? `${r.name.trim()}: ${r.response.trim()}` : r.response.trim()))
        .join('\n')
      await api.psychometrician.addActivityLog({ ...f, observations, status })
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const actions = (
    <div>
      {error ? <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => save('draft')}
          disabled={saving}
          className="rounded-md border border-purple-300 px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          onClick={() => save('pending')}
          disabled={saving}
          className="rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Submit Daily Activity Report'}
        </button>
      </div>
    </div>
  )

  const getPages = () => {
    const pageList = []

    // Page 1: Activity details table
    pageList.push(
      <div key="page-1" className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-56" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td className={labelCell}>Session Number</td>
                <td className={inputCell}>
                  <input type="number" className={cellInput} value={f.session_number} onChange={set('session_number')} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>Name of the Student/s</td>
                <td className={inputCell}>
                  <select className={cellInput} value={f.patient_id} onChange={set('patient_id')}>
                    <option value="">Select a student…</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className={labelCell}>Title of the Activity/ies</td>
                <td className={inputCell}>
                  <input className={cellInput} value={f.activity_title} onChange={set('activity_title')} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>Targeted Domain/s</td>
                <td className={inputCell}>
                  <input className={cellInput} value={f.target_domain} onChange={set('target_domain')} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>Objectives</td>
                <td className={inputCell}>
                  <textarea rows={5} className={paperTextarea} value={f.objectives} onChange={set('objectives')} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>Activity Procedure</td>
                <td className={inputCell}>
                  <textarea rows={6} className={paperTextarea} value={f.procedure} onChange={set('procedure')} />
                </td>
              </tr>
              <tr>
                <td className={labelCell}>Date of the Activity</td>
                <td className={inputCell}>
                  <input type="date" className={cellInput} value={f.session_date} onChange={set('session_date')} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )

    // Split remaining rows into pages dynamically
    let tempRows = [...rows]
    let pageIdx = 2

    while (tempRows.length > 0) {
      let chunkSize
      let isLastPage

      if (tempRows.length <= 4) {
        chunkSize = tempRows.length
        isLastPage = true
      } else if (tempRows.length <= 6) {
        chunkSize = 4
        isLastPage = false
      } else {
        chunkSize = 6
        isLastPage = false
      }

      const chunk = tempRows.splice(0, chunkSize)
      const startIdx = rows.length - tempRows.length - chunk.length

      pageList.push(
        <div key={`page-${pageIdx}`} className="space-y-4">
          {/* Per-student responses table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className={`${th} w-12`}>No.</th>
                  <th className={`${th} w-1/3`}>Name of Student</th>
                  <th className={th}>Responses/Observed Behavior</th>
                  <th className={`${th} w-10 print:hidden`} />
                </tr>
              </thead>
              <tbody>
                {chunk.map((row, i) => {
                  const globalIdx = startIdx + i
                  return (
                    <tr key={globalIdx}>
                      <td className="border border-slate-500 px-2 py-1 text-center align-top text-sm text-slate-800">
                        {globalIdx + 1}
                      </td>
                      <td className={inputCell}>
                        <input
                          className={cellInput}
                          value={row.name}
                          onChange={(e) =>
                            setRows((r) => r.map((x, j) => (j === globalIdx ? { ...x, name: e.target.value } : x)))
                          }
                        />
                      </td>
                      <td className={inputCell}>
                        <textarea
                          rows={2}
                          className={paperTextarea}
                          value={row.response}
                          onChange={(e) =>
                            setRows((r) => r.map((x, j) => (j === globalIdx ? { ...x, response: e.target.value } : x)))
                          }
                        />
                      </td>
                      <td className="border border-slate-500 p-0 text-center align-middle print:hidden">
                        <button
                          type="button"
                          onClick={() => removeRow(globalIdx)}
                          className="px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800"
                          title="Remove row"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {isLastPage ? (
            <>
              <div className="mt-2 print:hidden">
                <button
                  type="button"
                  onClick={addRow}
                  className="rounded-md border border-purple-300 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50"
                >
                  Add row
                </button>
              </div>

              {/* Signatories */}
              <div className="mt-6 grid grid-cols-2 gap-6 text-[11px]">
                <div>
                  <div className="text-slate-800">Prepared by:</div>
                  <div className="mt-3">
                    <SignatureField label="MARWIN A. GILBERO JR., RPm, CHRA" />
                  </div>
                  <div className="text-slate-700">Clinic Intern · License Number: 0039850</div>
                </div>
                <div>
                  <div className="text-slate-800">Noted by:</div>
                  <div className="mt-3">
                    <SignatureField label="CRISTINE LAE C. ERASGA, RPm, RPsy, CHRA" />
                  </div>
                  <div className="text-slate-700">Clinic Psychologist</div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )
      pageIdx++
    }

    // Fallback if rows is empty
    if (pageList.length === 1) {
      pageList.push(
        <div key="page-2" className="space-y-4">
          <div className="mt-2 print:hidden">
            <button
              type="button"
              onClick={addRow}
              className="rounded-md border border-purple-300 px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50"
            >
              Add row
            </button>
          </div>

          {/* Signatories */}
          <div className="mt-6 grid grid-cols-2 gap-6 text-[11px]">
            <div>
              <div className="text-slate-800">Prepared by:</div>
              <div className="mt-3">
                <SignatureField label="MARWIN A. GILBERO JR., RPm, CHRA" />
              </div>
              <div className="text-slate-700">Clinic Intern · License Number: 0039850</div>
            </div>
            <div>
              <div className="text-slate-800">Noted by:</div>
              <div className="mt-3">
                <SignatureField label="CRISTINE LAE C. ERASGA, RPm, RPsy, CHRA" />
              </div>
              <div className="text-slate-700">Clinic Psychologist</div>
            </div>
          </div>
        </div>
      )
    }

    return pageList
  }

  return (
    <FormShell
      title="Daily Activity Report"
      code="CMPS:SE-FO-08 rev.0 03032026"
      actions={actions}
      onClose={onClose}
      multiPage={true}
    >
      {getPages()}
    </FormShell>
  )
}

export default DailyActivityReportForm
