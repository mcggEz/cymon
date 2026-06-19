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

function requireClient(req, res, next) {
  if (req.profile.role !== 'client') {
    return res.status(403).json({ error: 'Client account required' });
  }
  next();
}

function ageFromDob(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

async function staffName(id) {
  if (!id) return null;
  const { data } = await supabase.from('profiles').select('display_name').eq('id', id).single();
  return data ? data.display_name : null;
}

// The caregiver's enrolled child plus clinical, guardian, emergency, clinic.
router.get('/patient', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('caregiver_id', req.profile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) return next(error);
    if (!patient) return res.status(404).json({ error: 'No enrolled child yet' });

    const [{ data: clinical }, { data: guardian }, { data: emergency }, { data: clinic }] =
      await Promise.all([
        supabase.from('clinical_profiles').select('*').eq('patient_id', patient.id).maybeSingle(),
        supabase
          .from('guardians')
          .select('*')
          .eq('patient_id', patient.id)
          .order('is_primary', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('emergency_contacts')
          .select('*')
          .eq('patient_id', patient.id)
          .limit(1)
          .maybeSingle(),
        supabase.from('clinics').select('name, address, phone, email').eq('id', patient.clinic_id).single(),
      ]);

    const [psychologistName, psychometricianName] = await Promise.all([
      staffName(clinical?.treating_psychologist_id),
      staffName(clinical?.treating_psychometrician_id),
    ]);

    res.json({
      patient: {
        ...patient,
        full_name: [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(' '),
        age: ageFromDob(patient.date_of_birth),
      },
      clinical: clinical
        ? { ...clinical, treating_psychologist_name: psychologistName, treating_psychometrician_name: psychometricianName }
        : null,
      guardian: guardian || null,
      emergency: emergency || null,
      clinic: clinic || null,
    });
  } catch (err) {
    next(err);
  }
});

// Enroll the caregiver's child (the 3-step setup wizard). One patient per caregiver for now.
router.post('/patient', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient = {}, clinical = {}, guardian = {}, emergency = {} } = req.body || {};

    if (!patient.first_name || !patient.last_name) {
      return res.status(400).json({ error: 'Child first and last name are required' });
    }
    if (!patient.date_of_birth || !patient.sex) {
      return res.status(400).json({ error: 'Child date of birth and sex are required' });
    }

    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('caregiver_id', req.profile.id)
      .is('deleted_at', null)
      .maybeSingle();
    if (existing) {
      return res.status(409).json({ error: 'This account already has an enrolled child' });
    }

    const { data: created, error } = await supabase
      .from('patients')
      .insert({
        clinic_id: req.profile.clinic_id,
        caregiver_id: req.profile.id,
        first_name: patient.first_name,
        middle_name: patient.middle_name || null,
        last_name: patient.last_name,
        nick_name: patient.nick_name || null,
        date_of_birth: patient.date_of_birth,
        sex: patient.sex,
        nationality: patient.nationality || null,
        preferred_language: patient.preferred_language || null,
        school: patient.school || null,
        grade_level: patient.grade_level || null,
        home_address: patient.home_address || null,
        contact_number: patient.contact_number || null,
      })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    await Promise.all([
      supabase.from('clinical_profiles').insert({
        patient_id: created.id,
        primary_diagnosis: clinical.primary_diagnosis || null,
        iep_level: clinical.iep_level || null,
        secondary_diagnosis: clinical.secondary_diagnosis || null,
        date_enrolled: clinical.date_enrolled || null,
        referral_source: clinical.referral_source || null,
      }),
      guardian.full_name
        ? supabase.from('guardians').insert({
            patient_id: created.id,
            full_name: guardian.full_name,
            relationship: guardian.relationship || null,
            contact_number: guardian.contact_number || null,
            email: guardian.email || null,
            occupation: guardian.occupation || null,
            employer: guardian.employer || null,
            is_primary: true,
          })
        : Promise.resolve(),
      emergency.full_name
        ? supabase.from('emergency_contacts').insert({
            patient_id: created.id,
            full_name: emergency.full_name,
            relationship: emergency.relationship || null,
            contact_number: emergency.contact_number || null,
            alt_contact_number: emergency.alt_contact_number || null,
            address: emergency.address || null,
          })
        : Promise.resolve(),
    ]);

    res.status(201).json({ patient: created });
  } catch (err) {
    next(err);
  }
});

// ---------- shared: the caregiver's enrolled child ----------

