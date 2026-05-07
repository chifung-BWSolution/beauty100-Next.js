import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "化妝護膚 | 彩妝趨勢、護膚技巧與產品資訊 - Beauty100",
  description: "化妝護膚專區，為你帶來最新彩妝趨勢、護膚技巧與產品推薦。Beauty100 一站式美容護膚資訊平台。",
};

export default function SkincareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
