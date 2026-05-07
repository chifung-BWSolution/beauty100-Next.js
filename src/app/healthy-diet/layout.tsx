import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "飲食健康 | 健康飲食、營養觀念與養生資訊 - Beauty100",
  description: "飲食健康專區，為你提供健康飲食建議、營養觀念與養生資訊。Beauty100 助你由內到外散發美麗。",
};

export default function HealthyDietLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
