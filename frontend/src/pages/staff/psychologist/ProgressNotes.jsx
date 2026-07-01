import { useState } from 'react'
import StaffHeader from '../StaffHeader'

// After the Intake Interview, the MHP records an Initial Impression (a one-time
// working assessment) and then a Progress Note per consultation to track the
// patient's development over time. UI-first: notes are held in local state until
// the progress-notes tables land.

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const Area = ({ rows = 3, ...props }) => (
  <textarea rows={rows} {...props} className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm" />
)

const blankNote = { date: '', session: '', observations: '', interventions: '', progress: '' }

function InitialImpression() {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  return (
    <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-purple-800">Initial Impression</div>
      <div className="text-xs text-slate-500">
        Working assessment based on the intake interview, while evaluation is ongoing.
      </div>
      <Area
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setSaved(false)
        }}
        placeholder="Initial clinical impression and working diagnosis…"
      />
      <div className="mt-3 flex items-center justify-end gap-3">
        {saved ? <span className="text-xs text-emerald-700">Saved</span> : null}
        <button
          onClick={() => setSaved(true)}
          className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
        >
          Save Impression
        </button>
      </div>
    </section>
  )
}

function NoteForm({ onAdd }) {
  const [note, setNote] = useState(blankNote)
  const set = (k) => (e) => setNote((n) => ({ ...n, [k]: e.target.value }))
  const add = (e) => {
    e.preventDefault()
    if (!note.observations.trim()) return
    onAdd({ ...note, id: `${note.date}-${note.session}-${note.observations.slice(0, 8)}` })
    setNote(blankNote)
  }
  return (
    <form onSubmit={add} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-purple-800">Add Progress Note</div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <div className="font-semibold text-purple-700">Session Date</div>
          <input type="date" value={note.date} onChange={set('date')} className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
        </label>
        <label className="block text-sm">
          <div className="font-semibold text-purple-700">Session Type</div>
          <input value={note.session} onChange={set('session')} placeholder="e.g. Therapy, Follow-up" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
        </label>
        <label className="block text-sm sm:col-span-2">
          <div className="font-semibold text-purple-700">Observations</div>
          <Area rows={2} value={note.observations} onChange={set('observations')} placeholder="What happened in the session…" />
        </label>
        <label className="block text-sm">
          <div className="font-semibold text-purple-700">Interventions</div>
          <Area rows={2} value={note.interventions} onChange={set('interventions')} placeholder="Techniques used…" />
        </label>
        <label className="block text-sm">
          <div className="font-semibold text-purple-700">Progress</div>
          <Area rows={2} value={note.progress} onChange={set('progress')} placeholder="Change since last session…" />
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="submit" className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
          + Add Note
        </button>
      </div>
    </form>
  )
}

function NoteCard({ n }) {
  return (
    <article className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm font-bold text-purple-800">{n.session || 'Consultation'}</div>
        <div className="text-xs text-slate-500">{fmtDate(n.date)}</div>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-semibold text-purple-700">Observations</dt>
          <dd className="text-slate-700">{n.observations}</dd>
        </div>
        {n.interventions ? (
          <div>
            <dt className="text-xs font-semibold text-purple-700">Interventions</dt>
            <dd className="text-slate-700">{n.interventions}</dd>
          </div>
        ) : null}
        {n.progress ? (
          <div>
            <dt className="text-xs font-semibold text-purple-700">Progress</dt>
            <dd className="text-slate-700">{n.progress}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}

function ProgressNotes() {
  const [notes, setNotes] = useState([])
  return (
    <>
      <StaffHeader title="Progress Notes" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Record the initial impression, then log a note for each consultation to track progress.
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <InitialImpression />
          <NoteForm onAdd={(n) => setNotes((prev) => [n, ...prev])} />

          <div>
            <div className="text-sm font-semibold text-purple-800">Consultation History</div>
            <div className="mt-3 flex flex-col gap-4">
              {notes.length === 0 ? (
                <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
                  No progress notes yet. Add one after each session.
                </div>
              ) : (
                notes.map((n) => <NoteCard key={n.id} n={n} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProgressNotes
