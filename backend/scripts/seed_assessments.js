// Seeds the assessment engine + reports + interventions + roster classification
// so the client assessment pages and the psychometrician/psychologist portals
// render real data. Idempotent: clears and re-creates the demo rows.
//
// Usage: node scripts/seed_assessments.js   (run after seed_demo.js)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = (process.env.SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '');
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const MMSE_STRUCTURE = [
  { key: 'practical', title: 'PRACTICAL DOMAIN', items: [
    { key: 'appearance', label: 'Dresses appropriate to the occasion' },
    { key: 'opens_container', label: 'Opens a simple container or jar' },
    { key: 'handwashing', label: 'Can demonstrate handwashing when asked' },
    { key: 'drink_cup', label: 'Can independently drink from a cup or bottle' },
  ] },
  { key: 'conceptual', title: 'CONCEPTUAL DOMAIN', items: [
    { key: 'names_objects', label: 'Names at least six familiar objects' },
    { key: 'own_name', label: 'Can say his/her own name' },
    { key: 'full_name', label: 'Knows full name when asked' },
  ] },
  { key: 'affect', title: 'AFFECT & INTERACTION', items: [
    { key: 'eye_contact', label: 'Makes eye contact when name is called' },
    { key: 'greetings', label: 'Responds to greetings (verbal or gesture)' },
    { key: 'emotions', label: 'Can show emotions (happy, sad)' },
  ] },
  { key: 'bodily', title: 'BODILY KINESTHETIC DOMAIN', items: [
    { key: 'pencil', label: 'Can hold a pencil appropriately' },
    { key: 'write_name', label: 'Writes letters or name legibly' },
    { key: 'stand_one_foot', label: 'Can stand on one foot briefly' },
    { key: 'walk_steady', label: 'Walks steadily across the room' },
  ] },
  { key: 'perceptual', title: 'PERCEPTUAL DISTURBANCES & STIMMING', items: [
    { key: 'hallucinations', label: 'Hallucinations' },
    { key: 'hand_flapping', label: 'Hand flapping' },
    { key: 'body_rocking', label: 'Body rocking, head banging or spinning' },
  ] },
];

const CAFT_STRUCTURE = [
  { key: 'academics', title: 'ACADEMIC READINESS', items: [
    { key: 'counts', label: 'Counts from 0 to 10' },
    { key: 'colors', label: 'Identifies primary colors' },
    { key: 'shapes', label: 'Identifies basic shapes' },
    { key: 'letters', label: 'Recognizes letters of own name' },
  ] },
  { key: 'communication', title: 'COMMUNICATION', items: [
    { key: 'word_recognition', label: 'Recognizes familiar words' },
    { key: 'verbal', label: 'Responds to simple verbal instructions' },
  ] },
];

const BEHAV_STRUCTURE = [
  { key: 'social', title: 'SOCIAL BEHAVIOR', items: [
    { key: 'turn_taking', label: 'Takes turns during play' },
    { key: 'shares', label: 'Shares toys with peers' },
    { key: 'follows_routine', label: 'Follows daily routine with prompts' },
  ] },
  { key: 'regulation', title: 'SELF-REGULATION', items: [
    { key: 'calms', label: 'Calms down after being upset' },
    { key: 'transitions', label: 'Manages transitions between activities' },
  ] },
];

const count = (s) => s.reduce((n, d) => n + d.items.length, 0);

async function findProfile(email) {
  const { data } = await sb.from('profiles').select('id').eq('email', email).single();
  return data.id;
}

async function patientsByName() {
  const { data } = await sb.from('patients').select('id, first_name, last_name');
  return Object.fromEntries((data || []).map((p) => [`${p.first_name} ${p.last_name}`, p.id]));
}

