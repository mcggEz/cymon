// Seeds demo data for the admin portal (patients, guardians, clinical profiles,
// appointments, waivers, documents, announcements, audit log) against the
// configured Supabase project. Idempotent: re-running refreshes the demo set.
//
// Usage: node scripts/seed_demo.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = (process.env.SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '');
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const PW = 'Password123!';

const DEMO = [
  {
    email: 'parent.alex@clearmind.ph', caregiver: 'Maria Johnson',
    child: { first_name: 'Alex', last_name: 'Johnson', date_of_birth: '2018-02-10', sex: 'male', status: 'active', admission_form_status: 'complete' },
    clinical: { primary_diagnosis: 'Autism Spectrum Disorder', iep_level: 'Level 1 — High Support', date_enrolled: '2026-01-10', gars3_gai_score: 118, gars3_label: 'High' },
    guardian: { full_name: 'Maria Johnson', relationship: 'Mother', email: 'maria.johnson@email.com', contact_number: '+63 917 200 0001' },
  },
  {
    email: 'parent.jordan@clearmind.ph', caregiver: 'Paolo Smith',
    child: { first_name: 'Jordan', last_name: 'Smith', date_of_birth: '2016-05-04', sex: 'male', status: 'active', admission_form_status: 'pending' },
    clinical: { primary_diagnosis: 'ADHD', iep_level: 'Level 2 — Moderate', date_enrolled: '2026-02-01', gars3_gai_score: 96, gars3_label: 'Low' },
    guardian: { full_name: 'Paolo Smith', relationship: 'Father', email: 'paolo.smith@email.com', contact_number: '+63 917 200 0002' },
  },
  {
    email: 'parent.casey@clearmind.ph', caregiver: 'Anna Williams',
    child: { first_name: 'Casey', last_name: 'Williams', date_of_birth: '2019-03-22', sex: 'female', status: 'pending', admission_form_status: 'in_progress' },
    clinical: { primary_diagnosis: 'Autism Spectrum Disorder', iep_level: 'Level 2 — Moderate', date_enrolled: '2026-03-05' },
    guardian: { full_name: 'Anna Williams', relationship: 'Mother', email: 'anna.williams@email.com', contact_number: '+63 917 200 0003' },
  },
  {
    email: 'parent.mia@clearmind.ph', caregiver: 'John Santos',
    child: { first_name: 'Mia', last_name: 'Santos', date_of_birth: '2017-08-15', sex: 'female', status: 'active', admission_form_status: 'complete' },
    clinical: { primary_diagnosis: 'Global Developmental Delay', iep_level: 'Level 2 — Moderate', date_enrolled: '2026-01-20', gars3_gai_score: 104, gars3_label: 'Moderate' },
    guardian: { full_name: 'John Santos', relationship: 'Father', email: 'john.santos@email.com', contact_number: '+63 917 200 0004' },
  },
  {
    email: 'parent.zara@clearmind.ph', caregiver: 'Lidia Mendoza',
    child: { first_name: 'Zara', last_name: 'Mendoza', date_of_birth: '2018-11-30', sex: 'female', status: 'active', admission_form_status: 'complete' },
    clinical: { primary_diagnosis: 'Autism Spectrum Disorder', iep_level: 'Level 3 — Low Support', date_enrolled: '2026-02-12', gars3_gai_score: 88, gars3_label: 'Low' },
    guardian: { full_name: 'Lidia Mendoza', relationship: 'Mother', email: 'lidia.mendoza@email.com', contact_number: '+63 917 200 0005' },
  },
];

async function profileId(email) {
  const { data } = await sb.from('profiles').select('id, clinic_id').eq('email', email).single();
  return data;
}

