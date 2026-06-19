const { createClient } = require('@supabase/supabase-js');

const rawUrl = (process.env.SUPABASE_URL || '').trim();
const rawKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const url = rawUrl.replace(/^['"]|['"]$/g, '');
const serviceRoleKey = rawKey.replace(/^['"]|['"]$/g, '');

const urlLooksValid = /^https?:\/\//i.test(url);
const supabaseConfigured = Boolean(urlLooksValid && serviceRoleKey);

if (!supabaseConfigured) {
  if (!url) {
    console.error('[supabase] SUPABASE_URL is missing in backend/.env.');
  } else if (!urlLooksValid) {
    console.error(
      `[supabase] SUPABASE_URL must start with "https://" (got: "${url}"). ` +
        'Open Supabase dashboard → Project Settings → API and copy "Project URL" exactly.'
    );
  }
  if (!serviceRoleKey) {
    console.error('[supabase] SUPABASE_SERVICE_ROLE_KEY is missing in backend/.env.');
  }
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };

// Service-role client: bypasses RLS. Never call signInWithPassword/signUp on
// this client — those attach a user session, after which its queries run under
// that user's RLS instead of service-role. Use authClient for password auth.
const supabase = supabaseConfigured ? createClient(url, serviceRoleKey, clientOptions) : null;

// Dedicated client for password auth (login/signup) so the service client above
// never picks up a user session. We only read the returned session/user from it.
const authClient = supabaseConfigured ? createClient(url, serviceRoleKey, clientOptions) : null;

module.exports = { supabase, authClient, supabaseConfigured };
