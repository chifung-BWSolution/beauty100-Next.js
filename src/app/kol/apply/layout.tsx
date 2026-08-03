import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "加入 Beauty100 美容體驗創作者社群 | KOL 登記",
  description:
    "Join Beauty100 Creator Community。招募 KOL、KOC、Blogger、Beauty Reviewer 及 Content Creator，分享真實美容體驗。",
  openGraph: {
    title: "加入 Beauty100 美容體驗創作者社群 | KOL 登記",
    description:
      "招募 KOL、KOC、Blogger、Beauty Reviewer 及 Content Creator，加入 Beauty100 Creator Community。",
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
