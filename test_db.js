import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnmnyuthipcmykjangog.supabase.co';
const supabaseKey = 'sb_publishable_B_Y_5w7Q0jPk_izOKeqRxg_bYJUCRNv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDB() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    if (error) {
      console.error('Fetch profiles error:', error);
    } else {
      console.log('Fetched profiles successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testDB();
