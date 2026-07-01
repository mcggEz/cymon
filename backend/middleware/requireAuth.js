const { supabase, supabaseConfigured } = require('../lib/supabase');

async function requireAuth(req, res, next) {
  if (!supabaseConfigured) {
    return res
      .status(500)
      .json({ error: 'Server not configured: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const baseCols = 'id, role, display_name, email, clinic_id, deleted_at';
  // extra_roles is added by migration 0017 — fall back if it isn't applied yet
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`${baseCols}, extra_roles`)
    .eq('id', data.user.id)
    .single();
  if (profileError) {
    ({ data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(baseCols)
      .eq('id', data.user.id)
      .single());
  }

  if (profileError || !profile) {
    return res.status(401).json({ error: 'Profile not found' });
  }
  if (profile.deleted_at) {
    return res.status(401).json({ error: 'This account has been deactivated' });
  }

  profile.extra_roles = profile.extra_roles || [];
  req.user = data.user;
  req.profile = profile;
  req.accessToken = token;
  next();
}

module.exports = requireAuth;
