import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Select from '../../../components/ui/Select'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import RowAction from '../../../components/ui/RowAction'
import SearchBar from '../../../components/ui/SearchBar'
import { api } from '../../../lib/api'

const levelTone = {
  HSN: 'bg-rose-100 text-rose-700',
  MSN: 'bg-amber-100 text-amber-700',
  LSN: 'bg-emerald-100 text-emerald-700',
}
const levelLabel = {
  HSN: 'HSN — High Support Needs',
  MSN: 'MSN — Moderate Support Needs',
  LSN: 'LSN — Low Support Needs',
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-32 rounded-full bg-purple-100">
        <div className="h-full rounded-full bg-purple-700" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-600">{value}%</span>
    </div>
  )
}

function EditRosterModal({ client, onClose, onSaved }) {
  const [level, setLevel] = useState(client.level === '—' ? '' : client.level)
  const [progress, setProgress] = useState(String(client.progress ?? 0))
  const [chiefComplaint, setChiefComplaint] = useState(client.chief_complaint || '')
  const [workingDiagnosis, setWorkingDiagnosis] = useState(client.working_diagnosis || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setError('')
    const payload = {}
    if (level) payload.support_level = level
    const n = Number(progress)
    if (!Number.isInteger(n) || n < 0 || n > 100) {
      setError('Progress must be a whole number between 0 and 100')
      return
    }
    payload.milestone_progress = n
    payload.chief_complaint = chiefComplaint
    payload.working_diagnosis = workingDiagnosis
    setSaving(true)
    try {
      await api.psychologist.updateRoster(client.id, payload)
      onSaved({
        ...client,
        level: level || client.level,
        progress: n,
        chief_complaint: chiefComplaint,
        working_diagnosis: workingDiagnosis,
        updated: new Date().toISOString(),
      })
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      title="Update Roster"
      subtitle={client.name}
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Support Level"
          defaultValue={level}
          placeholder="Select a level"
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="HSN">HSN — High Support Needs</option>
          <option value="MSN">MSN — Moderate Support Needs</option>
          <option value="LSN">LSN — Low Support Needs</option>
        </Select>
        <Input
          label="Milestone Progress (%)"
          tone="purple"
          type="number"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />
        <Textarea
          label="Chief Complaint"
          rows={2}
          placeholder="Main reason the patient came in to consult…"
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
        />
        <Textarea
          label="Working Diagnosis"
          rows={2}
          placeholder="Initial impression while evaluation is ongoing…"
          value={workingDiagnosis}
          onChange={(e) => setWorkingDiagnosis(e.target.value)}
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </Modal>
  )
}

function ViewRosterModal({ client, onClose, onEdit }) {
  return (
    <Modal
      title={client.name}
      subtitle="Roster details"
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>Edit</Button>
        </div>
      }
    >
      <dl className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-slate-500">Support Level</dt>
          <dd>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${levelTone[client.level] || 'bg-slate-100 text-slate-600'}`}>
              {levelLabel[client.level] || client.level}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-slate-500">Milestone Progress</dt>
          <dd>
            <ProgressBar value={client.progress} />
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Chief Complaint</dt>
          <dd className="mt-1 text-sm text-slate-700">{client.chief_complaint || '—'}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">Working Diagnosis</dt>
          <dd className="mt-1 text-sm text-slate-700">{client.working_diagnosis || '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-slate-500">Last Update</dt>
          <dd className="text-sm text-slate-700">{fmtDate(client.updated)}</dd>
        </div>
      </dl>
    </Modal>
  )
}

function RosterOverview() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let on = true
    api.psychologist.roster().then((d) => on && setClients(d.clients)).catch(() => {}).finally(() => { if (on) setLoading(false) })
    return () => {
      on = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const visible = q
    ? clients.filter((c) => c.name.toLowerCase().includes(q) || (c.level || '').toLowerCase().includes(q))
    : clients

  const handleSaved = (updated) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    setEditing(null)
    setViewing(null)
  }

  return (
    <>
      <StaffHeader title="Roster Overview" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-purple-800">Client Roster Overview</h1>
        <p className="text-sm text-slate-500">
          All assigned clients with current Support Level and milestone completion
        </p>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search clients by name or support level…"
          />
        </section>

        <section className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wider text-purple-700">
                  <th className="py-3 px-4 text-left">Client Name</th>
                  <th className="py-3 px-4 text-center">Support Level</th>
                  <th className="py-3 px-4 text-left">Progress</th>
                  <th className="py-3 px-4 text-left">Last Update</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="py-3 px-4">
                          <Skeleton className="h-11 w-full" />
                        </td>
                      </tr>
                    ))
                  : null}
                {!loading && visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-sm text-slate-400">
                      {q ? 'No clients match your search.' : 'No assigned clients yet.'}
                    </td>
                  </tr>
                ) : null}
                {!loading &&
                  visible.map((c) => {
                    const isSelected = (viewing && viewing.id === c.id) || (editing && editing.id === c.id)
                    return (
                      <tr
                        key={c.id}
                        className={isSelected ? 'bg-purple-100/70 transition-colors font-medium' : 'hover:bg-purple-50/50 transition-colors'}
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">{c.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${levelTone[c.level] || 'bg-slate-100 text-slate-600'}`}>
                            {c.level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <ProgressBar value={c.progress} />
                        </td>
                        <td className="py-3 px-4 text-slate-600">{fmtDate(c.updated)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <RowAction variant="view" onClick={() => setViewing(c)} aria-label={`View ${c.name}`}>
                              View
                            </RowAction>
                            <RowAction variant="edit" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}>
                              Edit
                            </RowAction>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {!loading && clients.length > 0 ? (
            <p className="mt-4 text-center text-xs text-slate-400">
              {q ? `${visible.length} of ${clients.length}` : clients.length} {clients.length === 1 ? 'client' : 'clients'}
            </p>
          ) : null}
        </section>
      </div>

      {viewing ? (
        <ViewRosterModal
          client={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing)
            setViewing(null)
          }}
        />
      ) : null}
      {editing ? (
        <EditRosterModal client={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      ) : null}
    </>
  )
}

export default RosterOverview
