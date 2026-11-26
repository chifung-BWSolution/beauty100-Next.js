import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

const getGtmId = unstable_cache(
  async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

      // No GTM row (or it is disabled) is a normal state: with .single() PostgREST
      // answers 406 PGRST116 on zero rows, which turned every page render into a
      // failed request. limit(1) keeps it to one row so maybeSingle() stays quiet.
      const { data } = await supabase
        .from("tracking_codes")
        .select("code_value")
        .eq("code_type", "google_tag_manager")
        .eq("enabled", true)
        .limit(1)
        .maybeSingle();

      return data?.code_value || null;
    } catch {
      return null;
    }
  },
  ["gtm-noscript-id"],
  { revalidate: 60 }
);

// Server component - GTM noscript fallback for <body>
export default async function TrackingNoscriptBody() {
  const gtmId = await getGtmId();
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
