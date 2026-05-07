import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "娛樂圈 | 明星美容話題、妝容趨勢與娛樂資訊 - Beauty100",
  description: "揭開明星美容秘密，追蹤最新妝容趨勢與娛樂圈美容資訊。Beauty100 為你搜羅明星護膚心得。",
};

export default function EntertainmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
