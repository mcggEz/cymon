// Build a patient's display name with a middle initial: "First M. Last".
// Pass an object carrying first_name / middle_name / last_name (e.g. a patients
// row or a joined `patients(...)` object). Returns '—' when given null/undefined
// so callers can drop their own fallbacks.
function patientName(p) {
  if (!p) return '—';
  const mid = p.middle_name && p.middle_name.trim();
  const initial = mid ? `${mid.charAt(0).toUpperCase()}.` : null;
  return [p.first_name, initial, p.last_name].filter(Boolean).join(' ');
}

module.exports = { patientName };
