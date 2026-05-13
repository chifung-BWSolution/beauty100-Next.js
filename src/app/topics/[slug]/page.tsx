'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import {
  Clock, Eye, Share2, Bookmark, Link2, ChevronRight,
  ArrowRight, Flame, Star, TrendingUp, Tag, User,
  Calendar, RefreshCw, MessageCircle, ThumbsUp, ArrowLeft,
  X, ChevronLeft, ZoomIn, ImageIcon,
} from 'lucide-react';
import { HorizontalBannerAd, InContentAd, PromotionalBlock, SidebarAdUnit } from '@/components/ads/AdComponents';
import { supabase } from '@/lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   TYPES & DATA
   ═══════════════════════════════════════════════════════════════ */

interface ArticleData {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  heroCaption?: string;
  category: string;
  categorySlug: string;
  tag: string;
  tags: string[];
  author: string;
  authorAvatar: string;
  publishDate: string;
  publishTime: string;
  updatedDate?: string;
  updatedTime?: string;
  views: string;
  readTime: string;
  body: ContentBlock[];
}

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bold-paragraph'; text: string }
  | { type: 'image'; src: string; caption?: string }
  | { type: 'gallery'; images: GalleryImage[] }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'list'; ordered?: boolean; items: string[] };

interface RelatedArticle {
  slug: string;
  title: string;
  image: string;
  tag: string;
  date: string;
  views: string;
  category?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80';
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80';

/* Category slug (English) → Chinese label mapping */
const CATEGORY_SLUG_TO_LABEL: Record<string, string> = {
  'facial-care': '面部護理',
  'anti-aging': '回復青春',
  'skincare': '化妝護膚',
  'healthy-diet': '飲食健康',
  'body-care': '身體保養',
  'body-shaping': '身體塑形',
  'trending-topics': '焦點話題',
  'entertainment': '娛樂圈',
};

/* Category → Route mapping (supports both Chinese labels and English slugs) */
const CATEGORY_ROUTE_MAP: Record<string, { label: string; href: string }> = {
  '面部護理': { label: '面部護理', href: '/facial-care' },
  '回復青春': { label: '回復青春', href: '/anti-aging' },
  '化妝護膚': { label: '化妝護膚', href: '/skincare' },
  '飲食健康': { label: '飲食健康', href: '/healthy-diet' },
  '身體保養': { label: '身體保養', href: '/body-care' },
  '身體塑形': { label: '身體塑形', href: '/body-shaping' },
  '焦點話題': { label: '焦點話題', href: '/topics' },
  '娛樂': { label: '娛樂', href: '/entertainment' },
  '娛樂圈': { label: '娛樂圈', href: '/entertainment' },
  // English slug keys
  'facial-care': { label: '面部護理', href: '/facial-care' },
  'anti-aging': { label: '回復青春', href: '/anti-aging' },
  'skincare': { label: '化妝護膚', href: '/skincare' },
  'healthy-diet': { label: '飲食健康', href: '/healthy-diet' },
  'body-care': { label: '身體保養', href: '/body-care' },
  'body-shaping': { label: '身體塑形', href: '/body-shaping' },
  'trending-topics': { label: '焦點話題', href: '/topics' },
  'entertainment': { label: '娛樂圈', href: '/entertainment' },
};

function getCategoryRoute(category: string): { label: string; href: string } {
  if (CATEGORY_ROUTE_MAP[category]) return CATEGORY_ROUTE_MAP[category];
  // Try resolving via slug-to-label mapping
  const chineseLabel = CATEGORY_SLUG_TO_LABEL[category];
  if (chineseLabel && CATEGORY_ROUTE_MAP[chineseLabel]) return CATEGORY_ROUTE_MAP[chineseLabel];
  // Fallback: construct route from slug if it looks like a valid slug
  if (category && /^[a-z\-]+$/.test(category)) {
    return { label: CATEGORY_SLUG_TO_LABEL[category] || category, href: `/${category}` };
  }
  return CATEGORY_ROUTE_MAP[category] || { label: category || '焦點話題', href: '/topics' };
}

/** Resolve English category slug to Traditional Chinese display label */
function getCategoryLabel(category: string): string {
  return CATEGORY_SLUG_TO_LABEL[category] || CATEGORY_ROUTE_MAP[category]?.label || category || '焦點話題';
}

/* Category → Theme mapping for article detail header */
interface CategoryTheme {
  badgeClass: string;
  badgeHoverClass: string;
  headerBg: string;
  accentGradient: string;
  iconColorClass: string;
  hoverTextClass: string;
  tagBgClass: string;
  tagTextClass: string;
  tagHoverBgClass: string;
  linkTextClass: string;
  linkHoverClass: string;
  promoFromClass: string;
  promoBorderClass: string;
  promoBtnBgClass: string;
  promoBtnHoverBgClass: string;
  promoBtnTextClass: string;
}

const CATEGORY_THEME_MAP: Record<string, CategoryTheme> = {
  '焦點話題': {
    badgeClass: 'bg-rose-500 text-white border-0',
    badgeHoverClass: 'hover:bg-rose-600',
    headerBg: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 30%, #fefce8 70%, #fdf2f8 100%)',
    accentGradient: 'linear-gradient(180deg, #f472b6, #e11d48)',
    iconColorClass: 'text-rose-500',
    hoverTextClass: 'hover:text-rose-500',
    tagBgClass: 'bg-rose-50',
    tagTextClass: 'text-rose-500',
    tagHoverBgClass: 'hover:bg-rose-100',
    linkTextClass: 'text-rose-500',
    linkHoverClass: 'hover:text-rose-600',
    promoFromClass: 'from-rose-50 via-pink-50 to-fuchsia-50',
    promoBorderClass: 'border-rose-100/50',
    promoBtnBgClass: 'bg-rose-100',
    promoBtnHoverBgClass: 'hover:bg-rose-200',
    promoBtnTextClass: 'text-rose-600 hover:text-rose-700',
  },
  '娛樂': {
    badgeClass: 'bg-fuchsia-500 text-white border-0',
    badgeHoverClass: 'hover:bg-fuchsia-600',
    headerBg: 'linear-gradient(135deg, #fdf4ff 0%, #fdf2f8 30%, #fef9c3 70%, #fdf4ff 100%)',
    accentGradient: 'linear-gradient(180deg, #e879f9, #a21caf)',
    iconColorClass: 'text-fuchsia-500',
    hoverTextClass: 'hover:text-fuchsia-500',
    tagBgClass: 'bg-fuchsia-50',
    tagTextClass: 'text-fuchsia-500',
    tagHoverBgClass: 'hover:bg-fuchsia-100',
    linkTextClass: 'text-fuchsia-500',
    linkHoverClass: 'hover:text-fuchsia-600',
    promoFromClass: 'from-fuchsia-50 via-pink-50 to-purple-50',
    promoBorderClass: 'border-fuchsia-100/50',
    promoBtnBgClass: 'bg-fuchsia-100',
    promoBtnHoverBgClass: 'hover:bg-fuchsia-200',
    promoBtnTextClass: 'text-fuchsia-600 hover:text-fuchsia-700',
  },
  '娛樂圈': {
    badgeClass: 'bg-fuchsia-500 text-white border-0',
    badgeHoverClass: 'hover:bg-fuchsia-600',
    headerBg: 'linear-gradient(135deg, #fdf4ff 0%, #fdf2f8 30%, #fef9c3 70%, #fdf4ff 100%)',
    accentGradient: 'linear-gradient(180deg, #e879f9, #a21caf)',
    iconColorClass: 'text-fuchsia-500',
    hoverTextClass: 'hover:text-fuchsia-500',
    tagBgClass: 'bg-fuchsia-50',
    tagTextClass: 'text-fuchsia-500',
    tagHoverBgClass: 'hover:bg-fuchsia-100',
    linkTextClass: 'text-fuchsia-500',
    linkHoverClass: 'hover:text-fuchsia-600',
    promoFromClass: 'from-fuchsia-50 via-pink-50 to-purple-50',
    promoBorderClass: 'border-fuchsia-100/50',
    promoBtnBgClass: 'bg-fuchsia-100',
    promoBtnHoverBgClass: 'hover:bg-fuchsia-200',
    promoBtnTextClass: 'text-fuchsia-600 hover:text-fuchsia-700',
  },
  '面部護理': {
    badgeClass: 'bg-teal-500 text-white border-0',
    badgeHoverClass: 'hover:bg-teal-600',
    headerBg: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 30%, #f0f9ff 70%, #f0fdfa 100%)',
    accentGradient: 'linear-gradient(180deg, #5eead4, #0d9488)',
    iconColorClass: 'text-teal-500',
    hoverTextClass: 'hover:text-teal-500',
    tagBgClass: 'bg-teal-50',
    tagTextClass: 'text-teal-500',
    tagHoverBgClass: 'hover:bg-teal-100',
    linkTextClass: 'text-teal-500',
    linkHoverClass: 'hover:text-teal-600',
    promoFromClass: 'from-teal-50 via-cyan-50 to-emerald-50',
    promoBorderClass: 'border-teal-100/50',
    promoBtnBgClass: 'bg-teal-100',
    promoBtnHoverBgClass: 'hover:bg-teal-200',
    promoBtnTextClass: 'text-teal-600 hover:text-teal-700',
  },
  '回復青春': {
    badgeClass: 'bg-purple-500 text-white border-0',
    badgeHoverClass: 'hover:bg-purple-600',
    headerBg: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 30%, #ede9fe 70%, #faf5ff 100%)',
    accentGradient: 'linear-gradient(180deg, #c084fc, #7c3aed)',
    iconColorClass: 'text-purple-500',
    hoverTextClass: 'hover:text-purple-500',
    tagBgClass: 'bg-purple-50',
    tagTextClass: 'text-purple-500',
    tagHoverBgClass: 'hover:bg-purple-100',
    linkTextClass: 'text-purple-500',
    linkHoverClass: 'hover:text-purple-600',
    promoFromClass: 'from-purple-50 via-violet-50 to-fuchsia-50',
    promoBorderClass: 'border-purple-100/50',
    promoBtnBgClass: 'bg-purple-100',
    promoBtnHoverBgClass: 'hover:bg-purple-200',
    promoBtnTextClass: 'text-purple-600 hover:text-purple-700',
  },
  '化妝護膚': {
    badgeClass: 'bg-fuchsia-500 text-white border-0',
    badgeHoverClass: 'hover:bg-fuchsia-600',
    headerBg: 'linear-gradient(135deg, #fdf4ff 0%, #fdf2f8 30%, #fff1f2 70%, #fdf4ff 100%)',
    accentGradient: 'linear-gradient(180deg, #f0abfc, #d946ef)',
    iconColorClass: 'text-fuchsia-500',
    hoverTextClass: 'hover:text-fuchsia-500',
    tagBgClass: 'bg-fuchsia-50',
    tagTextClass: 'text-fuchsia-500',
    tagHoverBgClass: 'hover:bg-fuchsia-100',
    linkTextClass: 'text-fuchsia-500',
    linkHoverClass: 'hover:text-fuchsia-600',
    promoFromClass: 'from-fuchsia-50 via-pink-50 to-rose-50',
    promoBorderClass: 'border-fuchsia-100/50',
    promoBtnBgClass: 'bg-fuchsia-100',
    promoBtnHoverBgClass: 'hover:bg-fuchsia-200',
    promoBtnTextClass: 'text-fuchsia-600 hover:text-fuchsia-700',
  },
  '身體保養': {
    badgeClass: 'bg-blue-500 text-white border-0',
    badgeHoverClass: 'hover:bg-blue-600',
    headerBg: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 30%, #ecfeff 70%, #eff6ff 100%)',
    accentGradient: 'linear-gradient(180deg, #93c5fd, #3b82f6)',
    iconColorClass: 'text-blue-500',
    hoverTextClass: 'hover:text-blue-500',
    tagBgClass: 'bg-blue-50',
    tagTextClass: 'text-blue-500',
    tagHoverBgClass: 'hover:bg-blue-100',
    linkTextClass: 'text-blue-500',
    linkHoverClass: 'hover:text-blue-600',
    promoFromClass: 'from-blue-50 via-sky-50 to-cyan-50',
    promoBorderClass: 'border-blue-100/50',
    promoBtnBgClass: 'bg-blue-100',
    promoBtnHoverBgClass: 'hover:bg-blue-200',
    promoBtnTextClass: 'text-blue-600 hover:text-blue-700',
  },
  '身體塑形': {
    badgeClass: 'bg-blue-500 text-white border-0',
    badgeHoverClass: 'hover:bg-blue-600',
    headerBg: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 30%, #ecfeff 70%, #eff6ff 100%)',
    accentGradient: 'linear-gradient(180deg, #93c5fd, #3b82f6)',
    iconColorClass: 'text-blue-500',
    hoverTextClass: 'hover:text-blue-500',
    tagBgClass: 'bg-blue-50',
    tagTextClass: 'text-blue-500',
    tagHoverBgClass: 'hover:bg-blue-100',
    linkTextClass: 'text-blue-500',
    linkHoverClass: 'hover:text-blue-600',
    promoFromClass: 'from-blue-50 via-sky-50 to-cyan-50',
    promoBorderClass: 'border-blue-100/50',
    promoBtnBgClass: 'bg-blue-100',
    promoBtnHoverBgClass: 'hover:bg-blue-200',
    promoBtnTextClass: 'text-blue-600 hover:text-blue-700',
  },
  '飲食健康': {
    badgeClass: 'bg-green-500 text-white border-0',
    badgeHoverClass: 'hover:bg-green-600',
    headerBg: 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 30%, #ecfeff 70%, #f0fdfa 100%)',
    accentGradient: 'linear-gradient(180deg, #86efac, #22c55e)',
    iconColorClass: 'text-green-500',
    hoverTextClass: 'hover:text-green-500',
    tagBgClass: 'bg-green-50',
    tagTextClass: 'text-green-500',
    tagHoverBgClass: 'hover:bg-green-100',
    linkTextClass: 'text-green-500',
    linkHoverClass: 'hover:text-green-600',
    promoFromClass: 'from-green-50 via-emerald-50 to-teal-50',
    promoBorderClass: 'border-green-100/50',
    promoBtnBgClass: 'bg-green-100',
    promoBtnHoverBgClass: 'hover:bg-green-200',
    promoBtnTextClass: 'text-green-600 hover:text-green-700',
  },
};

const DEFAULT_THEME: CategoryTheme = CATEGORY_THEME_MAP['焦點話題'];

function getCategoryTheme(category: string): CategoryTheme {
  // Try direct match first (Chinese label), then resolve English slug to Chinese label
  if (CATEGORY_THEME_MAP[category]) return CATEGORY_THEME_MAP[category];
  const chineseLabel = CATEGORY_SLUG_TO_LABEL[category];
  if (chineseLabel && CATEGORY_THEME_MAP[chineseLabel]) return CATEGORY_THEME_MAP[chineseLabel];
  return DEFAULT_THEME;
}

/* ═══════════════════════════════════════════════════════════════
   SUPABASE -> ARTICLE DATA MAPPING
   ═══════════════════════════════════════════════════════════════ */

function safeParseJson(value: any): any {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractTextFromRichText(data: any): string[] {
  // Handle Shopify rich_text_field format: { type: "root", children: [...] }
  if (data && typeof data === 'object' && data.type === 'root' && Array.isArray(data.children)) {
    const texts: string[] = [];
    function extractFromNode(node: any) {
      if (typeof node === 'string') {
        texts.push(node);
        return;
      }
      if (node?.type === 'paragraph' || node?.type === 'heading') {
        const text = extractChildrenText(node.children);
        if (text) texts.push(text);
      } else if (node?.type === 'list') {
        if (Array.isArray(node.children)) {
          node.children.forEach((li: any) => {
            const text = extractChildrenText(li.children);
            if (text) texts.push(text);
          });
        }
      } else if (Array.isArray(node?.children)) {
        node.children.forEach(extractFromNode);
      }
    }
    function extractChildrenText(children: any[]): string {
      if (!Array.isArray(children)) return '';
      return children.map((child: any) => {
        if (typeof child === 'string') return child;
        if (child?.type === 'text' && child?.value) return child.value;
        if (child?.children) return extractChildrenText(child.children);
        return '';
      }).join('');
    }
    data.children.forEach(extractFromNode);
    return texts.filter(Boolean);
  }
  return [];
}

function buildContentBlocks(record: any): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  try {
    // Intro
    if (record.intro) {
      const introData = safeParseJson(record.intro);
      if (Array.isArray(introData)) {
        introData.forEach((p: string) => {
          if (typeof p === 'string' && p.trim()) blocks.push({ type: 'paragraph', text: p });
        });
      } else if (typeof introData === 'string' && introData.trim()) {
        blocks.push({ type: 'paragraph', text: introData });
      } else if (introData?.text && typeof introData.text === 'string') {
        blocks.push({ type: 'paragraph', text: introData.text });
      } else if (introData?.type === 'root') {
        // Shopify rich text field format
        const texts = extractTextFromRichText(introData);
        texts.forEach((t) => blocks.push({ type: 'paragraph', text: t }));
      }
    }

    // Sections 1–5
    for (let i = 1; i <= 5; i++) {
      const title = record[`section_${i}_title`];
      const content = record[`section_${i}_content`];
      const images = record[`section_${i}_images`];

      if (title) {
        blocks.push({ type: 'heading', text: title });
      }

      if (content) {
        const contentData = safeParseJson(content);
        if (Array.isArray(contentData)) {
          contentData.forEach((p: string) => {
            if (typeof p === 'string' && p.trim()) blocks.push({ type: 'paragraph', text: p });
          });
        } else if (typeof contentData === 'string' && contentData.trim()) {
          blocks.push({ type: 'paragraph', text: contentData });
        } else if (contentData?.text && typeof contentData.text === 'string') {
          blocks.push({ type: 'paragraph', text: contentData.text });
        } else if (contentData?.type === 'root') {
          // Shopify rich text field format
          const texts = extractTextFromRichText(contentData);
          texts.forEach((t) => blocks.push({ type: 'paragraph', text: t }));
        }
      }

      if (images && Array.isArray(images) && images.length > 0) {
        if (images.length === 1) {
          blocks.push({ type: 'image', src: images[0], caption: title || '' });
        } else {
          blocks.push({
            type: 'gallery',
            images: images.map((src: string, idx: number) => ({
              src,
              alt: `${title || '圖片'} ${idx + 1}`,
              caption: '',
            })),
          });
        }
      }
    }
  } catch (err) {
    console.error('Error building content blocks:', err);
  }

  return blocks;
}

function mapSupabaseToArticle(record: any): ArticleData {
  const publishedAt = record.published_at ? new Date(record.published_at) : null;
  const publishDate = publishedAt
    ? publishedAt.toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const publishTime = publishedAt
    ? publishedAt.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' })
    : '';

  const body = buildContentBlocks(record);
  const wordCount = body
    .filter((b) => b.type === 'paragraph' || b.type === 'bold-paragraph')
    .reduce((acc, b) => acc + ((b as any).text?.length || 0), 0);
  const readTime = `${Math.max(1, Math.ceil(wordCount / 400))} 分鐘`;

  const rawCategory = record.category || record.blog_title || '美容護膚';
  const resolvedCategoryLabel = getCategoryLabel(rawCategory);

  return {
    slug: record.handle || '',
    title: record.title || '文章',
    description: record.seo_description || '',
    heroImage: record.cover_image_url || FALLBACK_IMAGE,
    heroCaption: record.cover_image_alt || '',
    category: resolvedCategoryLabel,
    categorySlug: rawCategory,
    tag: record.tags?.[0] || '美容',
    tags: Array.isArray(record.tags) ? record.tags.map((t: string) => t?.trim()).filter(Boolean) : [],
    author: record.author || '編輯部',
    authorAvatar: FALLBACK_AVATAR,
    publishDate,
    publishTime,
    views: `${Math.floor(Math.random() * 15 + 5)}K`,
    readTime,
    body: body.length > 0 ? body : [{ type: 'paragraph', text: record.seo_description || '暫無內容。' }],
  };
}

function mapSupabaseToRelated(record: any): RelatedArticle {
  const publishedAt = record.published_at ? new Date(record.published_at) : null;
  const date = publishedAt
    ? publishedAt.toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return {
    slug: record.handle || '',
    title: record.title || '',
    image: record.cover_image_url || FALLBACK_IMAGE,
    tag: record.tags?.[0] || '美容',
    date,
    views: `${Math.floor(Math.random() * 15 + 5)}K`,
    category: record.category || '',
  };
}

/** Get article detail path - route articles to their section-specific paths */
function getArticleDetailPath(slug: string, category?: string): string {
  if (category === 'anti-aging' || category === '回復青春') {
    return `/anti-aging/${encodeURIComponent(slug)}`;
  }
  if (category === 'body-care' || category === '身體保養') {
    return `/body-care/${encodeURIComponent(slug)}`;
  }
  if (category === 'skincare' || category === '化妝護膚') {
    return `/skincare/${encodeURIComponent(slug)}`;
  }
  if (category === 'healthy-diet' || category === '飲食健康') {
    return `/healthy-diet/${encodeURIComponent(slug)}`;
  }
  return `/topics/${encodeURIComponent(slug)}`;
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE GALLERY COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function LightboxViewer({
  images,
  initialIndex,
  onClose,
}: {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const image = images[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-sm"
        aria-label="關閉"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main content area */}
      <div className="relative flex flex-col lg:flex-row w-full h-full z-[1]">
        {/* Image area */}
        <div className="flex-1 flex items-center justify-center relative px-4 sm:px-12 lg:px-16 py-16 lg:py-8 min-h-0">
          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm z-10"
              aria-label="上一張"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={image.src}
            alt={image.alt}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm z-10"
              aria-label="下一張"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Caption side panel (desktop) / bottom panel (mobile) */}
        <div className="lg:w-[320px] shrink-0 bg-black/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="p-5 sm:p-6 lg:pt-20 h-full overflow-y-auto">
            {/* Image alt title */}
            <h3 className="text-white font-semibold text-base mb-3 leading-snug">
              {image.alt}
            </h3>

            {/* Caption / description */}
            {image.caption && (
              <p className="text-white/70 text-sm leading-relaxed">
                {image.caption}
              </p>
            )}

            {/* Thumbnail strip in lightbox */}
            {images.length > 1 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-white/40 text-sm font-medium mb-3 uppercase tracking-wide">
                  所有圖片
                </p>
                <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`relative rounded-lg overflow-hidden aspect-square transition-all ${
                        i === currentIndex
                          ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-black/60 opacity-100'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedIndex];

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.children[selectedIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex]);

  // If only one image, render normal single image
  if (images.length <= 1) {
    const img = images[0];
    return (
      <figure className="my-6">
        <div className="rounded-xl overflow-hidden">
          <img src={img.src} alt={img.alt} className="w-full h-auto object-cover" loading="lazy" />
        </div>
        {img.caption && (
          <figcaption className="text-[12px] text-slate-400 mt-2 text-center leading-relaxed">
            {img.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <>
      <figure className="my-6">
        {/* Main large image */}
        <div
          className="relative rounded-xl overflow-hidden cursor-zoom-in group shadow-sm"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="w-full h-auto aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {/* Zoom overlay hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm font-medium">
              <ZoomIn className="w-4 h-4" />
              點擊放大瀏覽
            </div>
          </div>
          {/* Image counter badge */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-white/90 text-[12px] font-medium">
            <ImageIcon className="w-3 h-3" />
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Alt text / caption area */}
        {selectedImage.caption && (
          <figcaption className="text-[14px] text-slate-500 mt-2.5 text-center leading-relaxed px-2">
            {selectedImage.caption}
          </figcaption>
        )}
        {selectedImage.alt && !selectedImage.caption && (
          <figcaption className="text-[12px] text-slate-400 mt-2 text-center leading-relaxed px-2">
            {selectedImage.alt}
          </figcaption>
        )}

        {/* Thumbnail strip */}
        <div
          ref={thumbnailStripRef}
          className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative shrink-0 w-[72px] h-[54px] sm:w-20 sm:h-[60px] rounded-lg overflow-hidden transition-all duration-200 ${
                i === selectedIndex
                  ? 'ring-2 ring-rose-400 ring-offset-1 ring-offset-white opacity-100 shadow-md'
                  : 'opacity-60 hover:opacity-90 border border-slate-200'
              }`}
              aria-label={img.alt || `圖片 ${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Active indicator dot */}
              {i === selectedIndex && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-rose-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </figure>

      {/* Lightbox */}
      {lightboxOpen && (
        <LightboxViewer
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ARTICLE BODY RENDERER
   ═══════════════════════════════════════════════════════════════ */

function ArticleBody({ blocks, theme }: { blocks: ContentBlock[]; theme: CategoryTheme }) {
  const midPoint = Math.floor(blocks.length / 2);
  return (
    <div className="article-body space-y-5">
      {blocks.map((block, idx) => {
        const rendered = (() => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="text-[15px] sm:text-base leading-[1.85] text-slate-700">
                {block.text}
              </p>
            );
          case 'bold-paragraph':
            return (
              <p key={idx} className={`text-[15px] sm:text-base leading-[1.85] text-slate-800 font-medium ${theme.tagBgClass}/50 border-l-3 pl-4 py-3 rounded-r-lg`} style={{ borderLeftColor: theme.accentGradient.includes('#') ? theme.accentGradient.split(', ')[1]?.replace(')', '') || '#e11d48' : '#e11d48' }}>
                {block.text}
              </p>
            );
          case 'heading':
            return (
              <h2
                key={idx}
                className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1 leading-snug"
              >
                <span
                  className="inline-block w-1 h-5 rounded-full mr-2.5 align-middle"
                  style={{ background: theme.accentGradient }}
                />
                {block.text}
              </h2>
            );
          case 'image':
            return (
              <figure key={idx} className="my-6">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={block.src}
                    alt={block.caption || ''}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-[12px] text-slate-400 mt-2 text-center leading-relaxed">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          case 'gallery':
            return <ImageGallery key={idx} images={block.images} />;
          case 'quote':
            return (
              <blockquote
                key={idx}
                className="relative my-6 pl-5 pr-4 py-4 rounded-xl"
                style={{ background: theme.headerBg }}
              >
                <div
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                  style={{ background: theme.accentGradient }}
                />
                <p className="text-[15px] sm:text-base leading-[1.8] text-slate-700 italic">
                  「{block.text}」
                </p>
                {block.author && (
                  <cite className={`block mt-2 text-[14px] ${theme.linkTextClass} font-medium not-italic`}>
                    — {block.author}
                  </cite>
                )}
              </blockquote>
            );
          case 'list':
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag
                key={idx}
                className={`space-y-2 pl-5 ${
                  block.ordered ? 'list-decimal' : 'list-disc'
                } marker:${theme.tagTextClass}`}
              >
                {block.items.map((item, i) => (
                  <li key={i} className="text-[15px] sm:text-base leading-[1.8] text-slate-700 pl-1">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          default:
            return null;
        }
        })();
        return (
          <React.Fragment key={idx}>
            {rendered}
            {idx === midPoint && <InContentAd />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ArticleToolbar({ onCopyLink, theme }: { onCopyLink: () => void; theme?: CategoryTheme }) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const t = theme || DEFAULT_THEME;

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 ${t.hoverTextClass} hover:${t.tagBgClass} transition-all border border-slate-200 hover:border-current`}
        title="複製連結"
      >
        <Link2 className="w-3.5 h-3.5" />
        {copied ? '已複製' : '複製連結'}
      </button>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 ${t.hoverTextClass} hover:${t.tagBgClass} transition-all border border-slate-200 hover:border-current`}
        title="分享"
      >
        <Share2 className="w-3.5 h-3.5" />
        分享
      </button>
      <button
        onClick={() => setBookmarked(!bookmarked)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
          bookmarked
            ? `${t.linkTextClass} ${t.tagBgClass} border-current`
            : `text-slate-500 ${t.hoverTextClass} hover:${t.tagBgClass} border-slate-200 hover:border-current`
        }`}
        title="收藏"
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        {bookmarked ? '已收藏' : '收藏'}
      </button>
    </div>
  );
}

