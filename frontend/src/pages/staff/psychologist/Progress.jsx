import { useEffect, useState } from 'react'
import StaffHeader from '../StaffHeader'
import Skeleton from '../../../components/ui/Skeleton'
import SearchBar from '../../../components/ui/SearchBar'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'
import ProgressSummaryReportForm from './ProgressSummaryReportForm'
import { api } from '../../../lib/api'

const tone = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
}
const STATUS_META = {
  approved: { label: 'Approved', tone: 'sky' },
  ready_for_review: { label: 'Ready', tone: 'sky' },
  draft: { label: 'Draft', tone: 'amber' },
  in_progress: { label: 'In Progress', tone: 'amber' },
}

const PAGE_SIZE = 5

function GenerateReportModal({ patients, onClose, onCreated }) {
  const [f, setF] = useState({ patient_id: '', title: 'Monthly Progress Summary', period: '', trend: '' })
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!f.patient_id || !f.title) {
      setErr('Please choose a student and enter a report title.')
      return
    }
    setBusy(true)
    try {
      await api.psychologist.addProgressReport(f)
      onCreated()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      title="Generate Progress Report"
      subtitle="Progress Summary Report (FO-08)"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <Button type="submit" form="generate-progress-form" size="lg" disabled={busy}>
            {busy ? 'Generating…' : 'Generate Draft'}
          </Button>
        </div>
      }
    >
      <form id="generate-progress-form" onSubmit={submit} className="space-y-4">
        <Select label="Student" value={f.patient_id} onChange={set('patient_id')}>
          <option value="">Select a student…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <Input label="Report Title" tone="purple" value={f.title} onChange={set('title')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Period (e.g. Mar 2026)" tone="purple" value={f.period} onChange={set('period')} />
          <Input label="Trend (e.g. Improving)" tone="purple" value={f.trend} onChange={set('trend')} />
        </div>
        {err ? <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{err}</div> : null}
      </form>
    </Modal>
  )
}

function Progress() {
  const [items, setItems] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE_SIZE)
  const [showForm, setShowForm] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [notice, setNotice] = useState(null)

  const load = () =>
    api.psychologist
      .progress()
      .then((d) => {
        setItems(d.items)
        setPatients(d.patients || [])
      })
      .catch(() => {})

  useEffect(() => {
    let on = true
    load().finally(() => {
      if (on) setLoading(false)
    })
    return () => {
      on = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const visible = q
    ? items.filter((i) => i.name.toLowerCase().includes(q) || (i.period || '').toLowerCase().includes(q))
    : items
  const paged = visible.slice(0, shown)

  return (
    <>
      <StaffHeader title="Monthly Summary Progress" />
      <div className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800">Progress Tracking</h1>
              <p className="text-sm text-slate-500">
                Monthly Progress Summary Reports (PSR - FO-08) analyzing student trajectory
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenForm(true)}
                className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
              >
                Open Progress Summary Report
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
              >
                + Generate Report
              </button>
            </div>
          </div>
          {notice ? (
            <div className="mt-3 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</div>
          ) : null}
          <div className="mt-4">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v)
                setShown(PAGE_SIZE)
              }}
              placeholder="Search reports by student or period…"
            />
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" rounded="rounded-2xl" />
            ))
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              {q ? 'No reports match your search.' : 'No progress reports yet.'}
            </div>
          ) : null}
          {!loading && paged.map((i) => {
            const meta = STATUS_META[i.status] || STATUS_META.draft
            const trendTone = i.trend && i.trend.toLowerCase().includes('improv') ? 'emerald' : 'amber'
            return (
            <article key={i.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-purple-800">{i.name}</div>
                  <div className="text-xs text-slate-500">{i.period}</div>
                </div>
                <div className="flex items-center gap-2">
                  {i.trend ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[trendTone]}`}>
                      {i.trend}
                    </span>
                  ) : null}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[meta.tone]}`}>
                    {meta.label}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="rounded-md bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800">
                  View
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  Analytics
                </button>
                <button className="rounded-md border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
                  Export
                </button>
              </div>
            </article>
            )
          })}
        </div>

        {!loading && shown < visible.length ? (
          <div className="mt-5 text-center">
            <button
              onClick={() => setShown((s) => s + PAGE_SIZE)}
              className="rounded-full bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800"
            >
              Click to View More
            </button>
          </div>
        ) : null}
      </div>

      {showForm ? (
        <GenerateReportModal
          patients={patients}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            setNotice('Progress report draft generated.')
            load()
          }}
        />
      ) : null}

      {openForm ? <ProgressSummaryReportForm onClose={() => setOpenForm(false)} /> : null}
    </>
  )
}

export default Progress
