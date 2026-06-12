import { useId } from 'react'

function Select({ label, className = '', id, children, placeholder, ...rest }) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label htmlFor={selectId} className="text-sm font-medium text-purple-800">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className="h-10 w-full rounded-md border border-purple-200 bg-purple-50 px-3 text-sm text-slate-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        defaultValue=""
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
    </div>
  )
}

export default Select
