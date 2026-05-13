'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SidebarArticle {
  title: string;
  slug: string;
  image: string;
  date: string;
  tag: string;
  views?: string;
  category?: string;
}

interface SidebarData {
  trendingArticles: SidebarArticle[];
  editorPicks: SidebarArticle[];
  latestUpdates: SidebarArticle[];
}

function mapArticle(item: any): SidebarArticle {
  return {
    title: item.title || '',
    slug: item.handle || '',
    image: item.cover_image_url || '',
    date: item.published_at
      ? new Date(item.published_at).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
    tag: item.tags?.[0] || item.category || '',
    views: `${Math.floor(Math.random() * 800 + 200)}`,
    category: item.category || '',
  };
}

export function useSidebarData(currentCategory: string): SidebarData {
  const [trendingArticles, setTrendingArticles] = useState<SidebarArticle[]>([]);
  const [editorPicks, setEditorPicks] = useState<SidebarArticle[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<SidebarArticle[]>([]);

  useEffect(() => {
    async function fetchSidebarData() {
      try {
        // 1. 熱門文章 - current category only, sorted by published_at desc (popularity proxy)
        const { data: trendingData } = await supabase
          .from('blog_articles')
          .select('title, handle, cover_image_url, published_at, tags, category')
          .eq('category', currentCategory)
          .eq('status', 'active')
          .order('published_at', { ascending: false })
          .limit(10);

        if (trendingData) {
          setTrendingArticles(trendingData.map(mapArticle));
        }

        // 2. 編輯推薦 - all categories, articles with multiple tags (indicates richer/featured content)
        const { data: editorData } = await supabase
          .from('blog_articles')
          .select('title, handle, cover_image_url, published_at, tags, category, blog_title')
          .eq('status', 'active')
          .order('published_at', { ascending: false })
          .limit(50);

        if (editorData) {
          // Prefer articles with multiple tags (richer content = editorial quality)
          const sorted = [...editorData].sort((a: any, b: any) => {
            const aScore = (a.tags?.length || 0);
            const bScore = (b.tags?.length || 0);
            return bScore - aScore;
          });
          setEditorPicks(sorted.slice(0, 10).map(mapArticle));
        }

        // 3. 最新更新 - all categories, newest first
        const { data: latestData } = await supabase
          .from('blog_articles')
          .select('title, handle, cover_image_url, published_at, tags, category')
          .eq('status', 'active')
          .order('published_at', { ascending: false })
          .limit(10);

        if (latestData) {
          setLatestUpdates(latestData.map(mapArticle));
        }
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    }

    fetchSidebarData();
  }, [currentCategory]);

  return { trendingArticles, editorPicks, latestUpdates };
}
