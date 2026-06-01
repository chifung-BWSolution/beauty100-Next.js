import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

export async function generateStaticParams() {
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('salon_profiles')
      .select('id')
      .eq('is_active', true)
      .order('created_date', { ascending: false })
      .limit(200);
    return (data || []).map((s) => ({ id: s.id }));
  } catch {
    return [];
  }
}

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const siteUrl = 'https://www.beauty100-magazine.com';

  if (!supabaseUrl || !supabaseKey) {
    return {
      title: "美容院詳情 | Beauty100",
      description: "查看美容院詳細資訊、服務項目及聯絡方式。",
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: salon } = await supabase
      .from('salon_profiles')
      .select('salon_name, description, image_src, district_name, tags')
      .eq('id', params.id)
      .maybeSingle();

    if (!salon) {
      return {
        title: "美容院詳情 | Beauty100",
        description: "查看美容院詳細資訊、服務項目及聯絡方式。",
      };
    }

    const title = salon.salon_name
      ? `${salon.salon_name}${salon.district_name ? ` - ${salon.district_name}` : ''} | Beauty100`
      : "美容院詳情 | Beauty100";
    const description = salon.description || "查看美容院詳細資訊、服務項目及聯絡方式。";
    const salonUrl = `${siteUrl}/salon/${params.id}`;

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        title,
        description,
        url: salonUrl,
        siteName: 'Beauty100',
        locale: 'zh_HK',
        images: salon.image_src ? [{ url: salon.image_src, width: 1200, height: 630, alt: salon.salon_name || '' }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: salon.image_src ? [salon.image_src] : undefined,
      },
      alternates: {
        canonical: salonUrl,
      },
    };
  } catch {
    return {
      title: "美容院詳情 | Beauty100",
      description: "查看美容院詳細資訊、服務項目及聯絡方式。",
    };
  }
}

export default function SalonDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
