import PageHeader from './PageHeader'

const MESSAGES = [
  {
    sender: 'Dr. Jinky C. Malabanan',
    initials: 'DR',
    color: 'bg-rose-200 text-rose-800',
    date: 'Mar 10, 2026',
    isNew: true,
    body:
      "Hi Maria! Leo had a great session today. Please make sure he practices the labeling exercises and complete the 3 assessments I assigned before the March 15 session. See you soon!",
  },
  {
    sender: 'ClearMind Clinic',
    initials: 'CC',
    color: 'bg-purple-200 text-purple-800',
    date: 'Feb 28, 2026',
    body:
      "Leo's GARS-3 assessment results have been uploaded. His Autism Index (GAI) score was 112, indicating moderate support needs. His IEP will be updated accordingly.",
  },
]

const EVENTS = [
  {
    title: 'First Anniversary Offer',
    desc: 'Thank you to those who registered! Kindly check your email for the confirmation of your slot.',
    poster: 'bg-gradient-to-br from-rose-200 to-purple-300',
    badge: 'REGISTRATION CLOSED',
  },
  {
    title: 'World Down Syndrome Day',
    desc: 'Join ClearMind Psychological Services as we celebrate, raise awareness, and advocate for inclusivity.',
    poster: 'bg-gradient-to-br from-yellow-200 to-blue-300',
    badge: 'MARCH 21, 2026',
  },
  {
    title: 'CyMon SummerScape 2026',
    desc: "Enroll your child for our summer batch! Scan the QR code or click here to sign the waiver and register.",
    poster: 'bg-gradient-to-br from-orange-200 to-amber-300',
    badge: 'OPEN FOR REGISTRATION',
  },
]

function Announcement() {
  return (
    <>
      <PageHeader title="Announcement" />
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-bold tracking-wider text-purple-800">CLINIC ANNOUNCEMENTS</h1>
        <div className="mt-3 rounded-xl bg-purple-200/70 px-4 py-2 text-sm text-purple-900">
          Updates and notes from ClearMind Psychological Services regarding Leo&apos;s care.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {MESSAGES.map((m) => (
            <article
              key={m.sender + m.date}
              className="flex items-start gap-4 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${m.color}`}>
                {m.initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-purple-800">{m.sender}</div>
                  {m.isNew ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      New
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-500">{m.date}</div>
                <p className="mt-2 text-sm text-slate-700">{m.body}</p>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-8 text-2xl font-bold text-purple-800">Clinic Events & Promotions</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {EVENTS.map((e) => (
            <article key={e.title} className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
              <div className={`flex h-44 items-center justify-center ${e.poster}`}>
                <span className="rounded bg-white/80 px-2 py-1 text-[10px] font-bold tracking-wider text-purple-800">
                  {e.badge}
                </span>
              </div>
              <div className="p-4">
                <div className="font-semibold text-purple-800">{e.title}</div>
                <p className="mt-1 text-xs text-slate-600">{e.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export default Announcement
