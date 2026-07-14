const express = require('express');
const { supabase, supabaseConfigured } = require('../lib/supabase');
const { createNotification } = require('../lib/notify');
const { patientName } = require('../lib/names');
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
  const mine = [req.profile.role, ...(req.profile.extra_roles || [])];
  if (!mine.includes('admin')) {
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
        name: patientName(p),
        first_name: p.first_name,
        middle_name: p.middle_name,
        last_name: p.last_name,
        date_of_birth: p.date_of_birth,
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

router.patch('/patients/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { first_name, middle_name, last_name, date_of_birth, sex, status } = req.body || {};
    const patch = {};
    if (first_name !== undefined) patch.first_name = first_name;
    if (middle_name !== undefined) patch.middle_name = middle_name || null;
    if (last_name !== undefined) patch.last_name = last_name;
    if (date_of_birth !== undefined) patch.date_of_birth = date_of_birth || null;
    if (sex !== undefined) patch.sex = sex;
    if (status !== undefined) {
      if (!['active', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      patch.status = status;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const { data, error } = await supabase
      .from('patients')
      .update(patch)
      .eq('id', req.params.id)
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Patient not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/patients/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: patient, error: getErr } = await supabase
      .from('patients')
      .select('id, patient_id, first_name, last_name')
      .eq('id', req.params.id)
      .eq('clinic_id', req.profile.clinic_id)
      .maybeSingle();

    if (getErr) return res.status(400).json({ error: getErr.message });
    if (!patient) return res.status(404).json({ error: 'Student not found' });

    const { error: delErr } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.params.id)
      .eq('clinic_id', req.profile.clinic_id);

    if (delErr) return res.status(400).json({ error: delErr.message });

    // Log this high severity event in the audit trail
    await supabase
      .from('audit_log')
      .insert({
        clinic_id: req.profile.clinic_id,
        actor_id: req.user.id,
        action: 'delete_patient',
        entity_type: 'patient',
        entity_id: patient.id,
        summary: `Permanently deleted student record for ${patient.first_name} ${patient.last_name} (ID: ${patient.patient_id})`,
        severity: 'high',
      })
      .catch(() => {});

    res.json({ ok: true });
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
        'id, due_date, status, document_type_code, patient_id, patients(first_name, middle_name, last_name, patient_id), document_types(title)'
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
          student: patientName(r.patients),
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

// remind the caregiver about a pending/overdue waiver
router.post('/compliance/:id/remind', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: w } = await supabase
      .from('waiver_submissions')
      .select('id, status, document_type_code, patients(caregiver_id, clinic_id, first_name), document_types(title)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!w || !w.patients || w.patients.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Compliance item not found' });
    }
    const docTitle = w.document_types ? w.document_types.title : w.document_type_code;
    await createNotification({
      clinicId: w.patients.clinic_id,
      recipientId: w.patients.caregiver_id,
      type: 'waiver',
      title: 'Document reminder',
      body: `${docTitle} for ${w.patients.first_name} is ${w.status === 'overdue' ? 'overdue' : 'awaiting your signature'}. Please complete it under Consents & Waivers.`,
      link: '/client/waivers',
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// mark a compliance item as processed (document received / submitted)
router.patch('/compliance/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: w } = await supabase
      .from('waiver_submissions')
      .select('id, patients(clinic_id)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!w || !w.patients || w.patients.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Compliance item not found' });
    }
    const { error } = await supabase
      .from('waiver_submissions')
      .update({ status: 'submitted' })
      .eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/schedule', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: rows, error } = await supabase
      .from('appointments')
      .select('id, starts_at, session_type, color_tag, location, practitioner_id, patients(first_name, middle_name, last_name)')
      .eq('clinic_id', req.profile.clinic_id)
      .order('starts_at', { ascending: true });
    if (error) return next(error);

    const practIds = [...new Set((rows || []).map((r) => r.practitioner_id).filter(Boolean))];
    const { data: pracs } = await supabase.from('profiles').select('id, display_name').in('id', practIds.length ? practIds : ['00000000-0000-0000-0000-000000000000']);
    const nameById = Object.fromEntries((pracs || []).map((p) => [p.id, p.display_name]));

    res.json({
      appointments: (rows || []).map((r) => ({
        id: r.id,
        patient: patientName(r.patients),
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
      .select('id, title, document_type_code, finalized_at, patients(first_name, middle_name, last_name), document_types(title)')
      .order('finalized_at', { ascending: false });
    if (error) return next(error);

    res.json({
      documents: (data || []).map((d) => ({
        id: d.id,
        name: patientName(d.patients),
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
      .select('id, title, type, priority, body, publish_date, expires_on, audience, image_url')
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
    const { title, type = 'info', priority = 'normal', body, publish_date, expires_on, audience } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    const safePriority = ['normal', 'important', 'urgent'].includes(priority) ? priority : 'normal';
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        clinic_id: req.profile.clinic_id,
        title,
        type,
        priority: safePriority,
        body,
        publish_date: publish_date || undefined,
        expires_on: expires_on || null,
        audience: Array.isArray(audience) && audience.length ? audience : ['all'],
        created_by_id: req.profile.id,
      })
      .select('id, title, type, priority, body, publish_date, expires_on, audience, image_url')
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ announcement: data });
  } catch (err) {
    next(err);
  }
});

router.patch('/announcements/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { title, type, priority, body, publish_date, expires_on, audience } = req.body || {};
    const patch = {};
    if (title !== undefined) patch.title = title;
    if (type !== undefined) patch.type = type;
    if (priority !== undefined)
      patch.priority = ['normal', 'important', 'urgent'].includes(priority) ? priority : 'normal';
    if (body !== undefined) patch.body = body;
    if (publish_date !== undefined) patch.publish_date = publish_date || null;
    if (expires_on !== undefined) patch.expires_on = expires_on || null;
    if (audience !== undefined)
      patch.audience = Array.isArray(audience) && audience.length ? audience : ['all'];
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const { data, error } = await supabase
      .from('announcements')
      .update(patch)
      .eq('id', req.params.id)
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .select('id, title, type, priority, body, publish_date, expires_on, audience, image_url')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ announcement: data });
  } catch (err) {
    next(err);
  }
});

router.delete('/announcements/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('announcements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('clinic_id', req.profile.clinic_id)
      .is('deleted_at', null)
      .select('id')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// read-only audit trail for the compliance page
router.get('/audit', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: rows, error } = await supabase
      .from('audit_log')
      .select('id, action, entity_type, summary, severity, created_at, actor_id')
      .eq('clinic_id', req.profile.clinic_id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return next(error);

    const actorIds = [...new Set((rows || []).map((r) => r.actor_id).filter(Boolean))];
    const { data: actors } = await supabase
      .from('profiles')
      .select('id, display_name, role')
      .in('id', actorIds.length ? actorIds : ['00000000-0000-0000-0000-000000000000']);
    const byId = Object.fromEntries((actors || []).map((a) => [a.id, a]));

    res.json({
      logs: (rows || []).map((l) => {
        const a = byId[l.actor_id];
        return {
          id: l.id,
          created_at: l.created_at,
          actor: a ? a.display_name : 'System',
          actor_role: a ? a.role : null,
          action: l.action,
          entity_type: l.entity_type,
          summary: l.summary,
          severity: l.severity,
        };
      }),
    });
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
      .select('id, first_name, middle_name, last_name')
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
        name: patientName(p),
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
    const baseCols =
      'id, display_name, email, role, phone, avatar_url, created_at, admin_profiles(employee_id, position), staff(license_no, title)';
    const listQuery = (cols) =>
      supabase
        .from('profiles')
        .select(cols)
        .eq('clinic_id', req.profile.clinic_id)
        .neq('role', 'client')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
    // extra_roles is added by migration 0017; fall back if it isn't applied yet
    let { data, error } = await listQuery(`${baseCols}, extra_roles`);
    if (error) ({ data, error } = await listQuery(baseCols));
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
          phone: p.phone,
          role: p.role,
          extra_roles: p.extra_roles || [],
          avatar_url: p.avatar_url,
          created_at: p.created_at,
          employee_id: ap.employee_id,
          position: ap.position,
          license_no: st.license_no,
          staff_title: st.title,
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
    const { email, password, display_name, role, extra_roles, phone, employee_id, position, license_no, title, avatar } =
      req.body || {};

    if (!email || !password || !display_name || !role) {
      return res.status(400).json({ error: 'Email, password, full name, and role are required' });
    }
    const ALL_ROLES = [...STAFF_ROLES, 'admin'];
    if (!ALL_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const extraRoles = Array.isArray(extra_roles)
      ? [...new Set(extra_roles.filter((r) => ALL_ROLES.includes(r) && r !== role))]
      : [];
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
      .update({ phone: phone || null, extra_roles: extraRoles, ...(avatar_url ? { avatar_url } : {}) })
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

// update an employee: activate/deactivate, or change their roles
router.patch('/employees/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { active, role, extra_roles } = req.body || {};
    const { data: emp } = await supabase
      .from('profiles')
      .select('id, role, clinic_id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!emp || emp.clinic_id !== req.profile.clinic_id || emp.role === 'client') {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // role / extra-roles update
    if (role !== undefined || extra_roles !== undefined) {
      const ALL_ROLES = [...STAFF_ROLES, 'admin'];
      const upd = {};
      if (role !== undefined) {
        if (!ALL_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid primary role' });
        upd.role = role;
      }
      const primary = role !== undefined ? role : emp.role;
      if (extra_roles !== undefined) {
        upd.extra_roles = Array.isArray(extra_roles)
          ? [...new Set(extra_roles.filter((r) => ALL_ROLES.includes(r) && r !== primary))]
          : [];
      }
      const { error } = await supabase.from('profiles').update(upd).eq('id', emp.id);
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ ok: true });
    }

    // activate / deactivate (soft-delete + ban from signing in)
    if (typeof active === 'boolean') {
      if (req.params.id === req.profile.id) {
        return res.status(400).json({ error: 'You cannot change your own account here' });
      }
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: active ? null : new Date().toISOString() })
        .eq('id', emp.id);
      if (error) return res.status(400).json({ error: error.message });
      await supabase.auth.admin.updateUserById(emp.id, { ban_duration: active ? 'none' : '876000h' });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Nothing to update' });
  } catch (err) {
    next(err);
  }
});

// book an appointment
router.post('/schedule', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { patient_id, practitioner_id, date, time, session_type, color_tag, notes, location } =
      req.body || {};
    if (!patient_id || !practitioner_id || !date || !time || !session_type) {
      return res
        .status(400)
        .json({ error: 'Patient, practitioner, date, time, and session type are required' });
    }
    const { data: pt } = await supabase
      .from('patients')
      .select('id, clinic_id, caregiver_id, first_name')
      .eq('id', patient_id)
      .maybeSingle();
    if (!pt || pt.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    // treat the entered date/time as clinic-local (Philippines, +08:00)
    const starts = new Date(`${date}T${time}:00+08:00`);
    if (Number.isNaN(starts.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time' });
    }
    const { data: appt, error } = await supabase
      .from('appointments')
      .insert({
        clinic_id: req.profile.clinic_id,
        patient_id,
        practitioner_id,
        starts_at: starts.toISOString(),
        session_type,
        color_tag: color_tag || 'purple',
        location: location || null,
        notes: notes || null,
        created_by_id: req.profile.id,
      })
      .select('id')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    const when = starts.toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    await createNotification({
      clinicId: pt.clinic_id,
      recipientId: pt.caregiver_id,
      type: 'appointment',
      title: 'New appointment scheduled',
      body: `${pt.first_name} has a session on ${when}.`,
      link: '/client/appointments',
    });

    res.status(201).json({ appointment: appt });
  } catch (err) {
    next(err);
  }
});

// register a patient: create the parent (caregiver) account and enroll their child
router.post('/patients', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { parent_email, parent_password, child = {}, clinical = {}, guardian = {}, emergency = {} } =
      req.body || {};
    if (!parent_email || !parent_password) {
      return res.status(400).json({ error: 'Parent email and password are required' });
    }
    if (parent_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!child.first_name || !child.last_name) {
      return res.status(400).json({ error: 'Child first and last name are required' });
    }
    if (!child.date_of_birth || !child.sex) {
      return res.status(400).json({ error: 'Child date of birth and sex are required' });
    }

    const { data: created, error: cErr } = await supabase.auth.admin.createUser({
      email: parent_email,
      password: parent_password,
      email_confirm: true,
      user_metadata: { role: 'client', display_name: guardian.full_name || parent_email.split('@')[0] },
    });
    if (cErr) return res.status(400).json({ error: cErr.message });
    const caregiverId = created.user.id;

    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        clinic_id: req.profile.clinic_id,
        caregiver_id: caregiverId,
        first_name: child.first_name,
        middle_name: child.middle_name || null,
        last_name: child.last_name,
        nick_name: child.nick_name || null,
        date_of_birth: child.date_of_birth,
        sex: child.sex,
        nationality: child.nationality || null,
        preferred_language: child.preferred_language || null,
        school: child.school || null,
        grade_level: child.grade_level || null,
        home_address: child.home_address || null,
        contact_number: child.contact_number || null,
        place_of_birth: child.place_of_birth || null,
        citizenship: child.citizenship || null,
        religion: child.religion || null,
      })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    const photoMatch = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/.exec(child.photo || '');
    if (photoMatch) {
      const ext = photoMatch[2] === 'jpeg' || photoMatch[2] === 'jpg' ? 'jpg' : photoMatch[2];
      const buffer = Buffer.from(photoMatch[3], 'base64');
      if (buffer.length <= 5 * 1024 * 1024) {
        const path = `patients/${patient.id}/${require('crypto').randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('photos')
          .upload(path, buffer, { contentType: photoMatch[1], upsert: true });
        if (!upErr) {
          const photo_url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
          await supabase.from('patients').update({ photo_url }).eq('id', patient.id);
        }
      }
    }

    // Accept either a `guardians` array (mother + father) or a single `guardian`.
    const guardianList = (
      Array.isArray(req.body.guardians) && req.body.guardians.length
        ? req.body.guardians
        : [guardian]
    ).filter((g) => g && g.full_name);
    const guardianRows = guardianList.map((g, i) => ({
      patient_id: patient.id,
      full_name: g.full_name,
      relationship: g.relationship || null,
      contact_number: g.contact_number || null,
      email: g.email || null,
      occupation: g.occupation || null,
      employer: g.employer || null,
      is_primary: i === 0,
    }));

    await Promise.all([
      supabase.from('clinical_profiles').insert({
        patient_id: patient.id,
        primary_diagnosis: clinical.primary_diagnosis || null,
        iep_level: clinical.iep_level || null,
        secondary_diagnosis: clinical.secondary_diagnosis || null,
        date_enrolled: clinical.date_enrolled || null,
        referral_source: clinical.referral_source || null,
        allergies: clinical.allergies || null,
      }),
      guardianRows.length
        ? supabase.from('guardians').insert(guardianRows)
        : Promise.resolve(),
      emergency.full_name
        ? supabase.from('emergency_contacts').insert({
            patient_id: patient.id,
            full_name: emergency.full_name,
            relationship: emergency.relationship || null,
            contact_number: emergency.contact_number || null,
            alt_contact_number: emergency.alt_contact_number || null,
            address: emergency.address || null,
          })
        : Promise.resolve(),
    ]);

    res.status(201).json({ patient });
  } catch (err) {
    next(err);
  }
});

// full profile (patient + clinical + guardians + emergency) for the detail panel
router.get('/patients/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return next(error);
    if (!patient || patient.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const [{ data: clinical }, { data: guardians }, { data: emergency }] = await Promise.all([
      supabase.from('clinical_profiles').select('*').eq('patient_id', patient.id).maybeSingle(),
      supabase.from('guardians').select('*').eq('patient_id', patient.id).order('is_primary', { ascending: false }),
      supabase.from('emergency_contacts').select('*').eq('patient_id', patient.id).limit(1).maybeSingle(),
    ]);
    res.json({
      patient: { ...patient, full_name: patientName(patient), age: ageFromDob(patient.date_of_birth) },
      clinical: clinical || null,
      guardians: guardians || [],
      emergency: emergency || null,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- assessment activation (feature #11) ----------
// Admin controls which assessment templates are "available". MHPs file activation
// requests; the admin activates a template (is_active) and/or resolves the request.

router.get('/assessments', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [{ data: templates, error: tErr }, { data: requests, error: rErr }] = await Promise.all([
      supabase
        .from('assessment_templates')
        .select('id, title, document_type_code, est_minutes, is_active, document_types(description)')
        .order('title', { ascending: true }),
      supabase
        .from('assessment_activation_requests')
        .select('id, note, status, created_at, template_id, assessment_templates(title), requested_by:requested_by_id(display_name)')
        .eq('clinic_id', req.profile.clinic_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
    ]);
    if (tErr) return next(tErr);
    if (rErr) return next(rErr);
    res.json({
      templates: (templates || []).map((t) => ({
        id: t.id,
        title: t.title,
        code: t.document_type_code,
        desc: t.document_types ? t.document_types.description : '',
        duration: t.est_minutes ? `Est. ${t.est_minutes} mins` : '',
        active: t.is_active,
      })),
      requests: (requests || []).map((r) => ({
        id: r.id,
        note: r.note,
        templateId: r.template_id,
        templateTitle: r.assessment_templates ? r.assessment_templates.title : '—',
        requestedBy: r.requested_by ? r.requested_by.display_name : 'A professional',
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// activate / deactivate an assessment template
router.patch('/assessments/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { is_active } = req.body || {};
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active (boolean) is required' });
    }
    const { data, error } = await supabase
      .from('assessment_templates')
      .update({ is_active })
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Assessment not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// approve (activates the template) or decline an MHP activation request
router.patch('/assessment-requests/:id', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { status } = req.body || {};
    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or declined' });
    }
    const { data: reqRow } = await supabase
      .from('assessment_activation_requests')
      .select('id, clinic_id, template_id, requested_by_id, status, assessment_templates(title)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (!reqRow || reqRow.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (reqRow.status !== 'pending') {
      return res.status(409).json({ error: 'Request already resolved' });
    }

    if (status === 'approved') {
      const { error: actErr } = await supabase
        .from('assessment_templates')
        .update({ is_active: true })
        .eq('id', reqRow.template_id);
      if (actErr) return res.status(400).json({ error: actErr.message });
    }

    const { error } = await supabase
      .from('assessment_activation_requests')
      .update({ status, resolved_by_id: req.profile.id, resolved_at: new Date().toISOString() })
      .eq('id', reqRow.id);
    if (error) return res.status(400).json({ error: error.message });

    const title = reqRow.assessment_templates ? reqRow.assessment_templates.title : 'An assessment';
    await createNotification({
      clinicId: reqRow.clinic_id,
      recipientId: reqRow.requested_by_id,
      type: 'assessment',
      title: status === 'approved' ? 'Assessment activated' : 'Assessment request declined',
      body:
        status === 'approved'
          ? `${title} is now available — you can assign it to a patient.`
          : `Your request to activate ${title} was declined.`,
      link: '/psychometrician/assessments',
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// admin manually changes the password of any user in their clinic
router.post('/users/:id/change-password', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { password } = req.body || {};
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Validate target user belongs to the same clinic as the admin
    const { data: userProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, clinic_id')
      .eq('id', req.params.id)
      .maybeSingle();
      
    if (profileErr) return next(profileErr);
    if (!userProfile || userProfile.clinic_id !== req.profile.clinic_id) {
      return res.status(404).json({ error: 'User profile not found in your clinic' });
    }
    
    // Override user password
    const { error: updateErr } = await supabase.auth.admin.updateUserById(req.params.id, { password });
    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }
    
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

