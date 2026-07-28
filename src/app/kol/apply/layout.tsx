import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "申請加入 KOL 實錄 | Beauty100",
  description: "填寫 Beauty100 KOL 實錄申請表，提交你的平台資料與合作意向，專員將盡快與你聯繫。",
  openGraph: {
    title: "申請加入 KOL 實錄 | Beauty100",
    description: "填寫 Beauty100 KOL 實錄申請表，提交你的平台資料與合作意向。",
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
