import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "面部護理 | 護膚技巧、療程解析與最新面部美容資訊",
  description: "面部護理專區，為你提供護膚技巧、美容療程解析與最新面部美容資訊。涵蓋清潔、保濕、抗皺、美白等全方位面部護膚知識。Beauty100 助你擁有健康亮麗肌膚。",
  openGraph: {
    title: "面部護理 | 護膚技巧、療程解析與最新面部美容資訊 - Beauty100",
    description: "面部護理專區，為你提供護膚技巧、美容療程解析與最新面部美容資訊。",
    url: "/facial-care",
  },
  alternates: {
    canonical: "/facial-care",
  },
};

export default function FacialCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
