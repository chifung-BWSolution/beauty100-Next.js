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
        // Use warn instead of error to avoid triggering error overlays in dev
        if (typeof window !== 'undefined') {
          console.warn('[Supabase fetch warning] Network request failed:', err?.message || 'Failed to fetch');
        }
        // Return an empty response instead of throwing to prevent cascading errors
        return new Response(JSON.stringify({ data: null, error: { message: 'Network request failed' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });
    },
  },
});
export { supabaseUrl, supabaseAnonKey };