async function caregiverPatient(profileId) {
  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('caregiver_id', profileId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

const MOOD_SCORE = { very_bad: 1, sad: 2, okay: 3, good: 4, great: 5 };

async function requirePatient(req, res) {
  const patient = await caregiverPatient(req.profile.id);
  if (!patient) {
    res.status(404).json({ error: 'No enrolled child yet' });
    return null;
  }
  return patient;
}

// ---------- home aggregate ----------

router.get('/home', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;

    const [{ data: clinical }, { data: logs }, { count: cbiCount }, { count: goalsMet }, { data: nextAppt }, { data: announcements }, { count: assignedCount }] =
      await Promise.all([
        supabase.from('clinical_profiles').select('*').eq('patient_id', patient.id).maybeSingle(),
        supabase
          .from('daily_activity_logs')
          .select('log_date, mood')
          .eq('patient_id', patient.id)
          .order('log_date', { ascending: false })
          .limit(7),
        supabase.from('daily_activity_logs').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id),
        supabase.from('interventions').select('*', { count: 'exact', head: true }).eq('patient_id', patient.id).eq('status', 'completed'),
        supabase
          .from('appointments')
          .select('starts_at, session_type, practitioner_id, location')
          .eq('patient_id', patient.id)
          .order('starts_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('announcements')
          .select('id, title, publish_date')
          .eq('clinic_id', patient.clinic_id)
          .is('deleted_at', null)
          .order('publish_date', { ascending: false })
          .limit(3),
        supabase
          .from('assessment_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.id)
          .in('status', ['assigned', 'in_progress']),
      ]);

    const moodSeries = (logs || []).slice().reverse().map((l) => MOOD_SCORE[l.mood] || 0);
    const avgMood = moodSeries.length
      ? Number((moodSeries.reduce((a, b) => a + b, 0) / moodSeries.length).toFixed(1))
      : null;
    const practitionerName = nextAppt ? await staffName(nextAppt.practitioner_id) : null;
    const clinicianName = await staffName(clinical?.treating_psychologist_id);

    res.json({
      patient: { first_name: patient.first_name, full_name: [patient.first_name, patient.last_name].filter(Boolean).join(' ') },
      clinical: clinical
        ? {
            iep_level: clinical.iep_level,
            support_level: clinical.support_level,
            milestone_progress: clinical.milestone_progress,
            next_review_at: clinical.next_review_at,
            notes: clinical.notes,
            clinician_name: clinicianName,
            updated_at: clinical.updated_at,
          }
        : null,
      stats: {
        cbiSubmissions: cbiCount || 0,
        iepGoalsMet: goalsMet || 0,
        avgMood,
        assignedAssessments: assignedCount || 0,
      },
      moodSeries,
      nextAppointment: nextAppt
        ? { starts_at: nextAppt.starts_at, session_type: nextAppt.session_type, practitioner: practitionerName, location: nextAppt.location }
        : null,
      announcements: announcements || [],
    });
  } catch (err) {
    next(err);
  }
});

// ---------- daily activity logs ----------

router.get('/activity-logs', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { data, error } = await supabase
      .from('daily_activity_logs')
      .select('id, log_date, mood, task_completion, behavioral_episodes, sleep_quality, appetite, observations')
      .eq('patient_id', patient.id)
      .order('log_date', { ascending: false })
      .limit(14);
    if (error) return next(error);
    const recent = (data || []).slice(0, 7);
    const series = (data || []).slice(0, 7).slice().reverse().map((l) => ({ date: l.log_date, score: MOOD_SCORE[l.mood] || 0 }));
    res.json({ logs: recent, moodSeries: series });
  } catch (err) {
    next(err);
  }
});

router.post('/activity-logs', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { mood, task_completion, behavioral_episodes, sleep_quality, appetite, observations, log_date } = req.body || {};
    if (!mood) return res.status(400).json({ error: 'Mood is required' });
    const { data, error } = await supabase
      .from('daily_activity_logs')
      .upsert(
        {
          patient_id: patient.id,
          log_date: log_date || new Date().toISOString().slice(0, 10),
          mood,
          task_completion: task_completion || null,
          behavioral_episodes: behavioral_episodes || null,
          sleep_quality: sleep_quality || null,
          appetite: appetite || null,
          observations: observations || null,
          submitted_by_id: req.profile.id,
        },
        { onConflict: 'patient_id,log_date' }
      )
      .select('id, log_date, mood')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ log: data });
  } catch (err) {
    next(err);
  }
});

