import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'
import { api } from '../../../lib/api'

const typeMeta = {
  urgent: { label: 'URGENT', cls: 'bg-rose-100 text-rose-700' },
  event: { label: 'EVENT', cls: 'bg-amber-100 text-amber-700' },
  info: { label: 'INFO', cls: 'bg-sky-100 text-sky-700' },
}

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
  const navigate = useNavigate()
  const [published, setPublished] = useState([])
  const [title, setTitle] = useState('')
  const [type, setType] = useState('urgent')
  const [publishDate, setPublishDate] = useState('')
  const [expiresOn, setExpiresOn] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = () => api.admin.announcements().then((d) => setPublished(d.announcements)).catch(() => {})
  useEffect(() => {
    load()
  }, [])

  const handlePublish = async () => {
    setError(null)
    if (!title || !body) {
      setError('Title and message body are required.')
      return
    }
    setSubmitting(true)
    try {
      await api.admin.createAnnouncement({
        title,
        type,
        body,
        publish_date: publishDate || undefined,
        expires_on: expiresOn || undefined,
      })
      setTitle('')
      setBody('')
      setPublishDate('')
      setExpiresOn('')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <StaffHeader title="Announcements" showSearch={false} />
      <div className="flex-1 overflow-y-auto p-6">
        <button
          onClick={() => navigate('/admin')}
          className="mb-3 inline-flex items-center gap-1 rounded-md border border-purple-200 bg-white px-3 py-1 text-sm font-medium text-purple-700 hover:bg-purple-50"
        >
          ← Back to Overview
        </button>
        <h1 className="text-3xl font-bold text-purple-800">Announcements</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Create and manage posts for the Parent Portal
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
            <header className="bg-purple-700 px-5 py-3 text-white">
              <div className="text-lg font-bold">✏ New Announcement</div>
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
                  <TypeChip active={type === 'urgent'} onClick={() => setType('urgent')} label="🚨 Urgent" color="bg-rose-100 text-rose-700" />
                  <TypeChip active={type === 'event'} onClick={() => setType('event')} label="🎉 Event" color="bg-amber-100 text-amber-700" />
                  <TypeChip active={type === 'info'} onClick={() => setType('info')} label="ℹ General Info" color="bg-sky-100 text-sky-700" />
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
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  {['All', 'HSN Families', 'MSN Families', 'SummerScape'].map((a, i) => (
                    <label key={a} className="flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-2">
                      <input type="checkbox" defaultChecked={i === 0} />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">
                  ATTACH PROMOTIONAL IMAGE <span className="text-slate-400">(Optional)</span>
                </div>
                <div className="mt-1 flex flex-col items-center gap-2 rounded-md border-2 border-dashed border-purple-300 bg-purple-50 p-6 text-xs text-slate-500">
                  <span className="text-2xl">🖼</span>
                  <div>Click or drag to upload flyer</div>
                  <div>JPG, PNG up to 5MB</div>
                </div>
              </div>
              {error ? (
                <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</div>
              ) : null}
              <button
                type="button"
                onClick={handlePublish}
                disabled={submitting}
                className="w-full rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-60"
              >
                {submitting ? 'Publishing…' : '📣 Publish Announcement'}
              </button>
            </form>
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">📋 PUBLISHED</div>
            <ul className="mt-3 space-y-3">
              {published.length === 0 ? (
                <li className="text-xs text-slate-500">No announcements yet.</li>
              ) : null}
              {published.map((p) => (
                <li key={p.id} className="rounded-md border border-purple-200 bg-white p-3">
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-purple-800">{p.title}</div>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${(typeMeta[p.type] || typeMeta.info).cls}`}>
                      {(typeMeta[p.type] || typeMeta.info).label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{p.body}</p>
                  <div className="mt-1 text-[10px] text-slate-400">{fmtDate(p.publish_date)}</div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button className="rounded-md border border-purple-200 px-2 py-1 text-purple-700 hover:bg-purple-50">
                      ✏ Edit
                    </button>
                    <button className="rounded-md border border-purple-200 px-2 py-1 text-purple-700 hover:bg-purple-50">
                      🗑 Remove
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
