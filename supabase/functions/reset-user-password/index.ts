import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

    // Verify that the caller is authenticated
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: '未授權' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get caller user from auth token
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${authHeader}`,
        'apikey': supabaseAnonKey,
      },
    });
    if (!userRes.ok) {
      return new Response(
        JSON.stringify({ error: '未授權' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    const caller = await userRes.json();

    // Check caller is admin via REST
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/users?select=role&id=eq.${caller.id}`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const profiles = await profileRes.json();
    const callerProfile = profiles?.[0];

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

    // Reset the password using Supabase Auth Admin REST API directly
    const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      method: 'PUT',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: new_password }),
    });

    if (!updateRes.ok) {
      const errorBody = await updateRes.json();
      return new Response(
        JSON.stringify({ error: errorBody.message || errorBody.msg || '密碼重設失敗' }),
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
