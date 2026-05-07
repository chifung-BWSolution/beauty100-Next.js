import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "身體保養 | 身體護理、保濕修護與日常保養資訊 - Beauty100",
  description: "身體保養專區，為你分享身體護理技巧、保濕修護方法與日常保養資訊。Beauty100 全方位美容資訊平台。",
};

export default function BodyCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
