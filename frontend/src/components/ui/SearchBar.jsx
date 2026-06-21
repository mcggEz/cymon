const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-purple-500" fill="none" aria-hidden="true">
    <path
      d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM20 20l-4-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Shared search input. Controlled: pass `value` and an `onChange(text)` that
// receives the raw string. `className` tunes width/flex at the call site.
function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-purple-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition-colors focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20 ${className}`}
    >
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
      />
    </div>
  )
}

export default SearchBar
