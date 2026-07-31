import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "創作者合作｜與美容院合作，分享美容體驗 | Beauty100",
  description:
    "歡迎網紅、內容創作者加入 Beauty100。我們協助您對接美容院合作、療程體驗與曝光機會。粉絲數量不是唯一條件，歡迎申請。",
  openGraph: {
    title: "創作者合作｜與美容院合作 | Beauty100",
    description:
      "歡迎網紅、內容創作者加入 Beauty100，對接美容院合作與曝光機會。",
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
