import { useId } from 'react'

function Checkbox({ label, className = '', id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2 text-sm text-slate-600 select-none cursor-pointer ${className}`}
    >
      <input
        id={inputId}
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
        {...rest}
      />
      {label}
    </label>
  )
}

export default Checkbox
