import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import AppLayout from "@/components/AppLayout";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ErrorBoundaryScript from "@/components/ErrorBoundaryScript";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto-sans-tc",
});

export const metadata: Metadata = {
  title: {
    default: "Beauty100 | 香港最全面的美容資訊平台，搜羅全港優質美容院及最新美容資訊",
    template: "%s",
  },
  description: "Beauty100 香港最全面的美容資訊平台，為你搜羅全港優質美容院及最新美容資訊。護膚、面部護理、抗老保養、身體保養、飲食健康等美容資訊一站式搜羅。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('error',function(e){if(e.message==='Script error.'&&!e.filename&&e.lineno===0&&e.colno===0){e.preventDefault();e.stopImmediatePropagation();return true;}},true);`,
          }}
        />
      </head>
      <body className={`${notoSansTC.variable} ${notoSansTC.className}`}>
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
