import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jidijybfbgrsmovtalhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZGlqeWJmYmdyc21vdnRhbGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzk4MzAsImV4cCI6MjA5MDY1NTgzMH0.gXyhYu81iVczpHS_pOC1SspAnDPl7_DHlLG7J_1QSJk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  if (pError) {
    console.error('Error fetching profiles:', pError);
  } else if (profiles && profiles.length > 0) {
    console.log('Columns in profiles:', Object.keys(profiles[0]));
    console.log('Sample profile:', profiles[0]);
  } else {
    console.log('No profiles found to inspect columns');
  }
}

checkColumns();
