import { useNavigate } from 'react-router-dom'
import StaffHeader from '../StaffHeader'

const PUBLISHED = [
  {
    title: 'World Down Syndrome Day',
    type: 'EVENT',
    tone: 'rose',
    date: 'Mar 21, 2026',
    body: 'Join us in celebrating World Down Syndrome Day on March 21. We will have special activities for students and families at the clinic.',
  },
  {
    title: 'SummerScape Enrollment Now Open',
    type: 'URGENT',
    tone: 'amber',
    date: 'Mar 18, 2026',
    body: 'SummerScape 2026 enrollment is now open. Please submit your registration and waiver form before March 29. Limited slots available.',
  },
  {
    title: 'March Assessment Schedule',
    type: 'INFO',
    tone: 'sky',
    date: 'Mar 1, 2026',
    body: 'Assessment schedules for March have been finalized. Please check the portal calendar for your child’s appointment time.',
  },
]

const typeTone = {
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
}

const TypeChip = ({ active, label, color }) => (
  <button
    type="button"
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
                <input placeholder="e.g. World Down Syndrome Day" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">TYPE</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <TypeChip active label="🚨 Urgent" color="bg-rose-100 text-rose-700" />
                  <TypeChip label="🎉 Event" color="bg-amber-100 text-amber-700" />
                  <TypeChip label="ℹ General Info" color="bg-sky-100 text-sky-700" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">PUBLISH DATE *</div>
                  <input type="date" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-wider text-purple-700">EXPIRES ON</div>
                  <input type="date" className="mt-1 h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm" />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wider text-purple-700">MESSAGE BODY *</div>
                <textarea rows={4} placeholder="Type the full announcement message here…" className="mt-1 w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm" />
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
              <button
                type="button"
                className="w-full rounded-md bg-purple-700 px-4 py-3 text-sm font-medium text-white hover:bg-purple-800"
              >
                📣 Publish Announcement
              </button>
            </form>
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-purple-800">📋 PUBLISHED</div>
            <ul className="mt-3 space-y-3">
              {PUBLISHED.map((p) => (
                <li key={p.title} className="rounded-md border border-purple-200 bg-white p-3">
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-purple-800">{p.title}</div>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${typeTone[p.tone]}`}>
                      {p.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{p.body}</p>
                  <div className="mt-1 text-[10px] text-slate-400">{p.date}</div>
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