// ---------- appointments ----------

router.get('/appointments', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const [{ data: rows, error }, { data: clinic }] = await Promise.all([
      supabase
        .from('appointments')
        .select('id, starts_at, session_type, location, practitioner_id, status')
        .eq('patient_id', patient.id)
        .order('starts_at', { ascending: true }),
      supabase.from('clinics').select('name, address, phone, email').eq('id', patient.clinic_id).single(),
    ]);
    if (error) return next(error);
    const practIds = [...new Set((rows || []).map((r) => r.practitioner_id).filter(Boolean))];
    const { data: pracs } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', practIds.length ? practIds : ['00000000-0000-0000-0000-000000000000']);
    const nameById = Object.fromEntries((pracs || []).map((p) => [p.id, p.display_name]));
    res.json({
      appointments: (rows || []).map((r) => ({
        id: r.id,
        starts_at: r.starts_at,
        session_type: r.session_type,
        location: r.location,
        status: r.status,
        practitioner: nameById[r.practitioner_id] || null,
      })),
      clinic: clinic || null,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- announcements ----------

router.get('/announcements', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, type, body, publish_date, image_url')
      .eq('clinic_id', patient.clinic_id)
      .is('deleted_at', null)
      .order('publish_date', { ascending: false });
    if (error) return next(error);
    const all = data || [];
    res.json({
      messages: all.filter((a) => a.type !== 'event'),
      events: all.filter((a) => a.type === 'event'),
    });
  } catch (err) {
    next(err);
  }
});

// ---------- waivers ----------

router.get('/waivers', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const [{ data: types, error }, { data: subs }] = await Promise.all([
      supabase
        .from('document_types')
        .select('code, title, description, category')
        .in('category', ['admission', 'waiver'])
        .order('code', { ascending: true }),
      supabase.from('waiver_submissions').select('document_type_code, status').eq('patient_id', patient.id),
    ]);
    if (error) return next(error);
    const statusByCode = Object.fromEntries((subs || []).map((s) => [s.document_type_code, s.status]));
    res.json({
      forms: (types || []).map((t) => ({
        code: t.code,
        title: t.title,
        description: t.description,
        category: t.category,
        status: statusByCode[t.code] || 'not_started',
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/waivers/:code', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { provisions_agreed, house_rules_agreed, signature_text } = req.body || {};
    const { data, error } = await supabase
      .from('waiver_submissions')
      .upsert(
        {
          patient_id: patient.id,
          document_type_code: req.params.code,
          provisions_agreed: provisions_agreed || {},
          house_rules_agreed: Boolean(house_rules_agreed),
          signature_text: signature_text || null,
          signed_by_profile_id: req.profile.id,
          signed_at: new Date().toISOString(),
          status: 'submitted',
        },
        { onConflict: 'id' }
      )
      .select('id, document_type_code, status')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ submission: data });
  } catch (err) {
    next(err);
  }
});

// ---------- assessments ----------

router.get('/assessments', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const [{ data: assignments }, { data: submissions }, { data: templates }] = await Promise.all([
      supabase
        .from('assessment_assignments')
        .select('id, template_id, status, due_date, assigned_by_id')
        .eq('patient_id', patient.id)
        .in('status', ['assigned', 'in_progress']),
      supabase
        .from('assessment_submissions')
        .select('id, template_id, status, total_score, max_score, answers, submitted_at, created_at')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false }),
      supabase.from('assessment_templates').select('id, title, icon, document_type_code, structure, est_minutes'),
    ]);
    const tplById = Object.fromEntries((templates || []).map((t) => [t.id, t]));
    res.json({
      assigned: (assignments || []).map((a) => {
        const t = tplById[a.template_id] || {};
        return { id: a.id, template_id: a.template_id, title: t.title, code: t.document_type_code, icon: t.icon, status: a.status, due_date: a.due_date };
      }),
      records: (submissions || []).map((s) => {
        const t = tplById[s.template_id] || {};
        return {
          id: s.id,
          template_id: s.template_id,
          title: t.title,
          icon: t.icon,
          status: s.status,
          total_score: s.total_score,
          max_score: s.max_score,
          submitted_at: s.submitted_at || s.created_at,
          answers: s.answers,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/assessments/:templateId', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { data: template, error } = await supabase
      .from('assessment_templates')
      .select('id, title, document_type_code, structure, max_score')
      .eq('id', req.params.templateId)
      .maybeSingle();
    if (error) return next(error);
    if (!template) return res.status(404).json({ error: 'Assessment not found' });
    res.json({ template });
  } catch (err) {
    next(err);
  }
});

router.post('/assessments/:templateId/submit', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { answers = {}, domain_scores = {}, total_score, max_score, respondent_name, respondent_relationship } = req.body || {};
    const { data, error } = await supabase
      .from('assessment_submissions')
      .insert({
        patient_id: patient.id,
        template_id: req.params.templateId,
        respondent_profile_id: req.profile.id,
        respondent_name: respondent_name || req.profile.display_name,
        respondent_relationship: respondent_relationship || null,
        answers,
        domain_scores,
        total_score: total_score ?? null,
        max_score: max_score ?? null,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select('id, status')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    // flip any matching assignment to submitted
    await supabase
      .from('assessment_assignments')
      .update({ status: 'submitted' })
      .eq('patient_id', patient.id)
      .eq('template_id', req.params.templateId)
      .in('status', ['assigned', 'in_progress']);
    res.status(201).json({ submission: data });
  } catch (err) {
    next(err);
  }
});

// update the caregiver's child (edit profile)
router.patch('/patient', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { patient: p = {}, guardian: g = {}, emergency: e = {} } = req.body || {};

    if (p.first_name === '' || p.last_name === '') {
      return res.status(400).json({ error: 'First and last name cannot be empty' });
    }

    const patientFields = [
      'first_name', 'middle_name', 'last_name', 'nick_name', 'date_of_birth', 'sex',
      'blood_type', 'nationality', 'preferred_language', 'school', 'grade_level',
      'home_address', 'contact_number',
    ];
    const required = new Set(['first_name', 'last_name', 'date_of_birth', 'sex']);
    const patientUpdate = {};
    for (const k of patientFields) {
      if (p[k] === undefined) continue;
      patientUpdate[k] = p[k] === '' && !required.has(k) ? null : p[k];
    }
    if (Object.keys(patientUpdate).length) {
      const { error } = await supabase.from('patients').update(patientUpdate).eq('id', patient.id);
      if (error) return res.status(400).json({ error: error.message });
    }

    if (Object.keys(g).length) {
      const upd = {};
      for (const k of ['full_name', 'relationship', 'contact_number', 'email', 'occupation', 'employer']) {
        if (g[k] !== undefined) upd[k] = g[k] === '' ? null : g[k];
      }
      const { data: existing } = await supabase
        .from('guardians')
        .select('id')
        .eq('patient_id', patient.id)
        .order('is_primary', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) {
        await supabase.from('guardians').update(upd).eq('id', existing.id);
      } else if (upd.full_name) {
        await supabase.from('guardians').insert({ patient_id: patient.id, is_primary: true, ...upd });
      }
    }

    if (Object.keys(e).length) {
      const upd = {};
      for (const k of ['full_name', 'relationship', 'contact_number', 'alt_contact_number', 'address']) {
        if (e[k] !== undefined) upd[k] = e[k] === '' ? null : e[k];
      }
      const { data: existing } = await supabase
        .from('emergency_contacts')
        .select('id')
        .eq('patient_id', patient.id)
        .limit(1)
        .maybeSingle();
      if (existing) {
        await supabase.from('emergency_contacts').update(upd).eq('id', existing.id);
      } else if (upd.full_name) {
        await supabase.from('emergency_contacts').insert({ patient_id: patient.id, ...upd });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// upload / replace the child's photo
router.post('/patient/photo', requireAuth, requireClient, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const patient = await requirePatient(req, res);
    if (!patient) return;
    const { image } = req.body || {};
    const m = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/.exec(image || '');
    if (!m) {
      return res.status(400).json({ error: 'Provide a PNG, JPEG, or WEBP image' });
    }
    const contentType = m[1];
    const ext = m[2] === 'jpeg' || m[2] === 'jpg' ? 'jpg' : m[2];
    const buffer = Buffer.from(m[3], 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image must be under 5 MB' });
    }
    const path = `patients/${patient.id}/${require('crypto').randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('photos')
      .upload(path, buffer, { contentType, upsert: true });
    if (upErr) return res.status(400).json({ error: upErr.message });
    const { data: pub } = supabase.storage.from('photos').getPublicUrl(path);
    const photo_url = pub.publicUrl;
    const { error } = await supabase.from('patients').update({ photo_url }).eq('id', patient.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ photo_url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
