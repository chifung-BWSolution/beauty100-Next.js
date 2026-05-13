import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "body-care",
    "身體保養文章 | Beauty100",
    "身體保養專區，為你分享身體護理技巧、保濕修護方法與日常保養資訊。"
  );
}

export default function BodyCareArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
