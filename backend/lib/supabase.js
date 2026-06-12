const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    '[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env. ' +
      'Auth routes will return 500 until these are set.'
  );
}

const supabase = createClient(url || 'http://localhost', serviceRoleKey || 'placeholder', {
  auth: { persistSession: false, autoRefreshToken: false },
});

const supabaseConfigured = Boolean(url && serviceRoleKey);

module.exports = { supabase, supabaseConfigured };
