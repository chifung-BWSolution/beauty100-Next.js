import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import AppLayout from "@/components/AppLayout";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ErrorBoundaryScript from "@/components/ErrorBoundaryScript";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BEAUTY 商戶入駐平台",
  description: "Beauty merchant onboarding platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <body className={inter.className}>
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
