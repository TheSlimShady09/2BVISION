import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnmnyuthipcmykjangog.supabase.co';
const supabaseKey = 'sb_publishable_B_Y_5w7Q0jPk_izOKeqRxg_bYJUCRNv';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const email = '2bvision.2b.al@gmail.com'; // This is the admin email
  const password = 'somepassword'; // We don't know the password, let's see what error we get

  console.log(`Attempting login with email: ${email}`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
    } else {
      console.log('Login success. Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testLogin();
