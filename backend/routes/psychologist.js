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

router.use(requireAuth, requireRole('psychologist', 'admin'));

const name = patientName;
const inClinic = (rows, clinic) => (rows || []).filter((r) => r.patients && r.patients.clinic_id === clinic);
const PRIORITY_LABEL = { high: 'High Priority', normal: 'Medium Priority', low: 'Low Priority' };

router.get('/approvals', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('assessment_reports')
      .select('id, title, document_type_code, report_type, priority, created_at, patients(first_name, middle_name, last_name, clinic_id)')
      .eq('status', 'ready_for_review')
      .order('created_at', { ascending: false });
    if (error) return next(error);
    res.json({
      reports: inClinic(data, req.profile.clinic_id).map((r) => ({
        id: r.id,
        name: name(r.patients),
        type: `${r.title}${r.document_type_code ? ` (${r.document_type_code.replace('CMPS:SE-', '')})` : ''}`,
        date: r.created_at,
        priority: PRIORITY_LABEL[r.priority] || 'Medium Priority',
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/roster', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, middle_name, last_name, clinical_profiles(support_level, milestone_progress, chief_complaint, working_diagnosis, updated_at)')
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .order('first_name', { ascending: true });
    if (error) return next(error);
    res.json({
      clients: (data || []).map((p) => {
        const cp = p.clinical_profiles || {};
        return {
          id: p.id,
          name: patientName(p),
          level: cp.support_level || '—',
          progress: cp.milestone_progress || 0,
          chief_complaint: cp.chief_complaint || '',
          working_diagnosis: cp.working_diagnosis || '',
          updated: cp.updated_at,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

async function clinicPatients(clinicId) {
  const { data } = await supabase
    .from('patients')
    .select('id, first_name, middle_name, last_name')
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .order('first_name', { ascending: true });
  return (data || []).map((p) => ({ id: p.id, name: patientName(p) }));
}

router.get('/mainstreaming', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [{ data, error }, patients] = await Promise.all([
      supabase
        .from('mainstreaming_assessments')
        .select('id, readiness_score, status, evaluated_on, patient_id, patients(first_name, middle_name, last_name, clinic_id, clinical_profiles(support_level))')
        .order('evaluated_on', { ascending: false }),
      clinicPatients(req.profile.clinic_id),
    ]);
    if (error) return next(error);
    res.json({
      students: inClinic(data, req.profile.clinic_id).map((m) => ({
        id: m.id,
        patient_id: m.patient_id,
        name: name(m.patients),
        level: m.patients.clinical_profiles?.support_level || '—',
        score: m.readiness_score,
        status: m.status,
      })),
      patients,
    });
  } catch (err) {
    next(err);
  }
});

// record a mainstreaming-readiness assessment
router.post('/mainstreaming', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, readiness_score, status, notes } = req.body || {};
    if (!patient_id) return res.status(400).json({ error: 'Patient is required' });
    if (status !== undefined && !['not_ready', 'approaching', 'ready'].includes(status)) {
      return res.status(400).json({ error: 'Status must be not_ready, approaching, or ready' });
    }
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const { data, error } = await supabase
      .from('mainstreaming_assessments')
      .insert({
        patient_id,
        evaluated_by_id: req.profile.id,
        readiness_score: readiness_score != null && readiness_score !== '' ? Number(readiness_score) : null,
        status: status || 'not_ready',
        notes: notes || null,
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ assessment: data });
  } catch (err) {
    next(err);
  }
});

router.get('/interventions', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [{ data, error }, patients] = await Promise.all([
      supabase
        .from('interventions')
        .select('id, title, plan_date, procedure_count, status, patients(first_name, middle_name, last_name, clinic_id)')
        .order('plan_date', { ascending: false }),
      clinicPatients(req.profile.clinic_id),
    ]);
    if (error) return next(error);
    res.json({
      items: inClinic(data, req.profile.clinic_id).map((i) => ({
        id: i.id,
        name: name(i.patients),
        title: i.title,
        date: i.plan_date,
        count: i.procedure_count,
        status: i.status,
      })),
      patients,
    });
  } catch (err) {
    next(err);
  }
});

// create an intervention plan
router.post('/interventions', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, title, plan_date, status, notes } = req.body || {};
    if (!patient_id || !title) return res.status(400).json({ error: 'Patient and title are required' });
    if (status !== undefined && !['planned', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be planned, in_progress, or completed' });
    }
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const { data, error } = await supabase
      .from('interventions')
      .insert({
        patient_id,
        author_id: req.profile.id,
        title,
        plan_date: plan_date || undefined,
        status: status || 'planned',
        notes: notes || null,
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ intervention: data });
  } catch (err) {
    next(err);
  }
});

router.get('/progress', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [{ data, error }, patients] = await Promise.all([
      supabase
        .from('assessment_reports')
        .select('id, title, period, trend, status, patients(first_name, middle_name, last_name, clinic_id)')
        .eq('report_type', 'progress_summary')
        .order('created_at', { ascending: false }),
      clinicPatients(req.profile.clinic_id),
    ]);
    if (error) return next(error);
    res.json({
      items: inClinic(data, req.profile.clinic_id).map((r) => ({
        id: r.id,
        name: name(r.patients),
        period: r.period,
        trend: r.trend,
        status: r.status,
      })),
      patients,
    });
  } catch (err) {
    next(err);
  }
});

