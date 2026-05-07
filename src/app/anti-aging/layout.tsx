import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "回復青春 | 抗老保養、膠原管理與回春療程資訊 - Beauty100",
  description: "回復青春專區，分享抗老保養秘訣、膠原管理方法與回春療程資訊。Beauty100 助你逆轉肌齡。",
};

export default function AntiAgingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
