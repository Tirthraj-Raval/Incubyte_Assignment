// server/src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Anon Key are required');
  throw new Error('Supabase URL and Anon Key are required');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
supabase.from('products').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connected successfully');
  }
});

module.exports = supabase;