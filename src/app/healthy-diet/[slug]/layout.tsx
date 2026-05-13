import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "healthy-diet",
    "飲食健康文章 | Beauty100",
    "飲食健康專區，為你提供健康飲食建議、營養觀念與養生資訊。"
  );
}

export default function HealthyDietArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
