const express = require('express');
const { supabase, supabaseConfigured } = require('../lib/supabase');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function ensureConfigured(res) {
  if (!supabaseConfigured) {
    res
      .status(500)
      .json({ error: 'Server not configured: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing.' });
    return false;
  }
  return true;
}

function requireAdmin(req, res, next) {
  if (req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin account required' });
  }
  next();
}

router.use(requireAuth, requireAdmin);

function ageFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

async function countPatients(clinicId, filter) {
  let q = supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .is('deleted_at', null);
  if (filter) q = filter(q);
  const { count } = await q;
  return count || 0;
}

async function countWaivers(statuses) {
  const { count } = await supabase
    .from('waiver_submissions')
    .select('*', { count: 'exact', head: true })
    .in('status', statuses);
  return count || 0;
}

router.get('/overview', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const clinic = req.profile.clinic_id;
    const [totalActive, pendingAdmissions, waiversMissing] = await Promise.all([
      countPatients(clinic, (q) => q.eq('status', 'active')),
      countPatients(clinic, (q) => q.eq('status', 'pending')),
      countWaivers(['pending_signature', 'overdue']),
    ]);

    const { data: activity } = await supabase
      .from('audit_log')
      .select('id, action, summary, severity, created_at')
      .eq('clinic_id', clinic)
      .order('created_at', { ascending: false })
      .limit(8);

    res.json({
      stats: { totalActive, pendingAdmissions, waiversMissing },
      activity: activity || [],
    });
  } catch (err) {
    next(err);
  }
});

