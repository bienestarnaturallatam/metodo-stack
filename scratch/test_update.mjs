import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jidijybfbgrsmovtalhu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZGlqeWJmYmdyc21vdnRhbGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzk4MzAsImV4cCI6MjA5MDY1NTgzMH0.gXyhYu81iVczpHS_pOC1SspAnDPl7_DHlLG7J_1QSJk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const id = 'ad7fd4d9-1182-4db1-aad5-d94cf86d67e8';
  console.log('Testing update for ID:', id);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ tier: 'suspended_habitos' })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Update failed:', error);
  } else {
    console.log('Update success:', data);
  }
}

testUpdate();
