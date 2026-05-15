import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'supabase-auth',
  },
  global: {
    fetch: (...args) => {
      // If URL/key are not configured, return an empty response to avoid network errors
      if (!supabaseUrl || !supabaseAnonKey) {
        return Promise.resolve(new Response(JSON.stringify({ data: null, error: { message: 'Supabase not configured' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }));
      }
      return fetch(...args).catch((err) => {
        console.error('[Supabase fetch error]', err?.message || err);
        throw err;
      });
    },
  },
});
export { supabaseUrl, supabaseAnonKey };
