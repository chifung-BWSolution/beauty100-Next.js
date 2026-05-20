import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import AppLayout from "@/components/AppLayout";
import dynamic from "next/dynamic";
import ErrorBoundaryScript from "@/components/ErrorBoundaryScript";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import TrackingScripts from "@/components/TrackingScripts";
import TrackingNoscriptBody from "@/components/TrackingNoscriptBody";

const WhatsAppWidget = dynamic(() => import("@/components/WhatsAppWidget"), {
  ssr: false,
  loading: () => null,
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-tc",
  preload: true,
});

const SITE_URL = "https://www.beauty100-magazine.com";
const SITE_NAME = "Beauty100";
const DEFAULT_DESCRIPTION = "Beauty100 香港最全面的美容資訊平台，為你搜羅全港優質美容院及最新美容資訊。護膚、面部護理、抗老保養、身體保養、飲食健康等美容資訊一站式搜羅。";
const DEFAULT_IMAGE = "/images/beauty-100_logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beauty100 | 香港最全面的美容資訊平台，搜羅全港優質美容院及最新美容資訊",
    template: "%s | Beauty100",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "美容", "護膚", "面部護理", "抗老", "抗衰老", "美容院", "香港美容",
    "Beauty100", "身體保養", "化妝", "飲食健康", "美容療程", "美容資訊",
    "Hong Kong Beauty", "skincare", "facial care", "anti-aging",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_HK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Beauty100 | 香港最全面的美容資訊平台",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: "Beauty100 - 香港美容資訊平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beauty100 | 香港最全面的美容資訊平台",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add Google Search Console verification code when available
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <head>
        {/* Preconnect to third-party origins for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var oCE=console.error;console.error=function(){var a=typeof arguments[0]==='string'?arguments[0]:'';if(a.indexOf('The above error occurred in the <Router>')!==-1||a.indexOf('createInitialRouterState')!==-1||a.indexOf('fillLazyItemsTillLeafWithHead')!==-1||a.indexOf("Cannot read properties of null (reading 'get')")!==-1){return;}oCE.apply(console,arguments);};window.addEventListener('error',function(e){if(e.message==='Script error.'&&!e.filename&&e.lineno===0&&e.colno===0){e.preventDefault();e.stopImmediatePropagation();return true;}if(e.message&&(e.message.indexOf("Cannot read properties of null (reading 'get')")!==-1||e.message.indexOf('fillLazyItemsTillLeafWithHead')!==-1||e.message.indexOf('createInitialRouterState')!==-1)){e.preventDefault();e.stopImmediatePropagation();return true;}},true);})();`,
          }}
        />
        {/* JSON-LD Structured Data for Organization & Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.beauty100-magazine.com/#organization",
                  "name": "Beauty100",
                  "url": "https://www.beauty100-magazine.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.beauty100-magazine.com/images/beauty-100_logo.png",
                  },
                  "sameAs": [],
                  "description": "香港最全面的美容資訊平台，搜羅全港優質美容院及最新美容資訊。",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.beauty100-magazine.com/#website",
                  "url": "https://www.beauty100-magazine.com",
                  "name": "Beauty100",
                  "description": "香港最全面的美容資訊平台",
                  "publisher": { "@id": "https://www.beauty100-magazine.com/#organization" },
                  "inLanguage": "zh-HK",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://www.beauty100-magazine.com/explore-salons?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        <TrackingScripts />
      </head>
      <body className={`${notoSansTC.variable} ${notoSansTC.className}`}>
        <TrackingNoscriptBody />
        <ErrorBoundaryScript />
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <WhatsAppWidget />
          <Toaster />
          <SonnerToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