// generate a progress-summary report (FO-08) draft
router.post('/progress', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, title, period, trend } = req.body || {};
    if (!patient_id || !title) return res.status(400).json({ error: 'Patient and title are required' });
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const { data, error } = await supabase
      .from('assessment_reports')
      .insert({
        patient_id,
        report_type: 'progress_summary',
        title,
        period: period || null,
        trend: trend || null,
        status: 'draft',
        prepared_by_id: req.profile.id,
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ report: data });
  } catch (err) {
    next(err);
  }
});

// approve or request a revision on a report routed to the psychologist
router.patch('/reports/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { status } = req.body || {};
    if (!['approved', 'revise_requested'].includes(status)) {
      return res.status(400).json({ error: 'A psychologist can approve or request a revision' });
    }
    const { data: rep } = await supabase
      .from('assessment_reports')
      .select('id, title, patients(clinic_id, caregiver_id, first_name)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!rep || !rep.patients || rep.patients.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const upd = { status, noted_by_id: req.profile.id };
    if (status === 'approved') upd.finalized_at = new Date().toISOString();
    const { error } = await supabase.from('assessment_reports').update(upd).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });

    if (status === 'approved') {
      await createNotification({
        clinicId: rep.patients.clinic_id,
        recipientId: rep.patients.caregiver_id,
        type: 'report',
        title: 'A report is ready',
        body: `${rep.title || 'A new report'} for ${rep.patients.first_name} has been approved and is now available.`,
        link: '/client/assessments',
      });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// update a client's roster classification (support level + milestone progress)
router.patch('/roster/:patientId', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { support_level, milestone_progress, chief_complaint, working_diagnosis } = req.body || {};
    if (support_level !== undefined && !['HSN', 'MSN', 'LSN'].includes(support_level)) {
      return res.status(400).json({ error: 'Support level must be HSN, MSN, or LSN' });
    }
    if (
      milestone_progress !== undefined &&
      (!Number.isInteger(milestone_progress) || milestone_progress < 0 || milestone_progress > 100)
    ) {
      return res.status(400).json({ error: 'Milestone progress must be a whole number between 0 and 100' });
    }
    if (
      support_level === undefined &&
      milestone_progress === undefined &&
      chief_complaint === undefined &&
      working_diagnosis === undefined
    ) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('id, clinic_id, caregiver_id, first_name')
      .eq('id', req.params.patientId)
      .maybeSingle();
    if (!patient || patient.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const upd = { patient_id: patient.id };
    if (support_level !== undefined) upd.support_level = support_level;
    if (milestone_progress !== undefined) upd.milestone_progress = milestone_progress;
    if (chief_complaint !== undefined) upd.chief_complaint = chief_complaint || null;
    if (working_diagnosis !== undefined) upd.working_diagnosis = working_diagnosis || null;
    const { error } = await supabase
      .from('clinical_profiles')
      .upsert(upd, { onConflict: 'patient_id' });
    if (error) return res.status(400).json({ error: error.message });

    await createNotification({
      clinicId: patient.clinic_id,
      recipientId: patient.caregiver_id,
      type: 'report',
      title: 'Progress updated',
      body: `${patient.first_name}'s support level and milestone progress were updated by your clinician.`,
      link: '/client/home',
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
