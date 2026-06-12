import { useId } from 'react'

const tones = {
  default:
    'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/30',
  purple:
    'border-purple-200 bg-purple-50 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/30',
}

const labelTones = {
  default: 'text-slate-700',
  purple: 'text-purple-800',
}

function Input({ label, className = '', id, tone = 'default', ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className={`text-sm font-medium ${labelTones[tone]}`}
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 ${tones[tone]}`}
        {...rest}
      />
    </div>
  )
}

export default Input