async function ensureCaregiver(email, name) {
  const { data: list } = await sb.auth.admin.listUsers();
  const existing = list.users.find((u) => u.email === email);
  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await sb.auth.admin.createUser({
      email, password: PW, email_confirm: true,
      user_metadata: { role: 'client', display_name: name },
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    userId = data.user.id;
  }
  return userId;
}

async function main() {
  const clinic = (await profileId('admin@clearmind.ph')).clinic_id;
  const admin = await profileId('admin@clearmind.ph');
  const psych = await profileId('psych@clearmind.ph');
  const rpm = await profileId('rpm@clearmind.ph');

  // Give the staff realistic names + ensure staff rows for FK targets.
  await sb.from('profiles').update({ display_name: 'Dr. Jinky C. Malabanan' }).eq('id', psych.id);
  await sb.from('profiles').update({ display_name: 'Dr. R. Faustino' }).eq('id', rpm.id);
  await sb.from('staff').upsert([
    { profile_id: psych.id, title: 'Clinical Psychologist', license_no: 'PRC-PSY-0001' },
    { profile_id: rpm.id, title: 'Psychometrician', license_no: 'PRC-PM-0002' },
  ], { onConflict: 'profile_id' });

  const byName = {};
  for (const d of DEMO) {
    const cgId = await ensureCaregiver(d.email, d.caregiver);
    await sb.from('patients').delete().eq('caregiver_id', cgId); // refresh
    const { data: p, error } = await sb
      .from('patients')
      .insert({ clinic_id: clinic, caregiver_id: cgId, ...d.child })
      .select('id, patient_id')
      .single();
    if (error) throw new Error(`patient ${d.child.first_name}: ${error.message}`);
    byName[`${d.child.first_name} ${d.child.last_name}`] = p.id;
    await sb.from('clinical_profiles').insert({
      patient_id: p.id, treating_psychologist_id: psych.id, treating_psychometrician_id: rpm.id, ...d.clinical,
    });
    await sb.from('guardians').insert({ patient_id: p.id, is_primary: true, ...d.guardian });
    console.log('patient', p.patient_id, d.child.first_name, d.child.last_name);
  }

  // Leo Cruz already exists under client@clearmind.ph — include him in appointments/waivers.
  const { data: leo } = await sb.from('patients').select('id').eq('first_name', 'Leo').eq('last_name', 'Cruz').maybeSingle();
  if (leo) byName['Leo Cruz'] = leo.id;

  // ---------- appointments ----------
  await sb.from('appointments').delete().eq('clinic_id', clinic);
  const appts = [
    ['Zara Mendoza', '2026-03-30T10:00:00+08:00', 'cafat', rpm.id, 'sky'],
    ['Casey Williams', '2026-03-31T09:30:00+08:00', 'follow_up', psych.id, 'rose'],
    ['Leo Cruz', '2026-04-03T11:00:00+08:00', 'gars', rpm.id, 'emerald'],
    ['Mia Santos', '2026-04-07T13:30:00+08:00', 'therapy', psych.id, 'amber'],
    ['Alex Johnson', '2026-04-10T14:00:00+08:00', 'mmse', rpm.id, 'sky'],
    ['Jordan Smith', '2026-04-15T09:00:00+08:00', 'initial_assessment', psych.id, 'purple'],
  ];
  for (const [name, starts, type, prac, color] of appts) {
    if (!byName[name]) continue;
    await sb.from('appointments').insert({
      clinic_id: clinic, patient_id: byName[name], practitioner_id: prac,
      starts_at: starts, session_type: type, color_tag: color, location: 'ClearMind Clinic', created_by_id: admin.id,
    });
  }

  // ---------- waiver_submissions (compliance) ----------
  await sb.from('waiver_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const waivers = [
    ['Leo Cruz', 'CMPS:SE-FO-02', '2026-03-15', 'overdue'],
    ['Mia Santos', 'CMPS:SE-FO-12', '2026-03-29', 'pending_signature'],
    ['Zara Mendoza', 'CMPS:SE-FO-02', '2026-03-10', 'overdue'],
    ['Alex Johnson', 'CMPS:SE-FO-12', '2026-04-05', 'pending_signature'],
    ['Casey Williams', 'CMPS:SE-FO-02', '2026-02-28', 'overdue'],
    ['Jordan Smith', 'CMPS:SE-FO-02', '2026-03-20', 'submitted'],
  ];
  for (const [name, code, due, status] of waivers) {
    if (!byName[name]) continue;
    await sb.from('waiver_submissions').insert({ patient_id: byName[name], document_type_code: code, due_date: due, status });
  }

  // ---------- documents (vault) ----------
  await sb.from('documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const docs = [
    ['Leo Cruz', 'CMPS:SE-FO-06', 'Behavioral Assessment Report', '2026-03-30T00:00:00Z'],
    ['Alex Johnson', 'CMPS:SE-FO-02', 'SPED Consent and Waiver', '2026-03-28T00:00:00Z'],
    ['Jordan Smith', 'CMPS:SE-FO-01', 'Student Admission Form', '2026-03-27T00:00:00Z'],
  ];
  for (const [name, code, title, finalized] of docs) {
    if (!byName[name]) continue;
    await sb.from('documents').insert({ patient_id: byName[name], document_type_code: code, title, finalized_at: finalized, created_by_id: admin.id });
  }

  // ---------- announcements ----------
  await sb.from('announcements').delete().eq('clinic_id', clinic);
  const anns = [
    ['World Down Syndrome Day', 'event', 'Join us in celebrating World Down Syndrome Day on March 21. We will have special activities for students and families at the clinic.', '2026-03-21'],
    ['SummerScape Enrollment Now Open', 'urgent', 'SummerScape 2026 enrollment is now open. Please submit your registration and waiver form before March 29. Limited slots available.', '2026-03-18'],
    ['March Assessment Schedule', 'info', 'Assessment schedules for March have been finalized. Please check the portal calendar for your child’s appointment time.', '2026-03-01'],
  ];
  for (const [title, type, body, publish] of anns) {
    await sb.from('announcements').insert({ clinic_id: clinic, title, type, body, publish_date: publish, created_by_id: admin.id });
  }

  // ---------- audit_log (recent activity) ----------
  await sb.from('audit_log').delete().eq('clinic_id', clinic);
  const audit = [
    ['waiver.submit', 'SPED Waiver submitted by Jordan Smith', 'info'],
    ['waiver.remind', 'Reminder sent to Maria Cruz for overdue FO-02', 'warn'],
    ['announcement.post', 'Announcement posted: World Down Syndrome Day', 'info'],
    ['admission.submit', 'New admission form submitted: Casey Williams', 'info'],
    ['waiver.overdue', 'Mia Santos — SummerScape waiver still pending signature', 'alert'],
  ];
  for (const [action, summary, severity] of audit) {
    await sb.from('audit_log').insert({ clinic_id: clinic, actor_id: admin.id, action, summary, severity });
  }

  console.log('seed_demo complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
