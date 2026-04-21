import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read Shopify credentials from environment (set via Supabase Secrets)
    // SHOPIFY_API_KEY = Client ID, SHOPIFY_API_SECRET = Client Secret, SHOPIFY_STORE_URL = Store domain
    const clientId = Deno.env.get('SHOPIFY_API_KEY');
    const clientSecret = Deno.env.get('SHOPIFY_API_SECRET');
    const shopDomain = Deno.env.get('SHOPIFY_STORE_URL'); // e.g. your-store.myshopify.com

    if (!clientId || !clientSecret || !shopDomain) {
      throw new Error('Missing SHOPIFY_API_KEY, SHOPIFY_API_SECRET, or SHOPIFY_STORE_URL environment variables');
    }

    // Determine trigger source
    let triggeredBy = 'manual';
    try {
      const body = await req.json();
      triggeredBy = body?.triggered_by || 'manual';
    } catch {
      // No body or invalid JSON - default to manual
    }

    // Shopify Client Credentials flow
    // Strip any protocol prefix from shopDomain if present
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const tokenUrl = `https://${cleanDomain}/admin/oauth/access_token`;

    console.log('Requesting token from:', tokenUrl);
    console.log('Using client_id:', clientId?.substring(0, 6) + '...');
    console.log('SHOPIFY_STORE_URL raw:', shopDomain);

    // Build body with ONLY grant_type as per Shopify docs
    const formBody = new URLSearchParams();
    formBody.append('grant_type', 'client_credentials');
    formBody.append('client_id', clientId);
    formBody.append('client_secret', clientSecret);

    // Use HTTP Basic Auth (client_id:client_secret) in Authorization header
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    console.log('Sending request with Basic Auth and grant_type=client_credentials');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: formBody.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Shopify token error response:', tokenResponse.status, errorText);
      console.error('Response headers:', JSON.stringify(Object.fromEntries(tokenResponse.headers.entries())));
      throw new Error(`Shopify token request failed (${tokenResponse.status}): ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token response keys:', Object.keys(tokenData));
    console.log('Token response (redacted):', JSON.stringify({
      ...tokenData,
      access_token: tokenData.access_token ? tokenData.access_token.substring(0, 10) + '...' : null,
    }));
    const accessToken = tokenData.access_token;
    const scope = tokenData.scope || '';

    if (!accessToken) {
      throw new Error('No access_token returned from Shopify');
    }

    // Token expires in 24 hours for Client Credentials
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    // Save token to shopify_configs table using UPSERT on key column
    // This guarantees no duplicate rows regardless of current state
    const configKey = 'shopify_token';

    const { error: upsertError } = await supabase
      .from('shopify_configs')
      .upsert(
        {
          key: configKey,
          access_token: accessToken,
          shop_domain: cleanDomain,
          expires_at: expiresAt,
          token_type: tokenData.token_type || 'Bearer',
          scope,
          refreshed_at: now,
          last_refreshed: now,
          updated_at: now,
        },
        { onConflict: 'key' }
      );

    if (upsertError) {
      throw new Error(`Failed to upsert shopify_configs: ${upsertError.message}`);
    }

    // Log the refresh
    await supabase
      .from('shopify_token_logs')
      .insert({
        status: 'success',
        message: `Token refreshed successfully. Expires at ${expiresAt}`,
        triggered_by: triggeredBy,
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Shopify token refreshed successfully',
        expires_at: expiresAt,
        scope,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Shopify token refresh error:', error);

    // Try to log the failure
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('shopify_token_logs')
        .insert({
          status: 'error',
          message: error.message || 'Unknown error',
          triggered_by: 'unknown',
        });
    } catch {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
