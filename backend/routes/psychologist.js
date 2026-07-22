const express = require('express');
const { supabase, supabaseConfigured } = require('../lib/supabase');
const { createNotification } = require('../lib/notify');
const { patientName } = require('../lib/names');
const { localPermissionsStore } = require('../lib/permissions');
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

router.use(requireAuth, requireRole('psychologist', 'speech_therapist', 'occupational_therapist', 'admin', 'psychometrician'));

const name = patientName;
const inClinic = (rows, clinic) => (rows || []).filter((r) => r.patients && r.patients.clinic_id === clinic);
const PRIORITY_LABEL = { high: 'High Priority', normal: 'Medium Priority', low: 'Low Priority' };

router.get('/approvals', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('assessment_reports')
      .select('id, patient_id, title, document_type_code, report_type, priority, created_at, patients(id, first_name, middle_name, last_name, clinic_id)')
      .eq('status', 'ready_for_review')
      .neq('report_type', 'behavioral')
      .order('created_at', { ascending: false });
    if (error) return next(error);

    let perms = [];
    try {
      const { data: dbPerms, error: dbErr } = await supabase
        .from('assessment_permissions')
        .select('id, patient_id, template_id, status, created_at, requested_by_id, patients(id, first_name, last_name), profiles!requested_by_id(display_name), assessment_templates(title, document_type_code)')
        .eq('clinic_id', req.profile.clinic_id)
        .eq('status', 'pending');
      if (dbErr) throw dbErr;
      perms = dbPerms || [];
    } catch (dbErr) {
      if (dbErr.code === 'PGRST205' || dbErr.message?.includes('assessment_permissions')) {
        console.warn('[db] falling back to local memory store for approvals');
        const pending = Array.from(localPermissionsStore.values()).filter(p => p.clinic_id === req.profile.clinic_id && p.status === 'pending');
        const patientIds = pending.map(p => p.patient_id);
        const requesterIds = pending.map(p => p.requested_by_id);
        const templateIds = pending.map(p => p.template_id);
        
        const [{ data: pts }, { data: reqs }, { data: tpls }] = await Promise.all([
          supabase.from('patients').select('id, first_name, last_name').in('id', patientIds),
          supabase.from('profiles').select('id, display_name').in('id', requesterIds),
          supabase.from('assessment_templates').select('id, title, document_type_code').in('id', templateIds)
        ]);
        
        perms = pending.map(p => {
          const patient = (pts || []).find(pt => pt.id === p.patient_id);
          const requester = (reqs || []).find(r => r.id === p.requested_by_id);
          const template = (tpls || []).find(t => t.id === p.template_id);
          return {
            id: p.id,
            patient_id: p.patient_id,
            template_id: p.template_id,
            status: p.status,
            created_at: p.created_at || new Date().toISOString(),
            patients: patient ? { first_name: patient.first_name, last_name: patient.last_name } : null,
            profiles: requester ? { display_name: requester.display_name } : null,
            assessment_templates: template ? { title: template.title, document_type_code: template.document_type_code } : null
          };
        });
      } else {
        throw dbErr;
      }
    }

    res.json({
      reports: inClinic(data, req.profile.clinic_id).map((r) => ({
        id: r.id,
        patient_id: r.patient_id,
        name: name(r.patients),
        type: `${r.title}${r.document_type_code ? ` (${r.document_type_code.replace('CMPS:SE-', '')})` : ''}`,
        date: r.created_at,
        priority: PRIORITY_LABEL[r.priority] || 'Medium Priority',
      })),
      permissions: perms.map((p) => ({
        id: p.id,
        patient_id: p.patient_id,
        template_id: p.template_id,
        student_name: p.patients ? `${p.patients.first_name} ${p.patients.last_name}` : 'Student',
        assessment_name: p.assessment_templates ? `${p.assessment_templates.title} (${p.assessment_templates.document_type_code})` : 'Standard Test',
        requested_by: p.profiles?.display_name || 'Psychometrician',
        date: p.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/assessments/grant-permission', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, template_id, status } = req.body || {}; // status: 'granted' or 'none' (for decline/revoke)
    if (!patient_id || !template_id || !status) return res.status(400).json({ error: 'patient_id, template_id and status are required' });
    if (!['granted', 'none'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    try {
      const { data, error } = await supabase
        .from('assessment_permissions')
        .upsert({
          clinic_id: req.profile.clinic_id,
          patient_id,
          template_id,
          status,
          granted_by_id: status === 'granted' ? req.profile.id : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'clinic_id,patient_id,template_id' })
        .select('*')
        .single();
      if (error) throw error;
      res.json({ permission: data });
    } catch (dbErr) {
      if (dbErr.code === 'PGRST205' || dbErr.message?.includes('assessment_permissions')) {
        console.warn('[db] falling back to local memory store to grant permission');
        const key = `${patient_id}_${template_id}`;
        const existing = localPermissionsStore.get(key) || {
          id: require('crypto').randomUUID(),
          clinic_id: req.profile.clinic_id,
          patient_id,
          template_id,
        };
        const updated = {
          ...existing,
          status,
          granted_by_id: status === 'granted' ? req.profile.id : null,
        };
        localPermissionsStore.set(key, updated);
        res.json({ permission: updated });
      } else {
        throw dbErr;
      }
    }
  } catch (err) {
    next(err);
  }
});

router.patch('/journal-permission', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, allow_journal_entry } = req.body || {};
    if (!patient_id || typeof allow_journal_entry !== 'boolean') {
      return res.status(400).json({ error: 'patient_id and allow_journal_entry boolean are required' });
    }
    const { data, error } = await supabase
      .from('patients')
      .update({ allow_journal_entry })
      .eq('id', patient_id)
      .eq('clinic_id', req.profile.clinic_id)
      .select('id, patient_id, first_name, last_name, allow_journal_entry')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Patient not found' });
    res.json({ patient: data });
  } catch (err) {
    next(err);
  }
});

router.get('/roster', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, middle_name, last_name, allow_journal_entry, clinical_profiles(support_level, milestone_progress, chief_complaint, working_diagnosis, updated_at)')
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
          allow_journal_entry: p.allow_journal_entry || false,
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
    .select('id, first_name, middle_name, last_name, allow_journal_entry')
    .eq('clinic_id', clinicId)
    .is('deleted_at', null)
    .order('first_name', { ascending: true });
  return (data || []).map((p) => ({ id: p.id, name: patientName(p), allow_journal_entry: p.allow_journal_entry || false }));
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
        .select('id, patient_id, title, period, trend, status, patients(first_name, middle_name, last_name, clinic_id)')
        .eq('report_type', 'progress_summary')
        .order('created_at', { ascending: false }),
      clinicPatients(req.profile.clinic_id),
    ]);
    if (error) return next(error);
    res.json({
      items: inClinic(data, req.profile.clinic_id).map((r) => ({
        id: r.id,
        patient_id: r.patient_id,
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

// generate or update a progress-summary report (FO-08) draft
router.post('/progress', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { id, patient_id, title, period, trend, status } = req.body || {};
    if (!patient_id || !title) return res.status(400).json({ error: 'Patient and title are required' });
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    let result;
    if (id) {
      const { data, error } = await supabase
        .from('assessment_reports')
        .update({
          patient_id,
          title,
          period: period || null,
          trend: trend || null,
          status: status || 'draft',
        })
        .eq('id', id)
        .select('id')
        .single();
      if (error) return res.status(400).json({ error: error.message });
      result = data;
    } else {
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
      result = data;
    }
    res.status(201).json({ report: result });
  } catch (err) {
    next(err);
  }
});

// approve or request a revision on a report routed to the psychologist
router.patch('/reports/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    if (req.profile.role !== 'psychologist') {
      return res.status(403).json({ error: 'Only psychologists are allowed to sign or approve finalized reports.' });
    }
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
