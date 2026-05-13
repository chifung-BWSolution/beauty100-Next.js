import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "回復青春 | 抗老保養、膠原管理與回春療程資訊",
  description: "回復青春專區，分享抗老保養秘訣、膠原管理方法與回春療程資訊。涵蓋醫學美容、注射療程、光學療程等逆齡方案。Beauty100 助你逆轉肌齡。",
  openGraph: {
    title: "回復青春 | 抗老保養、膠原管理與回春療程資訊 - Beauty100",
    description: "回復青春專區，分享抗老保養秘訣、膠原管理方法與回春療程資訊。",
    url: "/anti-aging",
  },
  alternates: {
    canonical: "/anti-aging",
  },
};

export default function AntiAgingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
