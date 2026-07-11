// Label + control wrapper for clinic forms. Put the input/select/textarea as
// children (style them with fieldInput/fieldTextarea from ./formStyles).
function FormField({ label, hint, flag = false, className = '', children }) {
  return (
    <div className={className}>
      {label ? (
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-purple-800">
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p className={`mt-1 text-[11px] ${flag ? 'italic text-rose-500' : 'text-slate-400'}`}>{hint}</p>
      ) : null}
    </div>
  )
}

export default FormField
