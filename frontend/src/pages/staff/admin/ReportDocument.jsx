// Renders a clinical report as an A4 "paper" document — serif type, letterhead,
// metadata block, sections, signature lines. Shape the report with buildReport()
// in ./report.js. Used inside the document viewer overlay in ClinicalRecords.
function ReportDocument({ report }) {
  return (
    <article className="mx-auto w-full max-w-[816px] bg-white p-8 font-serif text-slate-800 shadow-xl ring-1 ring-black/5 sm:p-16 print:shadow-none">
      <header className="border-b-2 border-slate-900 pb-4 text-center">
        <div className="text-xl font-bold tracking-wide text-slate-900">{report.clinic.name}</div>
        <div className="text-sm text-slate-600">{report.clinic.unit}</div>
        <div className="mt-1 text-[11px] text-slate-500">{report.clinic.address}</div>
        <div className="text-[11px] text-slate-500">{report.clinic.contact}</div>
      </header>

      <div className="mt-6 text-center">
        <h1 className="text-lg font-bold uppercase tracking-[0.15em] text-slate-900">{report.title}</h1>
        <div className="mt-0.5 text-[11px] text-slate-500">Form {report.code}</div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-y border-slate-300 py-4">
        {report.meta.map((m) => (
          <div key={m.label}>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{m.label}</dt>
            <dd className="text-sm text-slate-800">{m.value}</dd>
          </div>
        ))}
      </dl>

      {report.sections.map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-900">
            {s.heading}
          </h2>
          <p className="mt-2 whitespace-pre-line text-justify text-sm leading-relaxed text-slate-700">
            {s.body}
          </p>
        </section>
      ))}

      <div className="mt-14 grid grid-cols-2 gap-8">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Prepared by</div>
          <div className="mt-9 border-t border-slate-900 pt-1 text-sm font-bold text-slate-900">
            {report.preparedBy.name}
          </div>
          <div className="text-[11px] text-slate-500">{report.preparedBy.role}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Reviewed &amp; approved by</div>
          <div className="mt-9 border-t border-slate-900 pt-1 text-sm font-bold text-slate-900">
            {report.reviewedBy.name}
          </div>
          <div className="text-[11px] text-slate-500">{report.reviewedBy.role}</div>
        </div>
      </div>

      <footer className="mt-10 border-t border-slate-300 pt-3 text-center text-[10px] leading-relaxed text-slate-400">
        CONFIDENTIAL — This document contains protected health information intended solely for authorized
        clinical personnel. Unauthorized review, use, disclosure, or distribution is prohibited.
      </footer>
    </article>
  )
}

export default ReportDocument
