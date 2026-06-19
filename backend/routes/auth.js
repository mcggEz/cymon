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
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, email, clinic_id')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
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

module.exports = router;
