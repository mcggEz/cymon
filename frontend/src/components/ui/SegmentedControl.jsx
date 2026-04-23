function SegmentedControl({ value, onChange, options, className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex w-full rounded-full bg-purple-600 p-1 ${className}`}
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(opt.value)}
            className={[
              'flex-1 h-9 rounded-full text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
              selected
                ? 'bg-white text-purple-700 shadow'
                : 'text-white/90 hover:text-white',
            ].join(' ')}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
