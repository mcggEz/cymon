import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import { api } from '../../../lib/api'

const typeMeta = {
  urgent: { label: 'URGENT', cls: 'bg-rose-100 text-rose-700' },
  event: { label: 'EVENT', cls: 'bg-amber-100 text-amber-700' },
  info: { label: 'INFO', cls: 'bg-sky-100 text-sky-700' },
}

const priorityMeta = {
  normal: { label: 'Normal', cls: 'bg-slate-100 text-slate-600' },
  important: { label: 'Important', cls: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', cls: 'bg-rose-100 text-rose-700' },
}

// Audience targeting — who is allowed to see the announcement.
const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'public', label: 'Public (Promotions & Events)' },
  { value: 'all_employees', label: 'All Employees' },
  { value: 'all_mhp', label: 'All MHP' },
  { value: 'all_clients', label: 'All Clients / Parents' },
  { value: 'psychologist', label: 'Psychologists' },
  { value: 'psychometrician', label: 'Psychometricians' },
  { value: 'speech_therapist', label: 'Speech Therapists' },
  { value: 'occupational_therapist', label: 'Occupational Therapists' },
]

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const TypeChip = ({ active, label, color, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'rounded-md border px-3 py-1 text-xs font-medium',
      active ? `${color} border-transparent` : 'border-purple-200 text-purple-700',
    ].join(' ')}
  >
    {label}
  </button>
)

function Announcements() {
  const [published, setPublished] = useState([])
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('urgent')
  const [priority, setPriority] = useState('normal')
  const [audience, setAudience] = useState(['all'])
  const [publishDate, setPublishDate] = useState('')
  const [expiresOn, setExpiresOn] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = () => api.admin.announcements().then((d) => setPublished(d.announcements || [])).catch(() => {})
  useEffect(() => {
    let on = true
    Promise.all([
      load(),
      api.admin.patients().then((d) => {
        if (on) setPatients(d.patients || [])
      }).catch(() => {})
    ]).finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const toggleAudience = (v) => {
    setAudience((prev) => {
      // "Everyone" is exclusive; picking anything else clears it and vice-versa.
      if (v === 'all') return ['all']
      const next = prev.filter((a) => a !== 'all')
      return next.includes(v) ? next.filter((a) => a !== v) : [...next, v]
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setBody('')
    setType('urgent')
    setPriority('normal')
    setAudience(['all'])
    setPublishDate('')
    setExpiresOn('')
    setPatientId('')
  }

  const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

  const startEdit = (p) => {
    setError(null)
    setEditingId(p.id)
    setTitle(p.title || '')
    setBody(p.body || '')
    setType(p.type || 'info')
    setPriority(p.priority || 'normal')
    setAudience(p.audience && p.audience.length ? p.audience : ['all'])
    setPublishDate(toInputDate(p.publish_date))
    setExpiresOn(toInputDate(p.expires_on))
    setPatientId(p.patient_id || '')
  }

  const handleSave = async () => {
    setError(null)
    if (!title || !body) {
      setError('Title and message body are required.')
      return
    }
    setSubmitting(true)
    const payload = {
      title,
      type,
      priority,
      audience: audience.length ? audience : ['all'],
      body,
      publish_date: publishDate || undefined,
      expires_on: expiresOn || undefined,
      patient_id: patientId || null,
    }
    try {
      if (editingId) {
        await api.admin.updateAnnouncement(editingId, payload)
      } else {
        await api.admin.createAnnouncement(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.admin.deleteAnnouncement(id)
      if (editingId === id) resetForm()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <StaffHeader title="Announcements" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold text-purple-800">Announcements</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Create and manage posts for the Parent Portal
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <header className="bg-purple-700 px-5 py-3 text-white">
              <div className="text-lg font-bold">{editingId ? 'Edit Announcement' : 'New Announcement'}</div>
              <div className="text-xs opacity-80">Publish to all or specific audience</div>
            </header>
            <form className="space-y-4 p-5">
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">ANNOUNCEMENT TITLE *</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. World Down Syndrome Day"
                  className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
                />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">TYPE</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <TypeChip active={type === 'urgent'} onClick={() => setType('urgent')} label="Urgent" color="bg-rose-100 text-rose-700" />
                  <TypeChip active={type === 'event'} onClick={() => setType('event')} label="Event" color="bg-amber-100 text-amber-700" />
                  <TypeChip active={type === 'info'} onClick={() => setType('info')} label="General Info" color="bg-sky-100 text-sky-700" />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">PRIORITY</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(priorityMeta).map(([val, meta]) => (
                    <TypeChip
                      key={val}
                      active={priority === val}
                      onClick={() => setPriority(val)}
                      label={meta.label}
                      color={meta.cls}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">PUBLISH DATE</div>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">EXPIRES ON</div>
                  <input
                    type="date"
                    value={expiresOn}
                    onChange={(e) => setExpiresOn(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">MESSAGE BODY *</div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Type the full announcement message here…"
                  className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">AUDIENCE</div>
                <div className="mt-1 text-xs text-slate-500">Choose who can see this announcement.</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {AUDIENCES.map((a) => (
                    <label key={a.value} className="flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={audience.includes(a.value)}
                        onChange={() => toggleAudience(a.value)}
                      />
                      <span>{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">SPECIFIC STUDENT TARGETING <span className="text-slate-400">(Optional)</span></div>
                <div className="mt-1 text-xs text-slate-500">Select a specific student if this message is only for their caregiver (targeted message).</div>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="">-- Broadcast (No specific student) --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID: {p.patient_id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">
                  ATTACH PROMOTIONAL IMAGE <span className="text-slate-400">(Optional)</span>
                </div>
                <div className="mt-1 flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-purple-300 bg-purple-50 p-6 text-xs text-slate-500">
                  <div>Click or drag to upload flyer</div>
                  <div>JPG, PNG up to 5MB</div>
                </div>
              </div>
              {error ? (
                <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
                >
                  {submitting
                    ? editingId
                      ? 'Saving…'
                      : 'Publishing…'
                    : editingId
                      ? 'Save Changes'
                      : 'Publish Announcement'}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="rounded-md border border-purple-300 px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">PUBLISHED</div>
            <ul className="mt-3 space-y-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <li key={`s${i}`}>
                      <Skeleton className="h-20 w-full" rounded="rounded-md" />
                    </li>
                  ))
                : null}
              {!loading && published.length === 0 ? (
                <li className="text-xs text-slate-500">No announcements yet.</li>
              ) : null}
              {!loading &&
                published.map((p) => (
                <li key={p.id} className={`rounded-md border bg-white p-3 ${editingId === p.id ? 'border-purple-500 ring-1 ring-purple-300' : 'border-purple-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-purple-800">{p.title}</div>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${(typeMeta[p.type] || typeMeta.info).cls}`}>
                      {(typeMeta[p.type] || typeMeta.info).label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{p.body}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${(priorityMeta[p.priority] || priorityMeta.normal).cls}`}>
                      {(priorityMeta[p.priority] || priorityMeta.normal).label}
                    </span>
                    {(p.audience || ['all']).map((a) => (
                      <span key={a} className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                        {AUDIENCES.find((x) => x.value === a)?.label || a}
                      </span>
                    ))}
                    {p.patient_id && (
                      <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100 flex items-center gap-1">
                        🎯 Specific: {patients.find((x) => x.id === p.patient_id)?.name || 'Student'}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{fmtDate(p.publish_date)}</div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="rounded-md border border-purple-200 px-2 py-1 text-purple-700 hover:bg-purple-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="rounded-md border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    >
                      {deletingId === p.id ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  )
}

export default Announcements
