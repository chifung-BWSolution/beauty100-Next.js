import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "申請創作者合作 | Beauty100",
  description: "填寫 Beauty100 創作者合作申請表，對接美容院合作同曝光機會，專員將盡快與你聯繫。",
  openGraph: {
    title: "申請創作者合作 | Beauty100",
    description: "填寫 Beauty100 創作者合作申請表，對接美容院合作同曝光機會。",
    url: "/kol/apply",
  },
  alternates: {
    canonical: "/kol/apply",
  },
};

export default function KolApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
