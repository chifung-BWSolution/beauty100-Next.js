import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "化妝護膚 | 彩妝趨勢、護膚技巧與產品資訊",
  description: "化妝護膚專區，為你帶來最新彩妝趨勢、護膚技巧與產品推薦。涵蓋底妝教學、眼妝技巧、護膚品推薦等內容。Beauty100 一站式美容護膚資訊平台。",
  openGraph: {
    title: "化妝護膚 | 彩妝趨勢、護膚技巧與產品資訊 - Beauty100",
    description: "化妝護膚專區，為你帶來最新彩妝趨勢、護膚技巧與產品推薦。",
    url: "/skincare",
  },
  alternates: {
    canonical: "/skincare",
  },
};

export default function SkincareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
