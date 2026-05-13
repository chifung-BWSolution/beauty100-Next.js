import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "焦點話題 | 最新美容熱話、趨勢與專題內容",
  description: "Beauty100 焦點話題，為你帶來最新美容熱話、行業趨勢與深度專題內容。涵蓋護膚、美容療程、明星護膚心得等熱門話題。",
  openGraph: {
    title: "焦點話題 | 最新美容熱話、趨勢與專題內容 - Beauty100",
    description: "Beauty100 焦點話題，為你帶來最新美容熱話、行業趨勢與深度專題內容。",
    url: "/topics",
  },
  alternates: {
    canonical: "/topics",
  },
};

export default function TopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
