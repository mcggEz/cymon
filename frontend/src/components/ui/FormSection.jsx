// A numbered card section inside a clinic form (matches the "I / II / III …"
// pattern in the source documents). Pass a Roman-numeral/label `eyebrow`.
function FormSection({ eyebrow, title, children, className = '' }) {
  return (
    <section
      className={`mb-4 break-inside-avoid rounded-xl border border-purple-100 bg-white p-5 shadow-sm print:border-slate-300 print:shadow-none ${className}`}
    >
      <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-purple-900">
        {eyebrow ? (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-medium text-purple-500">
            {eyebrow}
          </span>
        ) : null}
        {title}
      </h2>
      {children}
    </section>
  )
}

export default FormSection
