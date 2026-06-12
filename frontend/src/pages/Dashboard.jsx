import Button from '../components/ui/Button'

function Dashboard({ onLogout }) {
  return (
    <main className="min-h-dvh bg-[#efeaf7] p-4 min-[360px]:p-6 sm:p-10">
      <header className="mx-auto max-w-5xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl min-[360px]:text-3xl font-bold text-purple-800">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600">Welcome back to CyMon.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </header>

      <section className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Upcoming sessions</h2>
          <p className="mt-2 text-3xl font-semibold text-purple-800">0</p>
        </article>
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Assessments</h2>
          <p className="mt-2 text-3xl font-semibold text-purple-800">0</p>
        </article>
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-slate-500">Messages</h2>
          <p className="mt-2 text-3xl font-semibold text-purple-800">0</p>
        </article>
      </section>
    </main>
  )
}

export default Dashboard
