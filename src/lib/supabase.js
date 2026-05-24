import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error(
    '%c[2B Vision] Supabase URL is missing or invalid!\n' +
    'Open .env.local and replace VITE_SUPABASE_URL with your real Supabase project URL.\n' +
    'Example: VITE_SUPABASE_URL=https://xyzxyz.supabase.co',
    'color: red; font-size: 14px; font-weight: bold;'
  );
}

// Use a valid-looking placeholder so the client initializes without crashing
// The app will still fail to fetch data, but it won't crash on load
const safeUrl = (supabaseUrl && supabaseUrl.startsWith('http'))
  ? supabaseUrl
  : 'https://placeholder.supabase.co';

const safeKey = supabaseKey || 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeKey);

// Export a flag so components can check if Supabase is properly configured
export const isSupabaseConfigured =
  !!supabaseUrl && supabaseUrl.startsWith('http') &&
  !!supabaseKey && supabaseKey.length > 20;