router.get('/patients', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, patient_id, first_name, middle_name, last_name, date_of_birth, sex, status, admission_form_status')
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .order('patient_id', { ascending: true });
    if (error) return next(error);

    res.json({
      patients: (data || []).map((p) => ({
        id: p.id,
        patient_id: p.patient_id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' '),
        age: ageFromDob(p.date_of_birth),
        sex: p.sex,
        status: p.status,
        admission_form_status: p.admission_form_status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/compliance', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [overdue, pending, compliant, total] = await Promise.all([
      countWaivers(['overdue']),
      countWaivers(['pending_signature']),
      countWaivers(['submitted', 'approved']),
      countPatients(req.profile.clinic_id, null),
    ]);

    const { data: rows, error } = await supabase
      .from('waiver_submissions')
      .select(
        'id, due_date, status, document_type_code, patient_id, patients(first_name, last_name, patient_id), document_types(title)'
      )
      .in('status', ['overdue', 'pending_signature'])
      .order('due_date', { ascending: true });
    if (error) return next(error);

    const { data: guardians } = await supabase
      .from('guardians')
      .select('patient_id, full_name, email, is_primary');
    const guardianByPatient = {};
    (guardians || []).forEach((g) => {
      if (!guardianByPatient[g.patient_id] || g.is_primary) guardianByPatient[g.patient_id] = g;
    });

    res.json({
      summary: { overdue, pending, compliant, total },
      rows: (rows || []).map((r) => {
        const g = guardianByPatient[r.patient_id];
        return {
          id: r.id,
          student: r.patients ? `${r.patients.first_name} ${r.patients.last_name}` : '—',
          sid: r.patients ? r.patients.patient_id : '—',
          parent: g ? g.full_name : '—',
          email: g ? g.email : null,
          doc: r.document_types ? r.document_types.title : r.document_type_code,
          code: r.document_type_code,
          due_date: r.due_date,
          status: r.status,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/schedule', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: rows, error } = await supabase
      .from('appointments')
      .select('id, starts_at, session_type, color_tag, location, practitioner_id, patients(first_name, last_name)')
      .eq('clinic_id', req.profile.clinic_id)
      .order('starts_at', { ascending: true });
    if (error) return next(error);

    const practIds = [...new Set((rows || []).map((r) => r.practitioner_id).filter(Boolean))];
    const { data: pracs } = await supabase.from('profiles').select('id, display_name').in('id', practIds.length ? practIds : ['00000000-0000-0000-0000-000000000000']);
    const nameById = Object.fromEntries((pracs || []).map((p) => [p.id, p.display_name]));

    res.json({
      appointments: (rows || []).map((r) => ({
        id: r.id,
        patient: r.patients ? `${r.patients.first_name} ${r.patients.last_name}` : '—',
        practitioner: nameById[r.practitioner_id] || '—',
        starts_at: r.starts_at,
        session_type: r.session_type,
        color_tag: r.color_tag,
        location: r.location,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/documents', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, document_type_code, finalized_at, patients(first_name, last_name), document_types(title)')
      .order('finalized_at', { ascending: false });
    if (error) return next(error);

    res.json({
      documents: (data || []).map((d) => ({
        id: d.id,
        name: d.patients ? `${d.patients.first_name} ${d.patients.last_name}` : '—',
        type: d.document_types ? d.document_types.title : d.title,
        code: d.document_type_code,
        finalized_at: d.finalized_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/announcements', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, type, body, publish_date, expires_on, audience, image_url')
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .order('publish_date', { ascending: false });
    if (error) return next(error);
    res.json({ announcements: data || [] });
  } catch (err) {
    next(err);
  }
});

router.post('/announcements', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { title, type = 'info', body, publish_date, expires_on, audience } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        clinic_id: req.profile.clinic_id,
        title,
        type,
        body,
        publish_date: publish_date || undefined,
        expires_on: expires_on || null,
        audience: Array.isArray(audience) && audience.length ? audience : ['all'],
        created_by_id: req.profile.id,
      })
      .select('id, title, type, body, publish_date, expires_on, audience, image_url')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ announcement: data });
  } catch (err) {
    next(err);
  }
});

router.get('/scoring', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const clinic = req.profile.clinic_id;
    const { data: patients } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('clinic_id', clinic)
      .is('deleted_at', null);
    const ids = (patients || []).map((p) => p.id);
    if (ids.length === 0) return res.json({ rows: [], summary: { avgCafat: 0, assessmentsThisMonth: 0, needsSupport: 0 } });

    const [{ data: clinicals }, { data: subs }] = await Promise.all([
      supabase.from('clinical_profiles').select('patient_id, gars3_gai_score').in('patient_id', ids),
      supabase
        .from('assessment_submissions')
        .select('patient_id, total_score, created_at, assessment_templates(document_type_code)')
        .in('patient_id', ids),
    ]);
    const garsByPatient = Object.fromEntries((clinicals || []).map((c) => [c.patient_id, c.gars3_gai_score]));

    const behByPatient = {};
    const cafatByPatient = {};
    (subs || []).forEach((s) => {
      const code = s.assessment_templates && s.assessment_templates.document_type_code;
      if (code === 'CMPS:SE-FO-06') behByPatient[s.patient_id] = s.total_score;
      if (code === 'CMPS:SE-FO-05') cafatByPatient[s.patient_id] = s.total_score;
    });

    const statusFor = (beh) => (beh == null ? 'No Data' : beh >= 30 ? 'Mastered' : beh >= 20 ? 'Developing' : 'Needs Support');

    const rows = (patients || []).map((p) => {
      const beh = behByPatient[p.id] ?? null;
      return {
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        beh,
        gars: garsByPatient[p.id] ?? null,
        cafat: cafatByPatient[p.id] ?? null,
        status: statusFor(beh),
      };
    });

    const cafatVals = rows.map((r) => r.cafat).filter((v) => v != null);
    const avgCafat = cafatVals.length ? Number((cafatVals.reduce((a, b) => a + b, 0) / cafatVals.length).toFixed(1)) : 0;

    res.json({
      rows,
      summary: {
        avgCafat,
        assessmentsThisMonth: (subs || []).length,
        needsSupport: rows.filter((r) => r.status === 'Needs Support').length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
