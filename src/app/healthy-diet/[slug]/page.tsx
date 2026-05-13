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
  X, ChevronLeft, ZoomIn, ImageIcon, Leaf,
} from 'lucide-react';
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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80';
const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80';

/* Theme for 飲食健康 */
const HEALTHY_DIET_THEME = {
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
};

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
        const texts = extractTextFromRichText(introData);
        texts.forEach((t) => blocks.push({ type: 'paragraph', text: t }));
      }
    }

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

  return {
    slug: record.handle || '',
    title: record.title || '文章',
    description: record.seo_description || '',
    heroImage: record.cover_image_url || FALLBACK_IMAGE,
    heroCaption: record.cover_image_alt || '',
    category: '飲食健康',
    categorySlug: 'healthy-diet',
    tag: record.tags?.[0] || '飲食健康',
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
    tag: record.tags?.[0] || '飲食健康',
    date,
    views: `${Math.floor(Math.random() * 15 + 5)}K`,
    category: record.category || '',
  };
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
      <div className="absolute inset-0 bg-black/95" onClick={onClose} />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all backdrop-blur-sm"
        aria-label="關閉"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </div>
      <div className="relative flex flex-col lg:flex-row w-full h-full z-[1]">
        <div className="flex-1 flex items-center justify-center relative px-4 sm:px-12 lg:px-16 py-16 lg:py-8 min-h-0">
          {images.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all backdrop-blur-sm z-10"
              aria-label="上一張"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <img
            src={image.src}
            alt={image.alt}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            draggable={false}
          />
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
        <div className="lg:w-[320px] shrink-0 bg-black/60 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="p-5 sm:p-6 lg:pt-20 h-full overflow-y-auto">
            <h3 className="text-white font-semibold text-base mb-3 leading-snug">
              {image.alt}
            </h3>
            {image.caption && (
              <p className="text-white/70 text-sm leading-relaxed">
                {image.caption}
              </p>
            )}
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
                          ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-black/60 opacity-100'
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

  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.children[selectedIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIndex]);

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
        <div
          className="relative rounded-xl overflow-hidden cursor-zoom-in group shadow-sm"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="w-full h-auto aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm font-medium">
              <ZoomIn className="w-4 h-4" />
              點擊放大瀏覽
            </div>
          </div>
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-white/90 text-[12px] font-medium">
            <ImageIcon className="w-3 h-3" />
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
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
                  ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-white opacity-100 shadow-md'
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
              {i === selectedIndex && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </figure>
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

function ArticleBody({ blocks }: { blocks: ContentBlock[] }) {
  const theme = HEALTHY_DIET_THEME;
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
              <p key={idx} className="text-[15px] sm:text-base leading-[1.85] text-slate-800 font-medium bg-green-50/50 border-l-3 pl-4 py-3 rounded-r-lg" style={{ borderLeftColor: '#22c55e' }}>
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
                  <cite className="block mt-2 text-[14px] text-green-500 font-medium not-italic">
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
                } marker:text-green-500`}
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
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function ArticleToolbar({ onCopyLink }: { onCopyLink: () => void }) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 hover:text-green-500 hover:bg-green-50 transition-all border border-slate-200 hover:border-current"
        title="複製連結"
      >
        <Link2 className="w-3.5 h-3.5" />
        {copied ? '已複製' : '複製連結'}
      </button>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-slate-500 hover:text-green-500 hover:bg-green-50 transition-all border border-slate-200 hover:border-current"
        title="分享"
      >
        <Share2 className="w-3.5 h-3.5" />
        分享
      </button>
      <button
        onClick={() => setBookmarked(!bookmarked)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${
          bookmarked
            ? 'text-green-500 bg-green-50 border-current'
            : 'text-slate-500 hover:text-green-500 hover:bg-green-50 border-slate-200 hover:border-current'
        }`}
        title="收藏"
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        {bookmarked ? '已收藏' : '收藏'}
      </button>
    </div>
  );
}

