import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "創作者合作｜同美容院合作，分享美容體驗 | Beauty100",
  description:
    "歡迎網紅、內容創作者加入 Beauty100。我哋幫你對接美容院合作、療程體驗同曝光機會。唔使粉絲好高都可以申請。",
  openGraph: {
    title: "創作者合作｜同美容院合作 | Beauty100",
    description:
      "歡迎網紅、內容創作者加入 Beauty100，對接美容院合作同曝光機會。",
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
