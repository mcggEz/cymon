import { useEffect, useState } from 'react'
import PageHeader from './PageHeader'
import Skeleton from '../../components/ui/Skeleton'
import { api } from '../../lib/api'

const POSTERS = [
  'bg-gradient-to-br from-rose-200 to-purple-300',
  'bg-gradient-to-br from-yellow-200 to-blue-300',
  'bg-gradient-to-br from-orange-200 to-amber-300',
]
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

function Announcement() {
  const [messages, setMessages] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    api.client
      .announcements()
      .then((d) => {
        if (!on) return
        setMessages(d.messages)
        setEvents(d.events)
      })
      .catch(() => {})
      .finally(() => {
        if (on) setLoading(false)
      })
    return () => {
      on = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Announcement" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold tracking-wider text-purple-800">CLINIC ANNOUNCEMENTS</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Updates and notes from ClearMind Psychological Services regarding Leo&apos;s care.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" rounded="rounded-2xl" />
              ))
            : null}
          {!loading && messages.length === 0 ? (
            <div className="rounded-2xl border border-purple-200 bg-white p-5 text-sm text-slate-500">
              No clinic messages yet.
            </div>
          ) : null}
          {!loading &&
            messages.map((m) => (
            <article
              key={m.id}
              className="flex items-start gap-4 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 text-sm font-bold text-purple-800">
                CM
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-purple-800">{m.title}</div>
                  {m.type === 'urgent' ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Urgent
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-500">{fmtDate(m.publish_date)}</div>
                <p className="mt-2 text-sm text-slate-700">{m.body}</p>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-8 text-2xl font-bold text-purple-800">Clinic Events & Promotions</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full" rounded="rounded-2xl" />
              ))
            : null}
          {!loading && events.length === 0 ? (
            <div className="text-sm text-slate-500">No events posted.</div>
          ) : null}
          {!loading &&
            events.map((e, i) => (
            <article key={e.id} className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
              <div className={`flex h-44 items-center justify-center ${POSTERS[i % POSTERS.length]}`}>
                <span className="rounded bg-white/80 px-2 py-1 text-[10px] font-bold tracking-wider text-purple-800">
                  {fmtDate(e.publish_date).toUpperCase()}
                </span>
              </div>
              <div className="p-4">
                <div className="font-semibold text-purple-800">{e.title}</div>
                <p className="mt-1 text-xs text-slate-600">{e.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Announcement
