CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT vault.create_secret(
  'https://gkqctvtteafjprkudgsb.supabase.co',
  'project_url'
);

SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWN0dnR0ZWFmanBya3VkZ3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTkyOTIsImV4cCI6MjA4OTk5NTI5Mn0.zFP6lWYwwAq1xVuMDRxUON5uS2hm4IPH6-Gl1o4whVE',
  'publishable_key'
);

SELECT cron.schedule(
  'shopify-token-refresh-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/supabase-functions-shopify-refresh-token',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'publishable_key')
    ),
    body := '{"triggered_by": "cron"}'::jsonb
  ) AS request_id;
  $$
);
