const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
}

const initialsOf = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

function Avatar({ name = '', src = null, size = 'md', className = '' }) {
  const sizeCls = SIZES[size] || SIZES.md
  const initials = initialsOf(name)
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-100 font-bold text-purple-700 ring-1 ring-purple-200 ${sizeCls} ${className}`}
      aria-label={name ? `Photo of ${name}` : 'Patient photo'}
    >
      {src ? (
        <img src={src} alt={name ? `Photo of ${name}` : ''} className="h-full w-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
        </svg>
      )}
    </div>
  )
}

export default Avatar
