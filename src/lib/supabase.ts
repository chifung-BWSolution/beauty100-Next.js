import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-auth',
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch((err) => {
        // Suppress network errors that would bubble as unhandled in cross-origin contexts
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          console.warn('Supabase fetch failed (network):', args[0]);
        }
        throw err;
      });
    },
  },
});
export { supabaseUrl, supabaseAnonKey };
