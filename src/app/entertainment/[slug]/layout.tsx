import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "entertainment",
    "娛樂圈文章 | Beauty100",
    "揭開明星美容秘密，追蹤最新妝容趨勢與娛樂圈美容資訊。"
  );
}

export default function EntertainmentArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

