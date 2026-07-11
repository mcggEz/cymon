// Reusable shimmer skeleton. Size/shape it with Tailwind classes:
//   <Skeleton className="h-10 w-full" />           - a bar
//   <Skeleton className="h-12 w-12 rounded-full" /> - an avatar
//   <SkeletonText lines={3} />                      - stacked text lines
//   <SkeletonText lines={5} as="rows" />            - list/table row blocks

function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <div aria-hidden="true" className={`skeleton ${rounded} ${className}`} />
}

export function SkeletonText({ lines = 3, as = 'text', className = '' }) {
  if (as === 'rows') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

export default Skeleton
