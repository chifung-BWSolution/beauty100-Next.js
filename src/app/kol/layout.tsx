import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "加入KOL實錄 | 成為 Beauty100 合作 KOL，分享真實美容體驗",
  description: "加入 Beauty100 KOL 實錄計劃，分享你的真實美容體驗，與更多愛美人士交流。",
};

export default function KolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
