const express = require('express');
const { supabase, supabaseConfigured } = require('../lib/supabase');
const { createNotification } = require('../lib/notify');
const { patientName } = require('../lib/names');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function ensureConfigured(res) {
  if (!supabaseConfigured) {
    res.status(500).json({ error: 'Server not configured: Supabase missing.' });
    return false;
  }
  return true;
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.profile.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

router.use(requireAuth, requireRole('psychometrician', 'admin'));

const SESSION_LABEL = {
  mmse: 'MMSE Assessment',
  cafat: 'CAFAT Testing',
  gars: 'GARS Assessment',
  initial_assessment: 'Initial Assessment',
  follow_up: 'Follow-up Session',
  therapy: 'Therapy Session',
  parent_consultation: 'Parent Consultation',
};

function ageFromDob(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a -= 1;
  return a;
}

const name = patientName;
const inClinic = (rows, clinic) => (rows || []).filter((r) => r.patients && r.patients.clinic_id === clinic);

router.get('/tasks', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, starts_at, session_type, location, status, patients(first_name, middle_name, last_name, patient_id, date_of_birth, sex)')
      .eq('clinic_id', req.profile.clinic_id)
      .order('starts_at', { ascending: true });
    if (error) return next(error);
    res.json({
      tasks: (data || []).map((a) => {
        const dt = new Date(a.starts_at);
        const p = a.patients;
        const sexInit = p?.sex ? p.sex[0].toUpperCase() : '';
        return {
          id: a.id,
          name: name(p),
          meta: p ? `ID: ${p.patient_id} · ${ageFromDob(p.date_of_birth)} yrs / ${sexInit}` : '',
          detail: SESSION_LABEL[a.session_type] || a.session_type,
          room: a.location || '—',
          time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          status: a.status === 'completed' ? 'COMPLETED' : 'SCHEDULED',
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/assessments', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [{ data: tests }, { data: sessions }, { data: roster }] = await Promise.all([
      supabase.from('assessment_templates').select('id, document_type_code, title, est_minutes, icon, document_types(description)').eq('is_active', true),
      supabase
        .from('appointments')
        .select('id, starts_at, patients(first_name, middle_name, last_name)')
        .eq('clinic_id', req.profile.clinic_id)
        .order('starts_at', { ascending: true })
        .limit(6),
      supabase
        .from('patients')
        .select('id, first_name, middle_name, last_name')
        .eq('clinic_id', req.profile.clinic_id)
        .is('deleted_at', null)
        .order('first_name', { ascending: true }),
    ]);
    res.json({
      tests: (tests || []).map((t) => ({
        id: t.id,
        code: t.document_type_code,
        title: t.title,
        desc: t.document_types ? t.document_types.description : '',
        duration: t.est_minutes ? `Est. ${t.est_minutes} mins` : '',
        icon: t.icon,
      })),
      sessions: (sessions || []).map((s) => ({
        id: s.id,
        label: `${name(s.patients)} (${new Date(s.starts_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} Session)`,
      })),
      patients: (roster || []).map((p) => ({ id: p.id, name: patientName(p) })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/data-review', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('assessment_submissions')
      .select('id, status, flagged, submitted_at, created_at, respondent_name, respondent_relationship, patients(first_name, middle_name, last_name, patient_id, clinic_id)')
      .order('created_at', { ascending: false });
    if (error) return next(error);
    const rows = inClinic(data, req.profile.clinic_id);
    res.json({
      summary: {
        newSubmissions: rows.filter((r) => ['submitted', 'processed'].includes(r.status)).length,
        flagged: rows.filter((r) => r.flagged).length,
        approved: rows.filter((r) => r.status === 'scored').length,
      },
      rows: rows.map((r) => ({
        id: r.id,
        name: name(r.patients),
        sid: r.patients.patient_id,
        by: r.respondent_name || 'Caregiver',
        rel: r.respondent_relationship || '',
        date: r.submitted_at || r.created_at,
        status: r.status,
        flag: r.flagged,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/reports', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('assessment_reports')
      .select('id, title, status, completeness, report_type, updated_at, patients(first_name, middle_name, last_name, patient_id, clinic_id)')
      .eq('report_type', 'behavioral')
      .order('updated_at', { ascending: false });
    if (error) return next(error);
    const rows = inClinic(data, req.profile.clinic_id);
    res.json({
      summary: {
        inProgress: rows.filter((r) => ['draft', 'in_progress'].includes(r.status)).length,
        readyForReview: rows.filter((r) => r.status === 'ready_for_review').length,
      },
      drafts: rows.map((r) => ({
        id: r.id,
        name: name(r.patients),
        sid: r.patients.patient_id,
        status: r.status,
        completeness: r.completeness,
        updated_at: r.updated_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/activity-logs', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('session_logs')
      .select('id, session_number, session_date, activity_title, status, patients(first_name, middle_name, last_name, clinic_id)')
      .order('session_date', { ascending: false });
    if (error) return next(error);
    res.json({
      rows: inClinic(data, req.profile.clinic_id).map((r) => ({
        id: r.id,
        name: name(r.patients),
        date: r.session_date,
        session_number: r.session_number,
        detail: r.activity_title,
        status: r.status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// assign an assessment template to a patient (surfaces in the client portal)
router.post('/assignments', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, template_id, due_date } = req.body || {};
    if (!patient_id || !template_id) {
      return res.status(400).json({ error: 'patient_id and template_id are required' });
    }
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id, caregiver_id, first_name')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const { data, error } = await supabase
      .from('assessment_assignments')
      .insert({
        patient_id,
        template_id,
        assigned_by_id: req.profile.id,
        status: 'assigned',
        due_date: due_date || null,
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    const { data: tpl } = await supabase
      .from('assessment_templates')
      .select('title')
      .eq('id', template_id)
      .maybeSingle();
    await createNotification({
      clinicId: pt.clinic_id,
      recipientId: pt.caregiver_id,
      type: 'assessment',
      title: 'New assessment assigned',
      body: `${tpl?.title || 'An assessment'} has been assigned for ${pt.first_name}.`,
      link: '/client/assessments',
    });
    res.status(201).json({ assignment: data });
  } catch (err) {
    next(err);
  }
});

// mark a caregiver submission processed / flagged
router.patch('/submissions/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { status, flagged } = req.body || {};
    const { data: sub } = await supabase
      .from('assessment_submissions')
      .select('id, patients(clinic_id)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!sub || !sub.patients || sub.patients.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    const upd = {};
    if (status !== undefined) {
      if (!['submitted', 'processed', 'scored', 'flagged', 'draft'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      upd.status = status;
      if (status === 'processed') upd.processed_by_id = req.profile.id;
    }
    if (flagged !== undefined) upd.flagged = Boolean(flagged);
    if (!Object.keys(upd).length) return res.status(400).json({ error: 'Nothing to update' });
    const { error } = await supabase.from('assessment_submissions').update(upd).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// update a report draft / submit it for psychologist review
router.patch('/reports/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { status, completeness } = req.body || {};
    const { data: rep } = await supabase
      .from('assessment_reports')
      .select('id, patients(clinic_id)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!rep || !rep.patients || rep.patients.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const upd = { prepared_by_id: req.profile.id };
    if (status !== undefined) {
      if (!['draft', 'in_progress', 'ready_for_review'].includes(status)) {
        return res.status(400).json({ error: 'A psychometrician can only set draft, in_progress, or ready_for_review' });
      }
      upd.status = status;
    }
    if (completeness !== undefined) {
      upd.completeness = Math.max(0, Math.min(100, Number(completeness) || 0));
    }
    const { error } = await supabase.from('assessment_reports').update(upd).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
