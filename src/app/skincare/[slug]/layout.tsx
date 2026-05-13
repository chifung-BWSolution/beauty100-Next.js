import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "skincare",
    "化妝護膚文章 | Beauty100",
    "化妝護膚專區，為你帶來最新彩妝趨勢、護膚技巧與產品推薦。"
  );
}

export default function SkincareArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
