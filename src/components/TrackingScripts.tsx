import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

// Cached fetch - revalidates every 60 seconds so admin changes take effect quickly
const getTrackingCodes = unstable_cache(
  async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

      const { data } = await supabase
        .from("tracking_codes")
        .select("code_type, code_value, enabled")
        .eq("enabled", true);

      return data || [];
    } catch (e) {
      console.error("Failed to fetch tracking codes:", e);
      return [];
    }
  },
  ["tracking-codes"],
  { revalidate: 60 }
);

export default async function TrackingScripts() {
  const codes = await getTrackingCodes();

  const ga4 = codes.find((c) => c.code_type === "google_analytics");
  const googleAds = codes.find((c) => c.code_type === "google_ads");
  const gtm = codes.find((c) => c.code_type === "google_tag_manager");

  // Determine if we need gtag.js (for GA4 and/or Google Ads)
  const needsGtag =
    (ga4 && ga4.code_value) || (googleAds && googleAds.code_value);
  // The primary gtag ID (GA4 takes priority as the config target)
  const primaryGtagId = ga4?.code_value || googleAds?.code_value;

  return (
    <>
      {/* Google Tag Manager - loads before gtag.js for proper tag management */}
      {gtm && gtm.code_value && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm.code_value}');`,
            }}
          />
        </>
      )}

      {/* Google Analytics (GA4) + Google Ads via gtag.js */}
      {needsGtag && primaryGtagId && (
        <>
          {/* Load gtag.js with primary measurement ID */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${ga4?.code_value ? `gtag('config', '${ga4.code_value}');` : ""}
${googleAds?.code_value ? `gtag('config', '${googleAds.code_value}');` : ""}`,
            }}
          />
        </>
      )}
    </>
  );
}

// Separate component for GTM noscript (goes in <body>)
export function TrackingNoscript({ gtmId }: { gtmId: string | null }) {
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
