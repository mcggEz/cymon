const express = require('express');
const { supabase, authClient, supabaseConfigured } = require('../lib/supabase');
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

async function loadProfile(userId) {
  const base = 'id, role, display_name, email, clinic_id';
  // extra_roles is added by migration 0017 — fall back if it isn't applied yet
  let { data, error } = await supabase
    .from('profiles')
    .select(`${base}, extra_roles`)
    .eq('id', userId)
    .single();
  if (error) {
    ({ data, error } = await supabase.from('profiles').select(base).eq('id', userId).single());
  }
  if (error) return null;
  return { ...data, extra_roles: data.extra_roles || [] };
}

router.post('/signup', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { email, password, displayName, role = 'client', clinicCode } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          display_name: displayName || email.split('@')[0],
          ...(clinicCode ? { clinic_code: clinicCode } : {}),
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const profile = data.user ? await loadProfile(data.user.id) : null;

    return res.status(201).json({
      session: data.session,
      user: data.user,
      profile,
      emailConfirmationRequired: !data.session,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const profile = await loadProfile(data.user.id);
    if (!profile) {
      return res.status(401).json({ error: 'Profile not found for this account' });
    }

    return res.json({ session: data.session, user: data.user, profile });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user, profile: req.profile });
});

router.put('/profile', requireAuth, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { displayName, phone } = req.body || {};
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName !== undefined ? displayName : req.profile.display_name,
        phone: phone !== undefined ? phone : req.profile.phone,
      })
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

router.post('/change-password', requireAuth, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    // verify the current password before changing it
    const { error: verifyError } = await authClient.auth.signInWithPassword({
      email: req.profile.email,
      password: currentPassword,
    });
    if (verifyError) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password: newPassword });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const origin = req.headers.origin || 'http://localhost:5173';
    const redirectTo = `${origin}/reset-password`;
    
    const { error } = await authClient.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { accessToken, password } = req.body || {};
    if (!accessToken || !password) {
      return res.status(400).json({ error: 'Access token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Verify accessToken using the auth client
    const { data: { user }, error: userErr } = await authClient.auth.getUser(accessToken);
    if (userErr || !user) {
      return res.status(401).json({ error: userErr ? userErr.message : 'Invalid or expired access token' });
    }
    
    // Perform admin password override
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/public-announcements', async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, body, type, publish_date, image_url, audience')
      .is('deleted_at', null)
      .order('publish_date', { ascending: false });
    if (error) return next(error);

    const publicAnnouncements = (data || []).filter((a) => {
      const audience = a.audience || [];
      return audience.includes('public');
    });

    res.json({ announcements: publicAnnouncements });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

