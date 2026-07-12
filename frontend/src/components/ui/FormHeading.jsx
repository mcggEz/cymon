// A flat, numbered section heading matching the printed CMPS forms
// (e.g. "I. PERSONAL INFORMATION" in purple bold caps). No card — the paper
// forms lay sections directly on the page.
function FormHeading({ numeral, children, className = '' }) {
  return (
    <h2
      className={`mt-2 mb-0.5 flex items-baseline gap-2 text-[13px] font-bold uppercase tracking-wide text-purple-800 ${className}`}
    >
      {numeral ? <span>{numeral}.</span> : null}
      <span>{children}</span>
    </h2>
  )
}

export default FormHeading
