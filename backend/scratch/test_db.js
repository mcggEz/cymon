require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL.trim().replace(/^['"]|['"]$/g, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY.trim().replace(/^['"]|['"]$/g, '');
const supabase = createClient(url, key);

async function check() {
  console.log('Testing RPC exec_sql...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    if (error) {
      console.error('exec_sql failed:', error.message);
    } else {
      console.log('exec_sql succeeded! Data:', data);
    }
  } catch (err) {
    console.error('exec_sql error:', err.message);
  }

  console.log('Testing RPC run_sql...');
  try {
    const { data, error } = await supabase.rpc('run_sql', { sql: 'SELECT 1;' });
    if (error) {
      console.error('run_sql failed:', error.message);
    } else {
      console.log('run_sql succeeded! Data:', data);
    }
  } catch (err) {
    console.error('run_sql error:', err.message);
  }
}

check();
