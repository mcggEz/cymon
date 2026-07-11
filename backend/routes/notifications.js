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

// Per-recipient, so it works for any authenticated role (client + all staff).
// The recipient_id filter (and RLS) scopes rows to the caller.
router.get('/', requireAuth, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const [{ data, error }, { count }] = await Promise.all([
      supabase
        .from('notifications')
        .select('id, type, title, body, link, read_at, created_at')
        .eq('recipient_id', req.profile.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', req.profile.id)
        .is('read_at', null),
    ]);
    if (error) return next(error);
    res.json({ notifications: data || [], unread: count || 0 });
  } catch (err) {
    next(err);
  }
});

// Mark notifications read. Body: { ids: [...] } to mark specific ones,
// or omit ids to mark all of the caller's notifications read.
router.post('/read', requireAuth, async (req, res, next) => {
  if (!ensureConfigured(res)) return;
  try {
    const { ids } = req.body || {};
    let query = supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_id', req.profile.id)
      .is('read_at', null);
    if (Array.isArray(ids) && ids.length) query = query.in('id', ids);
    const { error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
