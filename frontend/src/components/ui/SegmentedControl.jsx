function SegmentedControl({ value, onChange, options, className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex w-full rounded-full bg-slate-100 p-1 border border-charcoal/5 ${className}`}
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
              'flex-1 h-9 rounded-full text-xs font-semibold tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/30',
              selected
                ? 'bg-violet text-white shadow-sm'
                : 'text-slate-500 hover:text-charcoal',
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
