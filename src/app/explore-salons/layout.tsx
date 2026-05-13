import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "找美容院 | 搜羅全港優質美容院推薦",
  description: "搜羅全港優質美容院推薦，輕鬆找到適合你的美容院。按地區、療程類型搜尋，查看評價及優惠資訊。Beauty100 為你提供全面的美容院資訊及評價。",
  openGraph: {
    title: "找美容院 | 搜羅全港優質美容院推薦 - Beauty100",
    description: "搜羅全港優質美容院推薦，輕鬆找到適合你的美容院。",
    url: "/explore-salons",
  },
  alternates: {
    canonical: "/explore-salons",
  },
};

export default function ExploreSalonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
