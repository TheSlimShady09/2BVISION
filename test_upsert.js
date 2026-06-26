import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnmnyuthipcmykjangog.supabase.co';
const supabaseKey = 'sb_publishable_B_Y_5w7Q0jPk_izOKeqRxg_bYJUCRNv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  const dummyId = '2b094ac0-8f1e-4604-b395-bf2907fd6932';
  try {
    const { data, error } = await supabase.from('profiles').upsert(
      {
        id: dummyId,
        full_name: 'Test Name',
        role: 'admin',
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('Upsert failed:', error);
    } else {
      console.log('Upsert succeeded:', data);
    }
  } catch (err) {
    console.error('Unexpected error during upsert:', err);
  }
}

testUpsert();
