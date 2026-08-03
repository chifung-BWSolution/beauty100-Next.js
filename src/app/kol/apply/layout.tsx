import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOL 登記｜申請創作者合作 | Beauty100",
  description:
    "填寫 Beauty100 KOL 登記表，對接美容院合作與曝光機會，專員將盡快與您聯繫。",
  openGraph: {
    title: "KOL 登記｜申請創作者合作 | Beauty100",
    description: "填寫 Beauty100 KOL 登記表，對接美容院合作與曝光機會。",
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
