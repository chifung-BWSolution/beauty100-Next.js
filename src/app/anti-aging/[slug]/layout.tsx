import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "anti-aging",
    "回復青春文章 | Beauty100",
    "回復青春專區，分享抗老保養秘訣、膠原管理方法與回春療程資訊。"
  );
}

export default function AntiAgingArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
