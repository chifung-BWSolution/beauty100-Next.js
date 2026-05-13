import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "topics",
    "焦點話題文章 | Beauty100",
    "Beauty100 焦點話題，為你帶來最新美容熱話、行業趨勢與深度專題內容。"
  );
}

export default function TopicArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
