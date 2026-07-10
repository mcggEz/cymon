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
    const mine = [req.profile.role, ...(req.profile.extra_roles || [])];
    if (!mine.some((r) => roles.includes(r))) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

router.use(requireAuth, requireRole('psychometrician', 'speech_therapist', 'admin'));

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
      supabase.from('assessment_templates').select('id, document_type_code, title, est_minutes, icon, is_active, document_types(description)').order('title', { ascending: true }),
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
        active: t.is_active,
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
    const [{ data, error }, { data: roster }] = await Promise.all([
      supabase
        .from('session_logs')
        .select('id, session_number, session_date, activity_title, status, patients(first_name, middle_name, last_name, clinic_id)')
        .order('session_date', { ascending: false }),
      supabase
        .from('patients')
        .select('id, first_name, middle_name, last_name')
        .eq('clinic_id', req.profile.clinic_id)
        .is('deleted_at', null)
        .order('first_name', { ascending: true }),
    ]);
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
      patients: (roster || []).map((p) => ({ id: p.id, name: patientName(p) })),
    });
  } catch (err) {
    next(err);
  }
});

// create a session activity log (FO-07)
router.post('/activity-logs', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, session_number, session_date, activity_title, target_domain, objectives, procedure, observations, status } =
      req.body || {};
    if (!patient_id || !activity_title) {
      return res.status(400).json({ error: 'Patient and activity title are required' });
    }
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const safeStatus = ['draft', 'pending'].includes(status) ? status : 'draft';
    const { data, error } = await supabase
      .from('session_logs')
      .insert({
        patient_id,
        author_id: req.profile.id,
        session_number: session_number ? Number(session_number) : null,
        session_date: session_date || undefined,
        activity_title,
        target_domain: target_domain || null,
        objectives: objectives || null,
        procedure: procedure || null,
        observations: observations || null,
        status: safeStatus,
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ log: data });
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

// request that Admin activate (make available) an assessment template (feature #11)
router.post('/assessment-requests', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { template_id, note } = req.body || {};
    if (!template_id) return res.status(400).json({ error: 'template_id is required' });

    const { data: tpl } = await supabase
      .from('assessment_templates')
      .select('id, title, is_active')
      .eq('id', template_id)
      .maybeSingle();
    if (!tpl) return res.status(404).json({ error: 'Assessment not found' });
    if (tpl.is_active) return res.status(409).json({ error: 'That assessment is already available' });

    const { data: existing } = await supabase
      .from('assessment_activation_requests')
      .select('id')
      .eq('template_id', template_id)
      .eq('clinic_id', req.profile.clinic_id)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing) return res.status(409).json({ error: 'A request for this assessment is already pending' });

    const { data, error } = await supabase
      .from('assessment_activation_requests')
      .insert({
        clinic_id: req.profile.clinic_id,
        template_id,
        requested_by_id: req.profile.id,
        note: note || null,
        status: 'pending',
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('clinic_id', req.profile.clinic_id)
      .eq('role', 'admin')
      .is('deleted_at', null);
    await Promise.all(
      (admins || []).map((a) =>
        createNotification({
          clinicId: req.profile.clinic_id,
          recipientId: a.id,
          type: 'assessment',
          title: 'Assessment activation requested',
          body: `${req.profile.display_name || 'A professional'} requested that ${tpl.title} be made available.`,
          link: '/admin/assessments',
        }),
      ),
    );
    res.status(201).json({ request: data });
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
