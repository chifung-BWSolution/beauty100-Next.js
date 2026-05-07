import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "找美容院 | 搜羅全港優質美容院推薦 - Beauty100",
  description: "搜羅全港優質美容院推薦，輕鬆找到適合你的美容院。Beauty100 為你提供全面的美容院資訊及評價。",
};

export default function ExploreSalonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
