import { useId } from 'react'

function Textarea({ label, className = '', id, rows = 3, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-purple-800">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        rows={rows}
        className="w-full rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        {...rest}
      />
    </div>
  )
}

export default Textarea
