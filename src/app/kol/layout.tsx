import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOL推廣｜美容創作者合作與商戶推廣 | Beauty100",
  description:
    "Beauty100 KOL 推廣：連結美容院與內容創作者，提供體驗評測、短片拍攝、宣傳片及節目主播合作。歡迎 KOL 登記與商戶查詢推廣方案。",
  openGraph: {
    title: "KOL推廣｜美容創作者合作與商戶推廣 | Beauty100",
    description:
      "連結美容院與內容創作者，提供體驗評測、短片拍攝、宣傳片及節目主播合作。",
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
