// Compact table-row action button. Consistent View/Edit styling across every
// table: `view` is an outlined purple button, `edit` is a solid emerald button.
const variants = {
  view: 'border border-purple-300 text-purple-700 hover:bg-purple-50',
  edit: 'bg-emerald-500 text-white hover:bg-emerald-600',
}

function RowAction({ variant = 'view', className = '', type = 'button', children, ...rest }) {
  return (
    <button
      type={type}
      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default RowAction
