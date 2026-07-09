require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error, status } = await supabase.from('projects').select('*');
  console.log('Status:', status);
  console.log('Data:', data);
  if (error) console.error('Error:', error);
}
test();