function RelatedArticleCard({ article, theme }: { article: RelatedArticle; theme?: CategoryTheme }) {
  const t = theme || DEFAULT_THEME;
  return (
    <Link
      href={getArticleDetailPath(article.slug, article.category)}
      className="group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-slate-100/80 block"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge className={`${t.badgeClass} text-[14px] shadow-sm`}>
            {article.tag}
          </Badge>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className={`font-bold text-slate-800 text-[14px] mb-2 line-clamp-2 group-hover:${t.tagTextClass} transition-colors leading-snug`}>
          {article.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Clock className="w-3 h-3" />
            {article.date}
          </span>
          <span className="flex items-center gap-1 text-[14px] text-slate-400">
            <Eye className="w-3 h-3" />
            {article.views}
          </span>
        </div>
      </div>
    </Link>
  );
}

function HotTopicCard({ article, theme }: { article: RelatedArticle; theme?: CategoryTheme }) {
  const t = theme || DEFAULT_THEME;
  return (
    <Link
      href={getArticleDetailPath(article.slug, article.category)}
      className="group flex gap-3.5 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-24 h-[68px] rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className={`${t.tagBgClass} ${t.tagTextClass} border-0 text-[12px] w-fit mb-1`}>
          {article.tag}
        </Badge>
        <h4 className={`text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:${t.tagTextClass} transition-colors leading-snug`}>
          {article.title}
        </h4>
        <span className="flex items-center gap-1 text-[14px] text-slate-400 mt-1">
          <Eye className="w-2.5 h-2.5" />
          {article.views} 瀏覽
        </span>
      </div>
    </Link>
  );
}

function SidebarSection({
  title,
  icon: Icon,
  children,
  theme,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  theme?: CategoryTheme;
}) {
  const t = theme || DEFAULT_THEME;
  return (
    <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3.5">
        <span
          className="w-1 h-4 rounded-full"
          style={{ background: t.accentGradient }}
        />
        <Icon className={`w-3.5 h-3.5 ${t.iconColorClass}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function TopicArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [hotTopics, setHotTopics] = useState<RelatedArticle[]>([]);
  const [sidebarTrending, setSidebarTrending] = useState<RelatedArticle[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        // Decode the slug in case of URL encoding issues
        const decodedSlug = decodeURIComponent(slug);
        
        // Fetch main article by handle (slug) - try exact match first
        let { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('handle', decodedSlug)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error fetching article:', error);
        }

        // If not found, try with trimmed slug (handles whitespace issues)
        if (!data && decodedSlug.trim() !== decodedSlug) {
          const trimResult = await supabase
            .from('blog_articles')
            .select('*')
            .eq('handle', decodedSlug.trim())
            .eq('status', 'active')
            .maybeSingle();
          if (trimResult.data) data = trimResult.data;
        }

        // If still not found, try case-insensitive search using ilike
        if (!data) {
          const ilikeResult = await supabase
            .from('blog_articles')
            .select('*')
            .ilike('handle', decodedSlug)
            .eq('status', 'active')
            .maybeSingle();
          if (ilikeResult.data) data = ilikeResult.data;
        }

        // If still not found, try without status filter (article might have status issue)
        if (!data) {
          const noStatusResult = await supabase
            .from('blog_articles')
            .select('*')
            .eq('handle', decodedSlug)
            .maybeSingle();
          if (noStatusResult.data) data = noStatusResult.data;
        }

        // Last resort: try partial match with like (handles encoding differences)
        if (!data) {
          const likeResult = await supabase
            .from('blog_articles')
            .select('*')
            .like('handle', `%${decodedSlug}%`)
            .limit(1)
            .maybeSingle();
          if (likeResult.data) data = likeResult.data;
        }

        // Try with the raw slug (before decodeURIComponent) if different
        if (!data && slug !== decodedSlug) {
          const rawResult = await supabase
            .from('blog_articles')
            .select('*')
            .eq('handle', slug)
            .maybeSingle();
          if (rawResult.data) data = rawResult.data;
        }

        if (!data) {
          console.warn('Article not found for slug:', slug, 'decoded:', decodedSlug);
          setLoading(false);
          return;
        }

        const mapped = mapSupabaseToArticle(data);
        setArticle(mapped);

        // Fetch related articles (same category, excluding current)
        const { data: relatedData } = await supabase
          .from('blog_articles')
          .select('handle, title, cover_image_url, tags, published_at, category')
          .eq('status', 'active')
          .eq('category', data.category || '')
          .neq('handle', slug)
          .order('published_at', { ascending: false })
          .limit(8);

        if (relatedData && relatedData.length > 0) {
          // Deduplicate by title to avoid showing duplicate articles
          const seen = new Set<string>();
          const uniqueRelated = relatedData.filter((item) => {
            const key = item.title?.trim().toLowerCase() || '';
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setRelatedArticles(uniqueRelated.slice(0, 4).map(mapSupabaseToRelated));
        }

        // Fetch hot topics (latest articles from other categories)
        const { data: hotData } = await supabase
          .from('blog_articles')
          .select('handle, title, cover_image_url, tags, published_at, category')
          .eq('status', 'active')
          .neq('handle', slug)
          .neq('category', data.category || '')
          .order('published_at', { ascending: false })
          .limit(8);

        if (hotData && hotData.length > 0) {
          const seenHot = new Set<string>();
          const uniqueHot = hotData.filter((item) => {
            const key = item.title?.trim().toLowerCase() || '';
            if (seenHot.has(key)) return false;
            seenHot.add(key);
            return true;
          });
          setHotTopics(uniqueHot.slice(0, 4).map(mapSupabaseToRelated));
        } else {
          // Fallback: latest articles excluding current
          const { data: fallbackHot } = await supabase
            .from('blog_articles')
            .select('handle, title, cover_image_url, tags, published_at, category')
            .eq('status', 'active')
            .neq('handle', slug)
            .order('published_at', { ascending: false })
            .limit(8);
          if (fallbackHot) {
            const seenFb = new Set<string>();
            const uniqueFb = fallbackHot.filter((item) => {
              const key = item.title?.trim().toLowerCase() || '';
              if (seenFb.has(key)) return false;
              seenFb.add(key);
              return true;
            });
            setHotTopics(uniqueFb.slice(0, 4).map(mapSupabaseToRelated));
          }
        }

        // Sidebar trending (latest articles)
        const { data: trendingData } = await supabase
          .from('blog_articles')
          .select('handle, title, cover_image_url, tags, published_at')
          .eq('status', 'active')
          .neq('handle', slug)
          .order('published_at', { ascending: false })
          .limit(10);

        if (trendingData) {
          const seenTrending = new Set<string>();
          const uniqueTrending = trendingData.filter((item) => {
            const key = item.title?.trim().toLowerCase() || '';
            if (seenTrending.has(key)) return false;
            seenTrending.add(key);
            return true;
          });
          setSidebarTrending(uniqueTrending.slice(0, 5).map(mapSupabaseToRelated));
        }

        // Extract popular tags
        const { data: allArticles } = await supabase
          .from('blog_articles')
          .select('tags')
          .eq('status', 'active');

        if (allArticles) {
          const tagCounts: Record<string, number> = {};
          allArticles.forEach((item: any) => {
            if (item.tags && Array.isArray(item.tags)) {
              item.tags.forEach((t: string) => {
                const trimmed = t && t.trim();
                if (trimmed) {
                  tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
                }
              });
            }
          });
          const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag)
            .slice(0, 16);
          setPopularTags(sortedTags);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-50">
              <Clock className="w-7 h-7 text-rose-300 animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">載入中...</h3>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-slate-50">
              <ImageIcon className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">找不到文章</h3>
            <p className="text-sm text-slate-400 mb-4">此文章可能已被移除或不存在。</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 text-slate-500 font-medium hover:text-slate-700 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                重新載入
              </button>
              <Link href="/topics" className="inline-flex items-center gap-1.5 text-rose-500 font-medium hover:text-rose-600">
                <ArrowLeft className="w-4 h-4" />
                返回文章列表
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const theme = getCategoryTheme(article.category);
  const categoryRoute = getCategoryRoute(article.category);

  return (
    <PublicLayout activeHref={categoryRoute.href}>
      {/* ═══════════ 1. BREADCRUMB & TOP INFO ═══════════ */}
      <section
        className="border-b border-slate-100"
        style={{ background: theme.headerBg }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[14px] text-slate-400 mb-4">
            <Link href="/" className={`${theme.hoverTextClass} transition-colors`}>
              首頁
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={getCategoryRoute(article.category).href} className={`${theme.hoverTextClass} transition-colors`}>
              {getCategoryRoute(article.category).label}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className={`${theme.linkTextClass} font-medium`}>{article.title.length > 20 ? article.title.substring(0, 20) + '...' : article.title}</span>
          </nav>

          {/* Category tag */}
          <Link href={getCategoryRoute(article.category).href}>
            <Badge className={`${theme.badgeClass} text-[12px] shadow-sm mb-3 ${theme.badgeHoverClass} transition-colors cursor-pointer`}>
              {article.category}
            </Badge>
          </Link>

          {/* ═══════════ 2. ARTICLE TITLE ═══════════ */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
            {article.title}
          </h1>

          {/* ═══════════ 3. METADATA ROW ═══════════ */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-slate-400">
            {/* Author */}
            <div className="flex items-center gap-2">
              <img
                src={article.authorAvatar}
                alt={article.author}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="font-medium text-slate-600">{article.author}</span>
            </div>
            <span className="hidden sm:inline text-slate-200">|</span>
            {/* Publish date */}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              發佈於 {article.publishDate} {article.publishTime}
            </span>
            {/* Updated date */}
            {article.updatedDate && (
              <>
                <span className="hidden sm:inline text-slate-200">|</span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  更新於 {article.updatedDate} {article.updatedTime}
                </span>
              </>
            )}
            <span className="hidden sm:inline text-slate-200">|</span>
            {/* Views & read time */}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views} 瀏覽
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} 閱讀
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTENT AREA ═══════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Content Column ── */}
          <article className="flex-1 min-w-0 max-w-[760px]">
            {/* ═══════════ 4. HERO IMAGE ═══════════ */}
            <figure className="mb-6">
              <div className="rounded-xl overflow-hidden shadow-sm">
                <img
                  src={article.heroImage}
                  alt={article.title}
                  className="w-full h-auto aspect-[16/9] object-cover"
                />
              </div>
              {article.heroCaption && (
                <figcaption className="text-[12px] text-slate-400 mt-2.5 text-center leading-relaxed px-4">
                  {article.heroCaption}
                </figcaption>
              )}
            </figure>

            {/* ═══════════ AD: Below Hero Image ═══════════ */}
            <InContentAd />

            {/* ═══════════ 7. ARTICLE TOOLS ═══════════ */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
              <ArticleToolbar onCopyLink={handleCopyLink} theme={theme} />
              <div className="hidden sm:flex items-center gap-3 text-[12px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  留言
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  讚好
                </span>
              </div>
            </div>

            {/* ═══════════ 5 & 6. ARTICLE BODY ═══════════ */}
            <ArticleBody blocks={article.body} theme={theme} />

            {/* ── Article footer ── */}
            <div className="mt-10 pt-6 border-t border-slate-100">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {article.tags.length > 0 ? article.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/topics/tag/${encodeURIComponent(t)}`}
                    className={`text-[14px] px-2.5 py-1 rounded-full ${theme.tagBgClass} ${theme.tagTextClass} font-medium ${theme.tagHoverBgClass} transition-colors`}
                  >
                    {t}
                  </Link>
                )) : (
                  <Link
                    href={getCategoryRoute(article.category).href}
                    className={`text-[14px] px-2.5 py-1 rounded-full ${theme.tagBgClass} ${theme.tagTextClass} font-medium ${theme.tagHoverBgClass} transition-colors`}
                  >
                    {article.category}
                  </Link>
                )}
              </div>

              {/* Bottom tools (mobile) */}
              <div className="sm:hidden mb-6">
                <ArticleToolbar onCopyLink={handleCopyLink} theme={theme} />
              </div>

              {/* Back link */}
              <Link
                href={getCategoryRoute(article.category).href}
                className={`inline-flex items-center gap-1.5 text-[14px] ${theme.linkTextClass} font-medium ${theme.linkHoverClass} transition-colors`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回{getCategoryRoute(article.category).label}
              </Link>
            </div>

            {/* ═══════════ 8. RELATED ARTICLES ═══════════ */}
            {relatedArticles.length > 0 && (
            <section className="mt-10">
              {/* AD: Promotional Block Near Related Articles */}
              <div className={`mb-8 relative rounded-2xl overflow-hidden bg-gradient-to-r ${theme.promoFromClass} border ${theme.promoBorderClass} p-5`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className={`text-[14px] ${theme.linkTextClass} font-semibold mb-0.5`}>精選推薦</p>
                    <h4 className="text-sm font-bold text-slate-700">探索更多美容專題文章</h4>
                    <p className="text-[12px] text-slate-500 mt-0.5">由編輯團隊嚴選嘅深度分析同專家觀點</p>
                  </div>
                  <Link href={getCategoryRoute(article.category).href} className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold ${theme.promoBtnTextClass} ${theme.promoBtnBgClass} ${theme.promoBtnHoverBgClass} px-4 py-2 rounded-full transition-colors`}>
                    瀏覽更多
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <span className="absolute top-1.5 right-2.5 text-[7px] text-slate-300 uppercase tracking-wider">廣告</span>
              </div>

              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: theme.accentGradient }}
                />
                相關文章
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((ra, i) => (
                    <RelatedArticleCard key={i} article={ra} theme={theme} />
                  ))}
              </div>
            </section>
            )}

            {/* ═══════════ 9. HOT TOPICS ═══════════ */}
            {hotTopics.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: theme.accentGradient }}
                />
                <Flame className={`w-4 h-4 ${theme.iconColorClass}`} />
                熱門焦點
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hotTopics.map((ht, i) => (
                  <HotTopicCard key={i} article={ht} theme={theme} />
                ))}
              </div>
            </section>
            )}

            {/* ── Extended reading (mobile only) ── */}
            {relatedArticles.length > 0 && (
            <section className="mt-10 lg:hidden">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: theme.accentGradient }}
                />
                <TrendingUp className={`w-4 h-4 ${theme.iconColorClass}`} />
                延伸閱讀
              </h2>
              <div className="space-y-3">
                {relatedArticles.map((ra, i) => (
                  <HotTopicCard key={i} article={ra} theme={theme} />
                ))}
              </div>
            </section>
            )}
          </article>

          {/* ═══════════ 10. DESKTOP SIDEBAR ═══════════ */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-5">
            {/* 熱門文章 */}
            <SidebarSection title="熱門文章" icon={Flame} theme={theme}>
              <div className="space-y-3">
                {sidebarTrending.map((sa, i) => (
                  <Link
                    key={i}
                    href={`/topics/${encodeURIComponent(sa.slug)}`}
                    className={`group flex items-start gap-3 hover:${theme.tagBgClass}/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors`}
                  >
                    <span className={`text-lg font-bold ${theme.tagTextClass}/40 shrink-0 w-6 text-right leading-tight`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className={`text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:${theme.tagTextClass} transition-colors leading-snug`}>
                        {sa.title}
                      </h4>
                      <span className="text-[14px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        {sa.views} 瀏覽
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>

            {/* 編輯推薦 */}
            {relatedArticles.length > 0 && (
            <SidebarSection title="編輯推薦" icon={Star} theme={theme}>
              <div className="space-y-2.5">
                {relatedArticles.slice(0, 4).map((pick, i) => (
                  <Link
                    key={i}
                    href={`/topics/${encodeURIComponent(pick.slug)}`}
                    className={`group flex items-center gap-2.5 hover:${theme.tagBgClass}/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${theme.iconColorClass}/60 shrink-0`} />
                    <div className="min-w-0">
                      <h4 className={`text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:${theme.tagTextClass} transition-colors`}>
                        {pick.title}
                      </h4>
                      <span className={`text-[12px] ${theme.tagTextClass} font-medium`}>
                        {pick.tag}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>
            )}

            {/* 最新更新 */}
            {sidebarTrending.length > 0 && (
            <SidebarSection title="最新更新" icon={TrendingUp} theme={theme}>
              <div className="space-y-2.5">
                {sidebarTrending.slice(0, 4).map((sa, i) => (
                  <Link
                    key={i}
                    href={`/topics/${encodeURIComponent(sa.slug)}`}
                    className={`group flex gap-3 items-start hover:${theme.tagBgClass}/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors`}
                  >
                    <img
                      src={sa.image || FALLBACK_IMAGE}
                      alt={sa.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className={`text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:${theme.tagTextClass} transition-colors leading-snug`}>
                        {sa.title}
                      </h4>
                      <span className="text-[12px] text-slate-400">{sa.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </SidebarSection>
            )}

            {/* 熱門標籤 */}
            {popularTags.length > 0 && (
            <SidebarSection title="熱門標籤" icon={Tag} theme={theme}>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/topics/tag/${encodeURIComponent(tag)}`}
                    className={`text-[14px] px-2.5 py-1 rounded-full ${theme.tagBgClass} ${theme.tagTextClass} font-medium ${theme.tagHoverBgClass} transition-colors`}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </SidebarSection>
            )}

            {/* Sidebar Ad Unit */}
            <SidebarAdUnit variant="default" />
          </aside>
        </div>
      </div>

      {/* ═══════════ MOBILE SIDEBAR MODULES ═══════════ */}
      <div className="lg:hidden max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 space-y-6">
        {/* 熱門標籤 */}
        {popularTags.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span
              className="w-1 h-4 rounded-full"
              style={{ background: theme.accentGradient }}
            />
            <Tag className={`w-3.5 h-3.5 ${theme.iconColorClass}`} />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/topics/tag/${encodeURIComponent(tag)}`}
                className={`text-[14px] px-2.5 py-1 rounded-full ${theme.tagBgClass} ${theme.tagTextClass} font-medium ${theme.tagHoverBgClass} transition-colors`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
        )}

        {/* 編輯推薦 */}
        {relatedArticles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span
              className="w-1 h-4 rounded-full"
              style={{ background: theme.accentGradient }}
            />
            <Star className={`w-3.5 h-3.5 ${theme.iconColorClass}`} />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {relatedArticles.slice(0, 4).map((pick, i) => (
              <Link
                key={i}
                href={`/topics/${encodeURIComponent(pick.slug)}`}
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className={`w-3.5 h-3.5 ${theme.iconColorClass}/60 shrink-0`} />
                <div>
                  <h4 className={`text-[14px] font-medium text-slate-700 group-hover:${theme.tagTextClass} transition-colors`}>
                    {pick.title}
                  </h4>
                  <span className={`text-[12px] ${theme.tagTextClass} font-medium`}>{pick.tag}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        )}

        {/* 熱門文章 */}
        {sidebarTrending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <span
              className="w-1 h-4 rounded-full"
              style={{ background: theme.accentGradient }}
            />
            <Flame className={`w-3.5 h-3.5 ${theme.iconColorClass}`} />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {sidebarTrending.map((sa, i) => (
              <Link
                key={i}
                href={`/topics/${encodeURIComponent(sa.slug)}`}
                className="group flex items-start gap-3 py-1"
              >
                <span className={`text-base font-bold ${theme.tagTextClass}/40 shrink-0 w-5 text-right leading-tight`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className={`text-[14px] font-medium text-slate-700 group-hover:${theme.tagTextClass} transition-colors leading-snug`}>
                    {sa.title}
                  </h4>
                  <span className="text-[14px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Eye className="w-2.5 h-2.5" />
                    {sa.views} 瀏覽
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        )}
      </div>
    </PublicLayout>
  );
}
