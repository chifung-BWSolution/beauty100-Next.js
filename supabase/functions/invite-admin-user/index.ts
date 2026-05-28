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
        JSON.stringify({ error: '只有管理員可以邀請用戶' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { email, role, full_name } = await req.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: '缺少電郵地址' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create user with a temporary password instead of sending invite email
    // This avoids email sending issues in development
    const tempPassword = crypto.randomUUID().slice(0, 12) + 'A1!';
    
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || '',
        role: role || 'merchant',
      },
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Ensure public.users record has the correct role
    if (newUser?.user) {
      await adminClient.from('users').upsert({
        id: newUser.user.id,
        email,
        full_name: full_name || '',
        role: role || 'merchant',
      }, { onConflict: 'id' });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '用戶已成功建立',
        user_id: newUser?.user?.id,
        temp_password: tempPassword,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
