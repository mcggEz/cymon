import { useEffect, useState } from 'react'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setHealth)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main className="min-h-dvh flex items-center justify-center bg-neutral-950 text-neutral-100 p-4 min-[360px]:p-6 sm:p-8">
      <div className="flex flex-col gap-3 items-start">
        <h1 className="text-2xl min-[360px]:text-3xl sm:text-4xl font-semibold tracking-tight">
          cymon
        </h1>
        <p className="text-sm text-neutral-400">
          API:{' '}
          {error ? (
            <span className="text-red-400">unreachable — {error}</span>
          ) : health ? (
            <span className="text-green-400">
              {health.status} · uptime {Math.round(health.uptime)}s
            </span>
          ) : (
            <span className="text-neutral-500">checking…</span>
          )}
        </p>
      </div>
    </main>
  )
}

export default App
