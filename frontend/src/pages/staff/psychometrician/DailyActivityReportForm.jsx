import { useState } from 'react'
import FormShell from '../../../components/ui/FormShell'
import { cellInput } from '../../../components/ui/formStyles'

const labelCell =
  'border border-slate-500 bg-purple-50 px-2 py-1 align-top text-left text-sm font-bold text-purple-800'
const th = 'border border-slate-500 bg-purple-100 px-2 py-1 text-center text-xs font-bold text-slate-800'
const inputCell = 'border border-slate-500 p-0'
const paperTextarea =
  'w-full resize-y bg-transparent px-2 py-1 text-sm text-slate-900 focus:bg-purple-50 focus:outline-none'

function DailyActivityReportForm({ onClose }) {
  const [rows, setRows] = useState(() => Array.from({ length: 6 }, () => ({ name: '', response: '' })))

  const addRow = () => setRows((r) => [...r, { name: '', response: '' }])

  return (
    <FormShell title="Daily Activity Report" code="CMPS:SE-FO-08 rev.0 03032026" onClose={onClose}>
      {/* Activity header block */}
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
                <input className={cellInput} />
              </td>
            </tr>
            <tr>
              <td className={labelCell}>Name of the Student/s</td>
              <td className={inputCell}>
                <input className={cellInput} />
              </td>
            </tr>
            <tr>
              <td className={labelCell}>Title of the Activity/ies</td>
              <td className={inputCell}>
                <input className={cellInput} />
              </td>
            </tr>
            <tr>
              <td className={labelCell}>Targeted Domain/s</td>
              <td className={inputCell}>
                <input className={cellInput} />
              </td>
            </tr>
            <tr>
              <td className={labelCell}>Objectives</td>
              <td className={inputCell}>
                <textarea rows={5} className={paperTextarea} />
              </td>
            </tr>
            <tr>
              <td className={labelCell}>Activity Procedure</td>
              <td className={inputCell}>
                <textarea rows={6} className={paperTextarea} />
              </td>
            </tr>
            <tr>
              <td className={labelCell}>Date of the Activity</td>
              <td className={inputCell}>
                <input className={cellInput} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Per-student responses table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-12" />
            <col className="w-1/3" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th className={th}>No.</th>
              <th className={th}>Name of Student</th>
              <th className={th}>Responses/Observed Behavior</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="border border-slate-500 px-2 py-1 text-center align-top text-sm text-slate-800">
                  {i + 1}
                </td>
                <td className={inputCell}>
                  <input
                    className={cellInput}
                    value={row.name}
                    onChange={(e) =>
                      setRows((r) => r.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                  />
                </td>
                <td className={inputCell}>
                  <textarea
                    rows={2}
                    className={paperTextarea}
                    value={row.response}
                    onChange={(e) =>
                      setRows((r) => r.map((x, j) => (j === i ? { ...x, response: e.target.value } : x)))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
      <div className="mt-10 space-y-8 text-sm">
        <div>
          <div className="text-slate-800">Prepared by:</div>
          <div className="mt-7 font-bold text-slate-900">MARWIN A. GILBERO JR., RPm, CHRA</div>
          <div className="text-slate-700">Clinic Intern</div>
          <div className="text-slate-700">License Number: 0039850</div>
        </div>
        <div>
          <div className="text-slate-800">Noted by:</div>
          <div className="mt-7 font-bold text-slate-900">CRISTINE LAE C. ERASGA, RPm, RPsy, CHRA</div>
          <div className="text-slate-700">Clinic Psychologist</div>
          <div className="text-slate-700">License Number:</div>
        </div>
      </div>
    </FormShell>
  )
}

export default DailyActivityReportForm