function RelatedArticleCard({ article }: { article: RelatedArticle }) {
  return (
    <Link
      href={`/healthy-diet/${encodeURIComponent(article.slug)}`}
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
          <Badge className="bg-green-500 text-white border-0 text-[14px] shadow-sm">
            {article.tag}
          </Badge>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-slate-800 text-[14px] mb-2 line-clamp-2 group-hover:text-green-500 transition-colors leading-snug">
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

function HotTopicCard({ article }: { article: RelatedArticle }) {
  return (
    <Link
      href={`/healthy-diet/${encodeURIComponent(article.slug)}`}
      className="group flex gap-3.5 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 p-3"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-24 h-[68px] rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="flex flex-col justify-center min-w-0">
        <Badge className="bg-green-50 text-green-500 border-0 text-[12px] w-fit mb-1">
          {article.tag}
        </Badge>
        <h4 className="text-[14px] font-semibold text-slate-700 line-clamp-2 group-hover:text-green-500 transition-colors leading-snug">
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
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3.5">
        <span
          className="w-1 h-4 rounded-full"
          style={{ background: HEALTHY_DIET_THEME.accentGradient }}
        />
        <Icon className="w-3.5 h-3.5 text-green-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function HealthyDietArticlePage() {
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
        const decodedSlug = decodeURIComponent(slug);
        
        let { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('handle', decodedSlug)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error fetching article:', error);
        }

        if (!data && decodedSlug.trim() !== decodedSlug) {
          const trimResult = await supabase
            .from('blog_articles')
            .select('*')
            .eq('handle', decodedSlug.trim())
            .eq('status', 'active')
            .maybeSingle();
          if (trimResult.data) data = trimResult.data;
        }

        if (!data) {
          const ilikeResult = await supabase
            .from('blog_articles')
            .select('*')
            .ilike('handle', decodedSlug)
            .eq('status', 'active')
            .maybeSingle();
          if (ilikeResult.data) data = ilikeResult.data;
        }

        if (!data) {
          const noStatusResult = await supabase
            .from('blog_articles')
            .select('*')
            .eq('handle', decodedSlug)
            .maybeSingle();
          if (noStatusResult.data) data = noStatusResult.data;
        }

        if (!data) {
          const likeResult = await supabase
            .from('blog_articles')
            .select('*')
            .like('handle', `%${decodedSlug}%`)
            .limit(1)
            .maybeSingle();
          if (likeResult.data) data = likeResult.data;
        }

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

        // Fetch related articles (same category - healthy-diet)
        const { data: relatedData } = await supabase
          .from('blog_articles')
          .select('handle, title, cover_image_url, tags, published_at, category')
          .eq('status', 'active')
          .eq('category', 'healthy-diet')
          .neq('handle', slug)
          .order('published_at', { ascending: false })
          .limit(8);

        if (relatedData && relatedData.length > 0) {
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
          .neq('category', 'healthy-diet')
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

        // Sidebar trending
        const { data: trendingData } = await supabase
          .from('blog_articles')
          .select('handle, title, cover_image_url, tags, published_at, category')
          .eq('status', 'active')
          .eq('category', 'healthy-diet')
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

        // Extract popular tags from healthy-diet articles
        const { data: allArticles } = await supabase
          .from('blog_articles')
          .select('tags')
          .eq('status', 'active')
          .eq('category', 'healthy-diet');

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
      <PublicLayout activeHref="/healthy-diet">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-green-50">
              <Clock className="w-7 h-7 text-green-300 animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">載入中...</h3>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout activeHref="/healthy-diet">
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
              <Link href="/healthy-diet" className="inline-flex items-center gap-1.5 text-green-500 font-medium hover:text-green-600">
                <ArrowLeft className="w-4 h-4" />
                返回飲食健康
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const theme = HEALTHY_DIET_THEME;

  return (
    <PublicLayout activeHref="/healthy-diet">
      {/* ═══════════ 1. BREADCRUMB & TOP INFO ═══════════ */}
      <section
        className="border-b border-slate-100"
        style={{ background: theme.headerBg }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[14px] text-slate-400 mb-4">
            <Link href="/" className="hover:text-green-500 transition-colors">
              首頁
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/healthy-diet" className="hover:text-green-500 transition-colors">
              飲食健康
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-green-500 font-medium">{article.title.length > 20 ? article.title.substring(0, 20) + '...' : article.title}</span>
          </nav>

          {/* Category tag */}
          <Link href="/healthy-diet">
            <Badge className="bg-green-500 text-white border-0 text-[12px] shadow-sm mb-3 hover:bg-green-600 transition-colors cursor-pointer">
              飲食健康
            </Badge>
          </Link>

          {/* ═══════════ 2. ARTICLE TITLE ═══════════ */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
            {article.title}
          </h1>

          {/* ═══════════ 3. METADATA ROW ═══════════ */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-slate-400">
            <div className="flex items-center gap-2">
              <img
                src={article.authorAvatar}
                alt={article.author}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
              <span className="font-medium text-slate-600">{article.author}</span>
            </div>
            <span className="hidden sm:inline text-slate-200">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              發佈於 {article.publishDate} {article.publishTime}
            </span>
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



            {/* ═══════════ 7. ARTICLE TOOLS ═══════════ */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
              <ArticleToolbar onCopyLink={handleCopyLink} />
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
            <ArticleBody blocks={article.body} />

            {/* ── Article footer ── */}
            <div className="mt-10 pt-6 border-t border-slate-100">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {article.tags.length > 0 ? article.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/topics/tag/${encodeURIComponent(t)}`}
                    className="text-[14px] px-2.5 py-1 rounded-full bg-green-50 text-green-500 font-medium hover:bg-green-100 transition-colors"
                  >
                    {t}
                  </Link>
                )) : (
                  <Link
                    href="/healthy-diet"
                    className="text-[14px] px-2.5 py-1 rounded-full bg-green-50 text-green-500 font-medium hover:bg-green-100 transition-colors"
                  >
                    飲食健康
                  </Link>
                )}
              </div>

              {/* Bottom tools (mobile) */}
              <div className="sm:hidden mb-6">
                <ArticleToolbar onCopyLink={handleCopyLink} />
              </div>

              {/* Back link */}
              <Link
                href="/healthy-diet"
                className="inline-flex items-center gap-1.5 text-[14px] text-green-500 font-medium hover:text-green-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                返回飲食健康
              </Link>
            </div>

            {/* ═══════════ 8. RELATED ARTICLES ═══════════ */}
            {relatedArticles.length > 0 && (
            <section className="mt-10">


              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-5">
                <span
                  className="w-1 h-5 rounded-full"
                  style={{ background: theme.accentGradient }}
                />
                相關文章
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((ra, i) => (
                    <RelatedArticleCard key={i} article={ra} />
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
                <Flame className="w-4 h-4 text-green-500" />
                熱門焦點
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hotTopics.map((ht, i) => (
                  <HotTopicCard key={i} article={ht} />
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
                <TrendingUp className="w-4 h-4 text-green-500" />
                延伸閱讀
              </h2>
              <div className="space-y-3">
                {relatedArticles.map((ra, i) => (
                  <HotTopicCard key={i} article={ra} />
                ))}
              </div>
            </section>
            )}
          </article>

          {/* ═══════════ 10. DESKTOP SIDEBAR ═══════════ */}
          <aside className="hidden lg:block w-[300px] shrink-0 space-y-5">
            {/* 熱門文章 */}
            <SidebarSection title="熱門文章" icon={Flame}>
              <div className="space-y-3">
                {sidebarTrending.map((sa, i) => (
                  <Link
                    key={i}
                    href={`/healthy-diet/${encodeURIComponent(sa.slug)}`}
                    className="group flex items-start gap-3 hover:bg-green-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="text-lg font-bold text-green-500/40 shrink-0 w-6 text-right leading-tight">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-2 group-hover:text-green-500 transition-colors leading-snug">
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
            <SidebarSection title="編輯推薦" icon={Star}>
              <div className="space-y-2.5">
                {relatedArticles.slice(0, 4).map((pick, i) => (
                  <Link
                    key={i}
                    href={`/healthy-diet/${encodeURIComponent(pick.slug)}`}
                    className="group flex items-center gap-2.5 hover:bg-green-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-green-500/60 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-medium text-slate-700 line-clamp-1 group-hover:text-green-500 transition-colors">
                        {pick.title}
                      </h4>
                      <span className="text-[12px] text-green-500 font-medium">
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
            <SidebarSection title="最新更新" icon={TrendingUp}>
              <div className="space-y-2.5">
                {sidebarTrending.slice(0, 4).map((sa, i) => (
                  <Link
                    key={i}
                    href={`/healthy-diet/${encodeURIComponent(sa.slug)}`}
                    className="group flex gap-3 items-start hover:bg-green-50/40 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <img
                      src={sa.image || FALLBACK_IMAGE}
                      alt={sa.title}
                      className="w-14 h-10 rounded-md object-cover shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-medium text-slate-700 line-clamp-2 group-hover:text-green-500 transition-colors leading-snug">
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
            <SidebarSection title="熱門標籤" icon={Tag}>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/topics/tag/${encodeURIComponent(tag)}`}
                    className="text-[14px] px-2.5 py-1 rounded-full bg-green-50 text-green-500 font-medium hover:bg-green-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </SidebarSection>
            )}

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
            <Tag className="w-3.5 h-3.5 text-green-500" />
            熱門標籤
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/topics/tag/${encodeURIComponent(tag)}`}
                className="text-[14px] px-2.5 py-1 rounded-full bg-green-50 text-green-500 font-medium hover:bg-green-100 transition-colors"
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
            <Star className="w-3.5 h-3.5 text-green-500" />
            編輯推薦
          </h3>
          <div className="space-y-2">
            {relatedArticles.slice(0, 4).map((pick, i) => (
              <Link
                key={i}
                href={`/healthy-diet/${encodeURIComponent(pick.slug)}`}
                className="group flex items-center gap-2.5 py-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-green-500/60 shrink-0" />
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-green-500 transition-colors">
                    {pick.title}
                  </h4>
                  <span className="text-[12px] text-green-500 font-medium">{pick.tag}</span>
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
            <Flame className="w-3.5 h-3.5 text-green-500" />
            熱門文章
          </h3>
          <div className="space-y-2.5">
            {sidebarTrending.map((sa, i) => (
              <Link
                key={i}
                href={`/healthy-diet/${encodeURIComponent(sa.slug)}`}
                className="group flex items-start gap-3 py-1"
              >
                <span className="text-base font-bold text-green-500/40 shrink-0 w-5 text-right leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-[14px] font-medium text-slate-700 group-hover:text-green-500 transition-colors leading-snug">
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
