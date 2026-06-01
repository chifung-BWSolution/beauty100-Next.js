import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateArticleMetadata } from "@/lib/seo-utils";

export const revalidate = 3600;

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

export async function generateStaticParams() {
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('blog_articles')
      .select('handle')
      .eq('status', 'active')
      .eq('category', 'facial-care')
      .order('published_at', { ascending: false })
      .limit(100);
    return (data || [])
      .filter((a) => a.handle)
      .map((a) => ({ slug: a.handle }));
  } catch {
    return [];
  }
}

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