// per patient: behavioral score, CAFT score, support level, milestone %, mainstreaming
const PROFILE = {
  'Leo Cruz': { beh: 35, caft: 78, level: 'MSN', progress: 66, ms: { score: 74, status: 'approaching' } },
  'Alex Johnson': { beh: 30, caft: 70, level: 'HSN', progress: 85, ms: { score: 72, status: 'approaching' } },
  'Jordan Smith': { beh: 22, caft: 60, level: 'MSN', progress: 58, ms: { score: 49, status: 'not_ready' } },
  'Casey Williams': { beh: 18, caft: 52, level: 'HSN', progress: 40, ms: { score: 38, status: 'not_ready' } },
  'Mia Santos': { beh: 28, caft: 66, level: 'MSN', progress: 62, ms: { score: 61, status: 'approaching' } },
  'Zara Mendoza': { beh: 33, caft: 80, level: 'LSN', progress: 90, ms: { score: 85, status: 'ready' } },
};

async function main() {
  const psych = await findProfile('psych@clearmind.ph');
  const rpm = await findProfile('rpm@clearmind.ph');
  const byName = await patientsByName();

  // ---------- cleanup in FK-dependency order ----------
  // submissions/assignments reference templates (RESTRICT), so they must go first.
  const ALL = '00000000-0000-0000-0000-000000000000';
  try { await sb.from('session_logs').delete().neq('id', ALL); } catch { /* 0012 not applied */ }
  await sb.from('assessment_reports').delete().neq('id', ALL);
  await sb.from('assessment_submissions').delete().neq('id', ALL);
  await sb.from('assessment_assignments').delete().neq('id', ALL);
  await sb.from('assessment_templates').delete().neq('id', ALL);

  // ---------- templates ----------
  const tplDefs = [
    ['CMPS:SE-FO-04', 'Mini-Mental Status Examination', '🧠', MMSE_STRUCTURE, 20],
    ['CMPS:SE-FO-05', 'Child Adaptive Functioning Tool', '✕', CAFT_STRUCTURE, 15],
    ['CMPS:SE-FO-06', 'Behavioral Assessment', '☺', BEHAV_STRUCTURE, 15],
  ];
  const tpl = {};
  for (const [code, title, icon, structure, mins] of tplDefs) {
    const { data, error } = await sb
      .from('assessment_templates')
      .insert({ document_type_code: code, title, icon, structure, respondent: 'caregiver', est_minutes: mins, max_score: count(structure) })
      .select('id, title')
      .single();
    if (error) throw new Error(`template ${title}: ${error.message}`);
    tpl[code] = data.id;
  }

  // ---------- assignments (Leo's "new assessments") ----------
  await sb.from('assessment_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (byName['Leo Cruz']) {
    for (const code of ['CMPS:SE-FO-04', 'CMPS:SE-FO-05']) {
      await sb.from('assessment_assignments').insert({
        patient_id: byName['Leo Cruz'], template_id: tpl[code], assigned_by_id: psych, status: 'assigned', due_date: '2026-03-15',
      });
    }
  }

  // ---------- submissions (records + scores for ScoringAnalytics/DataReview) ----------
  await sb.from('assessment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  for (const [name, pid] of Object.entries(byName)) {
    const prof = PROFILE[name];
    if (!prof) continue;
    // a behavioral submission (caregiver) + a CAFT submission (processed)
    await sb.from('assessment_submissions').insert({
      patient_id: pid, template_id: tpl['CMPS:SE-FO-06'], respondent_profile_id: psych,
      respondent_name: 'Caregiver', total_score: prof.beh, max_score: 40, status: 'processed', submitted_at: '2026-03-27T00:00:00Z',
    });
    await sb.from('assessment_submissions').insert({
      patient_id: pid, template_id: tpl['CMPS:SE-FO-05'], respondent_profile_id: rpm,
      respondent_name: 'RPm', total_score: prof.caft, max_score: 100, status: 'scored', submitted_at: '2026-03-28T00:00:00Z',
    });
    // roster classification
    await sb.from('clinical_profiles').update({ support_level: prof.level, milestone_progress: prof.progress }).eq('patient_id', pid);
    // mainstreaming
    await sb.from('mainstreaming_assessments').delete().eq('patient_id', pid);
    await sb.from('mainstreaming_assessments').insert({
      patient_id: pid, evaluated_by_id: psych, readiness_score: prof.ms.score, status: prof.ms.status, evaluated_on: '2026-03-25',
    });
  }

  // ---------- interventions ----------
  await sb.from('interventions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const interv = [
    ['Alex Johnson', 'Behavioral Intervention Plan', 5, 'completed', '2026-03-28'],
    ['Jordan Smith', 'Attention & Focus Plan', 3, 'in_progress', '2026-03-26'],
    ['Mia Santos', 'Speech Support Plan', 4, 'completed', '2026-03-24'],
    ['Casey Williams', 'Sensory Integration Plan', 2, 'planned', '2026-03-29'],
    ['Leo Cruz', 'Social Communication Plan', 6, 'in_progress', '2026-03-22'],
  ];
  for (const [name, title, n, status, date] of interv) {
    if (!byName[name]) continue;
    await sb.from('interventions').insert({ patient_id: byName[name], author_id: psych, title, procedure_count: n, status, plan_date: date });
  }

  // ---------- reports (DraftingReports / Approvals / Progress) ----------
  await sb.from('assessment_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const reports = [
    ['Alex Johnson', 'behavioral', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', 'ready_for_review', 100, 'high', null, null],
    ['Leo Cruz', 'behavioral', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', 'in_progress', 65, 'normal', null, null],
    ['Jordan Smith', 'behavioral', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', 'draft', 30, 'normal', null, null],
    ['Mia Santos', 'progress_summary', 'CMPS:SE-FO-08', 'Progress Summary Report', 'approved', 100, 'normal', 'March 2026', '↑ Improving'],
    ['Zara Mendoza', 'progress_summary', 'CMPS:SE-FO-08', 'Progress Summary Report', 'ready_for_review', 100, 'normal', 'March 2026', '↑ Improving'],
    ['Casey Williams', 'progress_summary', 'CMPS:SE-FO-08', 'Progress Summary Report', 'draft', 45, 'normal', 'March 2026', '→ Stable'],
  ];
  for (const [name, type, code, title, status, completeness, priority, period, trend] of reports) {
    if (!byName[name]) continue;
    await sb.from('assessment_reports').insert({
      patient_id: byName[name], report_type: type, document_type_code: code, title, status, completeness, priority, period, trend,
      prepared_by_id: rpm, noted_by_id: status === 'approved' ? psych : null,
      content: `${title} for ${name}. Auto-generated demo content summarizing progress and recommendations.`,
      finalized_at: status === 'approved' ? '2026-03-28T00:00:00Z' : null,
    });
  }

  // ---------- session logs (FO-07) — requires migration 0012 ----------
  try {
    await sb.from('session_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const logs = [
      ['Jordan Smith', 2, '2026-03-29', 'Sensory Integration Play', 'draft'],
      ['Alex Johnson', 4, '2026-03-28', 'Pegboard Sorting & Colors', 'pending'],
      ['Casey Williams', 3, '2026-03-26', 'Picture Exchange Communication', 'approved'],
      ['Leo Cruz', 5, '2026-03-24', 'Routine-Based Prompting', 'approved'],
    ];
    let seeded = 0;
    for (const [name, n, date, title, status] of logs) {
      if (!byName[name]) continue;
      const { error } = await sb.from('session_logs').insert({
        patient_id: byName[name], author_id: rpm, session_number: n, session_date: date, activity_title: title, status,
      });
      if (!error) seeded += 1;
    }
    console.log('session_logs seeded:', seeded);
  } catch {
    console.log('session_logs skipped (run migration 0012 first)');
  }

  console.log('seed_assessments complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
