'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, X, FileText, Store, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  type: 'article' | 'salon';
  id: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  href: string;
}

/* Category slug → Chinese label mapping */
const CATEGORY_LABEL: Record<string, string> = {
  'facial-care': '面部護理',
  'anti-aging': '回復青春',
  'skincare': '化妝護膚',
  'body-care': '身體保養',
  'healthy-diet': '飲食健康',
  'trending-topics': '焦點話題',
  'entertainment': '娛樂圈',
};

export default function NavbarSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${searchQuery.trim()}%`;

      // Search articles
      const { data: articles } = await supabase
        .from('blog_articles')
        .select('id, title, handle, category, cover_image_url')
        .eq('status', 'active')
        .ilike('title', searchTerm)
        .limit(5);

      // Search salons
      const { data: salons } = await supabase
        .from('salon_profiles')
        .select('id, salon_name, district_name, district, cover_photo, address')
        .eq('is_active', true)
        .ilike('salon_name', searchTerm)
        .limit(5);

      const searchResults: SearchResult[] = [];

      if (articles) {
        articles.forEach((article) => {
          searchResults.push({
            type: 'article',
            id: article.id,
            title: article.title,
            subtitle: CATEGORY_LABEL[article.category] || article.category || '文章',
            image: article.cover_image_url,
            href: `/topics/${encodeURIComponent(article.handle)}`,
          });
        });
      }

      if (salons) {
        salons.forEach((salon) => {
          searchResults.push({
            type: 'salon',
            id: salon.id,
            title: salon.salon_name || '未命名美容院',
            subtitle: salon.district_name || salon.district || salon.address || '',
            image: salon.cover_photo,
            href: `/salon/${salon.id}`,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50/60"
        aria-label="搜尋"
      >
        <Search className="w-[18px] h-[18px]" />
      </button>

      {/* Search overlay */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-white rounded-2xl shadow-xl shadow-rose-100/40 border border-rose-100/60 z-[200] overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-rose-50">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="搜尋文章或美容院..."
              className="flex-1 text-sm text-slate-700 placeholder:text-slate-300 outline-none bg-transparent"
            />
            {query && (
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">找不到相關結果</p>
                <p className="text-xs text-slate-300 mt-1">試試其他關鍵字</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {/* Articles section */}
                {results.filter(r => r.type === 'article').length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">文章</p>
                    {results.filter(r => r.type === 'article').map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={handleClose}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50/60 transition-colors"
                      >
                        {result.image ? (
                          <img src={result.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-rose-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-700 font-medium truncate">{result.title}</p>
                          <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Salons section */}
                {results.filter(r => r.type === 'salon').length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">美容院</p>
                    {results.filter(r => r.type === 'salon').map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={handleClose}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50/60 transition-colors"
                      >
                        {result.image ? (
                          <img src={result.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-amber-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-700 font-medium truncate">{result.title}</p>
                          <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state when no query */}
            {!loading && !query && (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">輸入關鍵字搜尋</p>
                <p className="text-xs text-slate-300 mt-1">搜尋文章標題或美容院名稱</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
