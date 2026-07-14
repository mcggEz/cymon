// Builds a structured clinical report from a document row and renders it to a
// print-ready A4 PDF via the browser's native print pipeline (Save as PDF).
// Kept framework-free (no JSX) so it can be shared by the on-screen viewer
// (ReportDocument.jsx) and the print/download action.

export function buildReport(row) {
  const name = row?.name || 'Student'
  const dateOfReport = row?.date || 'March 28, 2026'
  const initials = (row?.type || 'DOC')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  const ref = `${initials}-${String(row?.id || '00000000').slice(0, 8).toUpperCase()}`
  return {
    clinic: {
      name: 'ClearMind Psychological Services',
      unit: 'Special Education (SPED) Program',
      address: '2/F Wellness Building, 123 Harmony Avenue, Quezon City',
      contact: 'records@clearmind.example · (02) 8123 4567',
    },
    title: row?.type || 'Progress Summary Report',
    code: 'CMPS:SE-FO-08',
    meta: [
      { label: 'Student Name', value: name },
      { label: 'Age / Sex', value: '7 / Male' },
      { label: 'Date of Report', value: dateOfReport },
      { label: 'Reference No.', value: ref },
    ],
    sections: [
      {
        heading: 'Summary of Progress',
        body: `${name} has shown significant improvement in fine motor skills over the last three months and can now sort pegs by color with minimal prompting. Attention span during seated tasks remains a target area for the coming quarter.`,
      },
      {
        heading: 'Clinical Observations',
        body: 'The student engaged cooperatively across scheduled sessions and responded well to a structured, low-distraction environment. Transitions between activities were smoother when supported by a visual schedule.',
      },
      {
        heading: 'Recommendations',
        body: 'Continue occupational therapy twice weekly.\nImplement a visual timer for seated tasks at home and in school.\nRe-evaluate attention and behavioral goals at the next quarterly review.',
      },
    ],
    preparedBy: { name: 'Erika Faustino, RPm', role: 'Psychometrician' },
    reviewedBy: { name: 'Dr. Alden Cruz, RPsy', role: 'Chief Psychologist' },
  }
}

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

function reportToHtml(report) {
  const meta = report.meta
    .map(
      (m) =>
        `<div class="meta-item"><div class="meta-label">${esc(m.label)}</div><div>${esc(m.value)}</div></div>`
    )
    .join('')
  const sections = report.sections
    .map((s) => `<section class="section"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`)
    .join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(report.title)} — ${esc(report.meta[0]?.value || '')}</title>
<style>
  @page { size: A4; margin: 0 !important; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', Times, serif; color: #1f2937; font-size: 12px; line-height: 1.55; padding: 18mm 16mm; }
  .letterhead { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; }
  .clinic-name { font-size: 20px; font-weight: 700; letter-spacing: .03em; color: #0f172a; }
  .clinic-unit { font-size: 13px; color: #475569; }
  .clinic-sub { font-size: 11px; color: #64748b; }
  .title-wrap { text-align: center; margin-top: 22px; }
  h1.title { font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: .15em; color: #0f172a; margin: 0; }
  .form-code { font-size: 11px; color: #64748b; margin-top: 2px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 32px; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; padding: 14px 0; margin-top: 22px; }
  .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; font-weight: 700; }
  .section { margin-top: 20px; page-break-inside: avoid; }
  .section h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 0; }
  .section p { margin: 8px 0 0; text-align: justify; white-space: pre-line; color: #334155; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 52px; }
  .sig-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
  .sig-name { border-top: 1px solid #0f172a; padding-top: 4px; margin-top: 34px; font-weight: 700; color: #0f172a; }
  .sig-role { font-size: 11px; color: #64748b; }
  .conf { margin-top: 36px; border-top: 1px solid #cbd5e1; padding-top: 10px; text-align: center; font-size: 9px; color: #94a3b8; line-height: 1.5; }
</style></head>
<body>
  <div class="letterhead">
    <div class="clinic-name">${esc(report.clinic.name)}</div>
    <div class="clinic-unit">${esc(report.clinic.unit)}</div>
    <div class="clinic-sub">${esc(report.clinic.address)}</div>
    <div class="clinic-sub">${esc(report.clinic.contact)}</div>
  </div>
  <div class="title-wrap">
    <h1 class="title">${esc(report.title)}</h1>
    <div class="form-code">Form ${esc(report.code)}</div>
  </div>
  <div class="meta">${meta}</div>
  ${sections}
  <div class="signatures">
    <div><div class="sig-label">Prepared by</div><div class="sig-name">${esc(report.preparedBy.name)}</div><div class="sig-role">${esc(report.preparedBy.role)}</div></div>
    <div><div class="sig-label">Reviewed &amp; approved by</div><div class="sig-name">${esc(report.reviewedBy.name)}</div><div class="sig-role">${esc(report.reviewedBy.role)}</div></div>
  </div>
  <div class="conf">CONFIDENTIAL — This document contains protected health information intended solely for authorized clinical personnel. Unauthorized review, use, disclosure, or distribution is prohibited.</div>
</body></html>`
}

// Opens the browser print dialog (which offers "Save as PDF") for the report,
// using an off-screen iframe so it works without popup-blocker prompts.
export function printReport(report) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(reportToHtml(report))
  doc.close()

  const win = iframe.contentWindow
  let removed = false
  const cleanup = () => {
    if (removed) return
    removed = true
    setTimeout(() => iframe.remove(), 300)
  }
  win.onafterprint = cleanup

  // Let the iframe lay out before printing; there are no external assets to wait on.
  setTimeout(() => {
    win.focus()
    win.print()
    // Fallback for browsers that don't fire onafterprint.
    setTimeout(cleanup, 60000)
  }, 100)
}
