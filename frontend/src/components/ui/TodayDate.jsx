// Today's date pill for dashboard top bars. Reads the date at render — it does
// not need to tick, since a session rarely crosses midnight.
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v13H4zM4 11h16M8 3v4M16 3v4" />
  </svg>
)

function TodayDate({ className = '' }) {
  const label = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return (
    <div
      className={`hidden items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 md:inline-flex ${className}`}
      title="Today"
    >
      <CalendarIcon />
      {label}
    </div>
  )
}

export default TodayDate
