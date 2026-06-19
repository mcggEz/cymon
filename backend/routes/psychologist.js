const express = require('express');
const { supabase, supabaseConfigured } = require('../lib/supabase');
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

const name = (p) => (p ? `${p.first_name} ${p.last_name}` : '—');
const inClinic = (rows, clinic) => (rows || []).filter((r) => r.patients && r.patients.clinic_id === clinic);
const PRIORITY_LABEL = { high: 'High Priority', normal: 'Medium Priority', low: 'Low Priority' };

router.get('/approvals', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('assessment_reports')
      .select('id, title, document_type_code, report_type, priority, created_at, patients(first_name, last_name, clinic_id)')
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
      .select('id, first_name, last_name, clinical_profiles(support_level, milestone_progress, updated_at)')
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .order('first_name', { ascending: true });
    if (error) return next(error);
    res.json({
      clients: (data || []).map((p) => {
        const cp = p.clinical_profiles || {};
        return {
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          level: cp.support_level || '—',
          progress: cp.milestone_progress || 0,
          updated: cp.updated_at,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/mainstreaming', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('mainstreaming_assessments')
      .select('id, readiness_score, status, evaluated_on, patients(first_name, last_name, clinic_id, clinical_profiles(support_level))')
      .order('evaluated_on', { ascending: false });
    if (error) return next(error);
    res.json({
      students: inClinic(data, req.profile.clinic_id).map((m) => ({
        id: m.id,
        name: name(m.patients),
        level: m.patients.clinical_profiles?.support_level || '—',
        score: m.readiness_score,
        status: m.status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/interventions', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('interventions')
      .select('id, title, plan_date, procedure_count, status, patients(first_name, last_name, clinic_id)')
      .order('plan_date', { ascending: false });
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
    });
  } catch (err) {
    next(err);
  }
});

router.get('/progress', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('assessment_reports')
      .select('id, title, period, trend, status, patients(first_name, last_name, clinic_id)')
      .eq('report_type', 'progress_summary')
      .order('created_at', { ascending: false });
    if (error) return next(error);
    res.json({
      items: inClinic(data, req.profile.clinic_id).map((r) => ({
        id: r.id,
        name: name(r.patients),
        period: r.period,
        trend: r.trend,
        status: r.status,
      })),
    });
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
      .select('id, patients(clinic_id)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!rep || !rep.patients || rep.patients.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const upd = { status, noted_by_id: req.profile.id };
    if (status === 'approved') upd.finalized_at = new Date().toISOString();
    const { error } = await supabase.from('assessment_reports').update(upd).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
