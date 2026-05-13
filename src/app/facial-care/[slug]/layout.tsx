import type { Metadata } from "next";
import { generateArticleMetadata } from "@/lib/seo-utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return generateArticleMetadata(
    slug,
    "facial-care",
    "面部護理文章 | Beauty100",
    "面部護理專區，為你提供護膚技巧、美容療程解析與最新面部美容資訊。"
  );
}

export default function FacialCareArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
