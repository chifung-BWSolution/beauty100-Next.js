import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOL實錄 | 成為 Beauty100 合作 KOL，分享真實美容體驗",
  description: "加入 Beauty100 KOL 實錄計劃，分享你的真實美容體驗，與更多愛美人士交流。觀看 KOL 的美容療程體驗影片及評價。",
  openGraph: {
    title: "KOL實錄 | 成為 Beauty100 合作 KOL - Beauty100",
    description: "加入 Beauty100 KOL 實錄計劃，分享你的真實美容體驗。",
    url: "/kol",
  },
  alternates: {
    canonical: "/kol",
  },
};

export default function KolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
