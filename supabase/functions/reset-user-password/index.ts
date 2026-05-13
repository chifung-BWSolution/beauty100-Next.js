import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify that the caller is an admin
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${authHeader}` } }
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(
        JSON.stringify({ error: '未授權' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check caller is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: callerProfile } = await adminClient
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (!callerProfile || (callerProfile.role !== 'admin' && callerProfile.role !== 'marketing')) {
      return new Response(
        JSON.stringify({ error: '只有管理員可以重設密碼' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { user_id, new_password } = await req.json();
    if (!user_id || !new_password) {
      return new Response(
        JSON.stringify({ error: '缺少必要參數' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ error: '密碼最少需要 6 個字元' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Reset the password using admin API
    const { error } = await adminClient.auth.admin.updateUser(user_id, {
      password: new_password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: '密碼已成功重設' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
