import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "飲食健康 | 健康飲食、營養觀念與養生資訊",
  description: "飲食健康專區，為你提供健康飲食建議、營養觀念與養生資訊。涵蓋瘦身食譜、抗氧化飲食、排毒養顏等實用內容。Beauty100 助你由內到外散發美麗。",
  openGraph: {
    title: "飲食健康 | 健康飲食、營養觀念與養生資訊 - Beauty100",
    description: "飲食健康專區，為你提供健康飲食建議、營養觀念與養生資訊。",
    url: "/healthy-diet",
  },
  alternates: {
    canonical: "/healthy-diet",
  },
};

export default function HealthyDietLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
