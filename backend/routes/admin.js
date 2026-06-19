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

// list registered employees (staff + admins) for the clinic
router.get('/employees', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, role, avatar_url, created_at, admin_profiles(employee_id, position), staff(license_no, title)')
      .eq('clinic_id', req.profile.clinic_id)
      .neq('role', 'client')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) return next(error);
    const one = (x) => (Array.isArray(x) ? x[0] : x) || {};
    res.json({
      employees: (data || []).map((p) => {
        const ap = one(p.admin_profiles);
        const st = one(p.staff);
        return {
          id: p.id,
          name: p.display_name,
          email: p.email,
          role: p.role,
          avatar_url: p.avatar_url,
          created_at: p.created_at,
          credential: p.role === 'admin' ? ap.employee_id : st.license_no,
          title: p.role === 'admin' ? ap.position : st.title,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// register a new employee (clinician / therapist / admin)
const STAFF_ROLES = ['psychologist', 'psychometrician', 'occupational_therapist', 'speech_therapist'];

router.post('/employees', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { email, password, display_name, role, phone, employee_id, position, license_no, title, avatar } =
      req.body || {};

    if (!email || !password || !display_name || !role) {
      return res.status(400).json({ error: 'Email, password, full name, and role are required' });
    }
    if (![...STAFF_ROLES, 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (role === 'admin' && !employee_id) {
      return res.status(400).json({ error: 'Employee ID is required for administrators' });
    }
    if (role === 'admin') {
      const { data: dupe } = await supabase
        .from('admin_profiles')
        .select('profile_id')
        .eq('employee_id', employee_id)
        .maybeSingle();
      if (dupe) return res.status(409).json({ error: 'That Employee ID is already in use' });
    }

    // creating the auth user fires handle_new_user(), which inserts the profiles row
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, display_name },
    });
    if (createErr) return res.status(400).json({ error: createErr.message });
    const userId = created.user.id;

    let avatar_url = null;
    const m = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/.exec(avatar || '');
    if (m) {
      const ext = m[2] === 'jpeg' || m[2] === 'jpg' ? 'jpg' : m[2];
      const buffer = Buffer.from(m[3], 'base64');
      if (buffer.length <= 5 * 1024 * 1024) {
        const path = `avatars/${userId}/${require('crypto').randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('photos')
          .upload(path, buffer, { contentType: m[1], upsert: true });
        if (!upErr) avatar_url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
      }
    }

    await supabase
      .from('profiles')
      .update({ phone: phone || null, ...(avatar_url ? { avatar_url } : {}) })
      .eq('id', userId);

    if (role === 'admin') {
      const { error } = await supabase
        .from('admin_profiles')
        .insert({ profile_id: userId, employee_id, position: position || null });
      if (error) return res.status(400).json({ error: error.message });
    } else {
      const { error } = await supabase
        .from('staff')
        .insert({ profile_id: userId, license_no: license_no || null, title: title || null });
      if (error) return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ id: userId, email, role, avatar_url });
  } catch (err) {
    next(err);
  }
});

// activate / deactivate an employee (soft-delete + ban from signing in)
router.patch('/employees/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { active } = req.body || {};
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active (boolean) is required' });
    }
    if (req.params.id === req.profile.id) {
      return res.status(400).json({ error: 'You cannot change your own account here' });
    }
    const { data: emp } = await supabase
      .from('profiles')
      .select('id, role, clinic_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!emp || emp.clinic_id !== req.profile.clinic_id || emp.role === 'client') {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: active ? null : new Date().toISOString() })
      .eq('id', emp.id);
    if (error) return res.status(400).json({ error: error.message });
    // block / restore their ability to sign in
    await supabase.auth.admin.updateUserById(emp.id, { ban_duration: active ? 'none' : '876000h' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
