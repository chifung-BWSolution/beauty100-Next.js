'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicLayout from '@/components/public/PublicLayout';
import {
  Search, MapPin, Sparkles, X, Filter, Phone, Globe,
  ChevronDown, ChevronUp, Star, SlidersHorizontal,
  Store, ChevronLeft, ChevronRight, Shield, CheckCircle2,
} from 'lucide-react';

const PAGE_SIZE = 12;

const REGION_GROUPS = [
  { region: '全部地區', emoji: '📍', districts: [] as string[] },
  { region: '香港島', emoji: '🏙️', districts: ['中環', '上環', '灣仔', '銅鑼灣', '北角', '鰂魚涌', '天后', '炮台山', '柴灣', '西灣河', '西營盤', '香港仔', '堅尼地城', '半山區', '跑馬地'] },
  { region: '九龍', emoji: '🌆', districts: ['尖沙咀', '觀塘', '旺角', '油麻地', '佐敦', '太子', '深水埗', '長沙灣', '荔枝角', '美孚', '九龍城', '九龍塘', '何文田', '紅磡', '九龍灣', '牛頭角', '藍田', '黃大仙', '鑽石山', '新蒲崗', '慈雲山', '大角咀', '彩虹', '樂富'] },
  { region: '新界', emoji: '🌿', districts: ['元朗', '荃灣', '屯門', '大埔', '沙田', '火炭', '馬鞍山', '將軍澳', '天水圍', '葵芳', '葵涌', '青衣', '上水', '粉嶺', '西貢', '大圍', '大窩口', '東涌'] },
  { region: '離島區', emoji: '🏝️', districts: ['離島區'] },
];

const BEAUTY_TYPES = [
  { id: 'facial', label: '面部護理' },
  { id: 'body', label: '身體保養' },
  { id: 'medical', label: '醫美療程' },
  { id: 'makeup', label: '化妝服務' },
  { id: 'nails', label: '美甲 / 美睫' },
  { id: 'slimming', label: '纖體塑形' },
];

interface SalonProfile {
  id: string;
  salon_name: string | null;
  address: string | null;
  district: string | null;
  district_name: string | null;
  description: string | null;
  image_src: string | null;
  product_media: any;
  tags: string | null;
  selected_tags: any;
  highlight_tags: any;
  contact_number: string | null;
  whatsapp_number: string | null;
  website: string | null;
  is_active: boolean | null;
  product_type: string | null;
  created_by: string | null;
}

interface TagCategory {
  category: string;
  tags: { id: string; label: string; category: string }[];
}

export default function ExploreSalonsPage() {
  const [salons, setSalons] = useState<SalonProfile[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('全部地區');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBeautyType, setSelectedBeautyType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [claimFilter, setClaimFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');

  // Load salons and tags
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salonsRes, tagsRes] = await Promise.all([
          supabase
            .from('salon_profiles')
            .select('id, salon_name, address, district, district_name, description, image_src, product_media, tags, selected_tags, highlight_tags, contact_number, whatsapp_number, website, is_active, product_type, created_by')
            .eq('is_active', true)
            .order('salon_name'),
          supabase
            .from('salon_tags')
            .select('*')
            .order('sort_order'),
        ]);

        if (salonsRes.data) {
          setSalons(salonsRes.data);
        }

        if (tagsRes.data) {
          const grouped: Record<string, { id: string; label: string; category: string }[]> = {};
          tagsRes.data.forEach((t: any) => {
            if (!grouped[t.category]) grouped[t.category] = [];
            grouped[t.category].push(t);
          });
          const categories = Object.entries(grouped).map(([category, tags]) => ({ category, tags }));
          setTagCategories(categories);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentRegionGroup = REGION_GROUPS.find(r => r.region === selectedRegion);

  const filteredSalons = useMemo(() => {
    return salons.filter(salon => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = salon.salon_name?.toLowerCase().includes(q);
        const addressMatch = salon.address?.toLowerCase().includes(q);
        const districtMatch = salon.district_name?.toLowerCase().includes(q) || salon.district?.toLowerCase().includes(q);
        const descMatch = salon.description?.toLowerCase().includes(q);
        if (!nameMatch && !addressMatch && !districtMatch && !descMatch) return false;
      }

      // Region filter
      if (selectedRegion !== '全部地區' && currentRegionGroup) {
        const salonDistrict = salon.district_name || salon.district || '';
        const inRegion = currentRegionGroup.districts.some(d => salonDistrict.includes(d) || d.includes(salonDistrict));
        if (!inRegion) return false;
      }

      // District filter
      if (selectedDistrict) {
        const salonDistrict = salon.district_name || salon.district || '';
        if (!salonDistrict.includes(selectedDistrict) && !selectedDistrict.includes(salonDistrict)) return false;
      }

      // Beauty type filter
      if (selectedBeautyType) {
        const salonTags = parseTags(salon);
        const productType = salon.product_type?.toLowerCase() || '';
        const tagStr = salonTags.join(' ').toLowerCase();
        const match = tagStr.includes(selectedBeautyType.toLowerCase()) || productType.includes(selectedBeautyType.toLowerCase());
        if (!match) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const salonTags = parseTags(salon);
        const hasAllTags = selectedTags.every(tag => salonTags.includes(tag));
        if (!hasAllTags) return false;
      }

      // Claim status filter
      if (claimFilter === 'claimed' && !salon.created_by) return false;
      if (claimFilter === 'unclaimed' && salon.created_by) return false;

      return true;
    });
  }, [salons, searchQuery, selectedRegion, selectedDistrict, selectedTags, selectedBeautyType, claimFilter, currentRegionGroup]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion, selectedDistrict, selectedTags, selectedBeautyType, claimFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSalons.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSalons = filteredSalons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const parseTags = useCallback((salon: SalonProfile): string[] => {
    const tags: string[] = [];
    if (salon.selected_tags) {
      const parsed = typeof salon.selected_tags === 'string' ? JSON.parse(salon.selected_tags) : salon.selected_tags;
      if (Array.isArray(parsed)) tags.push(...parsed);
    }
    if (salon.tags) {
      salon.tags.split(',').forEach(t => {
        const trimmed = t.trim();
        if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      });
    }
    return tags;
  }, []);

  const parseHighlightTags = useCallback((salon: SalonProfile): string[] => {
    if (!salon.highlight_tags) return [];
    const parsed = typeof salon.highlight_tags === 'string' ? JSON.parse(salon.highlight_tags) : salon.highlight_tags;
    return Array.isArray(parsed) ? parsed : [];
  }, []);

  const getImageSrc = useCallback((salon: SalonProfile): string | null => {
    if (salon.image_src) return salon.image_src;
    if (salon.product_media) {
      const media = typeof salon.product_media === 'string' ? JSON.parse(salon.product_media) : salon.product_media;
      if (Array.isArray(media) && media.length > 0) return media[0]?.src || media[0]?.url || null;
    }
    return null;
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedRegion('全部地區');
    setSelectedDistrict('');
    setSelectedTags([]);
    setSelectedBeautyType('');
    setClaimFilter('all');
  };

  const activeFilterCount =
    (selectedRegion !== '全部地區' ? 1 : 0) +
    (selectedDistrict ? 1 : 0) +
    (selectedBeautyType ? 1 : 0) +
    (claimFilter !== 'all' ? 1 : 0) +
    selectedTags.length;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('...');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">找美容院</h1>
          <p className="text-sm text-slate-400">探索香港優質美容院，搵到最啱你嘅美容服務</p>
        </div>

        {/* Region Tabs */}
        <div className="mb-5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-1">
            {REGION_GROUPS.map(rg => (
              <button
                key={rg.region}
                onClick={() => {
                  setSelectedRegion(rg.region);
                  setSelectedDistrict('');
                }}
                className={`text-sm px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                  selectedRegion === rg.region
                    ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-md shadow-rose-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
              >
                {rg.emoji} {rg.region}
              </button>
            ))}
          </div>
        </div>

        {/* District Sub-tabs */}
        {selectedRegion !== '全部地區' && currentRegionGroup && currentRegionGroup.districts.length > 0 && (
          <div className="mb-5 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 min-w-max pb-1">
              <button
                onClick={() => setSelectedDistrict('')}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                  !selectedDistrict
                    ? 'bg-rose-100 text-rose-700 border-rose-300 font-medium'
                    : 'bg-white/60 text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'
                }`}
              >
                全部
              </button>
              {currentRegionGroup.districts.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(selectedDistrict === d ? '' : d)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    selectedDistrict === d
                      ? 'bg-rose-100 text-rose-700 border-rose-300 font-medium'
                      : 'bg-white/60 text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar + Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
            <Input
              type="text"
              placeholder="搜尋美容院名稱、地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-10 pr-4 rounded-xl border-rose-100 bg-white/80 text-sm focus:border-rose-300 shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 rounded-xl border-rose-100 gap-2 relative ${showFilters ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white/80 text-slate-600 hover:border-rose-200'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            進階篩選
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[14px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-lg" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.75)' }}>
            <div className="p-5 space-y-5">
              {/* Beauty Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  美容類型
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBeautyType('')}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                      !selectedBeautyType
                        ? 'bg-rose-500 text-white border-rose-500 font-medium'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'
                    }`}
                  >
                    全部類型
                  </button>
                  {BEAUTY_TYPES.map(bt => (
                    <button
                      key={bt.id}
                      onClick={() => setSelectedBeautyType(selectedBeautyType === bt.label ? '' : bt.label)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                        selectedBeautyType === bt.label
                          ? 'bg-rose-500 text-white border-rose-500 font-medium'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Claim Status Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  認領狀態
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all' as const, label: '全部' },
                    { value: 'claimed' as const, label: '已認領' },
                    { value: 'unclaimed' as const, label: '未認領' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setClaimFilter(opt.value)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                        claimFilter === opt.value
                          ? 'bg-rose-500 text-white border-rose-500 font-medium'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filters */}
              {tagCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-rose-400" />
                    熱門療程
                  </h3>
                  <div className="space-y-2">
                    {tagCategories.map(({ category, tags }) => (
                      <div key={category} className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-slate-600 hover:bg-rose-50/50 transition-colors"
                        >
                          <span className="font-medium">{category}</span>
                          <div className="flex items-center gap-2">
                            {selectedTags.filter(t => tags.some(tag => tag.label === t)).length > 0 && (
                              <span className="text-[14px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">
                                {selectedTags.filter(t => tags.some(tag => tag.label === t)).length}
                              </span>
                            )}
                            {expandedCategories.has(category) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                        {expandedCategories.has(category) && (
                          <div className="px-3.5 pb-3 flex flex-wrap gap-1.5">
                            {tags.map(tag => (
                              <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.label)}
                                className={`text-sm px-2.5 py-1 rounded-full border transition-all ${
                                  selectedTags.includes(tag.label)
                                    ? 'bg-rose-500 text-white border-rose-500 font-medium'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-500'
                                }`}
                              >
                                {tag.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters & Clear */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-rose-50">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRegion !== '全部地區' && (
                      <Badge className="bg-rose-100 text-rose-700 border-0 text-sm gap-1 pr-1">
                        {selectedRegion}
                        <button onClick={() => { setSelectedRegion('全部地區'); setSelectedDistrict(''); }}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedDistrict && (
                      <Badge className="bg-rose-100 text-rose-700 border-0 text-sm gap-1 pr-1">
                        {selectedDistrict}
                        <button onClick={() => setSelectedDistrict('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedBeautyType && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 text-sm gap-1 pr-1">
                        {selectedBeautyType}
                        <button onClick={() => setSelectedBeautyType('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {claimFilter !== 'all' && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-sm gap-1 pr-1">
                        {claimFilter === 'claimed' ? '已認領' : '未認領'}
                        <button onClick={() => setClaimFilter('all')}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedTags.map(tag => (
                      <Badge key={tag} className="bg-fuchsia-100 text-fuchsia-700 border-0 text-sm gap-1 pr-1">
                        {tag}
                        <button onClick={() => toggleTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <button onClick={clearAllFilters} className="text-sm text-rose-500 hover:text-rose-600 font-medium whitespace-nowrap ml-3">
                    清除全部
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            找到 <span className="font-semibold text-rose-600">{filteredSalons.length}</span> 間美容院
            {totalPages > 1 && (
              <span className="ml-2 text-slate-400">（第 {safePage} / {totalPages} 頁）</span>
            )}
          </p>
          {activeFilterCount > 0 && !showFilters && (
            <button onClick={clearAllFilters} className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
              <X className="w-3 h-3" /> 清除篩選
            </button>
          )}
        </div>

        {/* Salon Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm animate-pulse" style={{ background: 'rgba(255,255,255,0.8)' }}>
                <div className="h-48 bg-rose-100/50" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-rose-100/60 rounded-lg w-2/3" />
                  <div className="h-3 bg-rose-50 rounded w-full" />
                  <div className="h-3 bg-rose-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-50">
              <Search className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">找不到美容院</h3>
            <p className="text-sm text-slate-400 mb-4">試下改吓搜尋條件或者清除篩選</p>
            {activeFilterCount > 0 && (
              <Button onClick={clearAllFilters} variant="outline" className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50">
                清除全部篩選
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedSalons.map(salon => {
                const imgSrc = getImageSrc(salon);
                const highlights = parseHighlightTags(salon);
                const salonTags = parseTags(salon);
                const displayTags = highlights.length > 0 ? highlights : salonTags.slice(0, 4);
                const isClaimed = !!salon.created_by;

                return (
                  <div
                    key={salon.id}
                    className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)' }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-rose-100 to-fuchsia-100">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={salon.salon_name || '美容院'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-rose-200" />
                        </div>
                      )}

                      {/* District badge - top left */}
                      {(salon.district_name || salon.district) && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-sm font-medium text-slate-700 px-2.5 py-1 rounded-full shadow-sm">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {salon.district_name || salon.district}
                        </div>
                      )}

                      {/* Claim button - top right */}
                      {!isClaimed ? (
                        <Link
                          href={`/merchant-signup?type=claim&salon=${encodeURIComponent(JSON.stringify({ salon_name: salon.salon_name, salon_id: salon.id, district: salon.district_name || salon.district || '' }))}`}
                          className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-rose-600 px-2.5 py-1.5 rounded-full shadow-sm hover:bg-rose-500 hover:text-white transition-all duration-200 border border-rose-200 hover:border-rose-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Store className="w-3 h-3" />
                          認領店家
                        </Link>
                      ) : (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-xs font-semibold text-white px-2.5 py-1.5 rounded-full shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          已認領
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 text-base mb-1.5 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {salon.salon_name || '未命名美容院'}
                      </h3>

                      {salon.address && (
                        <p className="text-sm text-slate-400 mb-2.5 line-clamp-1 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          {salon.address}
                        </p>
                      )}

                      {salon.description && (
                        <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                          {salon.description.replace(/<[^>]*>/g, '').slice(0, 100)}
                        </p>
                      )}

                      {/* Tags */}
                      {displayTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {displayTags.map(tag => (
                            <Badge
                              key={tag}
                              className={`text-[14px] border-0 font-normal ${
                                highlights.includes(tag)
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {highlights.includes(tag) && <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400 text-amber-400" />}
                              {tag}
                            </Badge>
                          ))}
                          {salonTags.length > displayTags.length && (
                            <Badge className="text-[14px] border-0 font-normal bg-slate-100 text-slate-400">
                              +{salonTags.length - displayTags.length}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Contact Row + CTA */}
                      <div className="flex items-center justify-between pt-2 border-t border-rose-50">
                        <div className="flex items-center gap-2">
                          {salon.whatsapp_number && (
                            <a
                              href={`https://wa.me/${salon.whatsapp_number.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[14px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3" />
                              WhatsApp
                            </a>
                          )}
                          {salon.contact_number && !salon.whatsapp_number && (
                            <a
                              href={`tel:${salon.contact_number}`}
                              className="flex items-center gap-1 text-[14px] text-slate-500 bg-slate-50 px-2 py-1 rounded-full hover:bg-slate-100 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-3 h-3" />
                              {salon.contact_number}
                            </a>
                          )}
                          {salon.website && (
                            <a
                              href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[14px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="w-3 h-3" />
                              網站
                            </a>
                          )}
                        </div>
                        <Link
                          href={`/salon-profile?id=${salon.id}`}
                          className="text-[14px] font-semibold text-rose-500 hover:text-rose-600 transition-colors whitespace-nowrap"
                        >
                          立即查看 →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="h-9 w-9 p-0 rounded-lg border-rose-100 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {getPageNumbers().map((page, idx) => (
                  typeof page === 'number' ? (
                    <Button
                      key={idx}
                      variant={page === safePage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 p-0 rounded-lg text-sm ${
                        page === safePage
                          ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-sm'
                          : 'border-rose-100 text-slate-600 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={idx} className="px-1 text-slate-400 text-sm">…</span>
                  )
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="h-9 w-9 p-0 rounded-lg border-rose-100 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Merchant CTA Section */}
        <div className="mt-12 mb-6">
          <div
            className="rounded-2xl p-6 sm:p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(168,85,247,0.08) 100%)',
              border: '1px solid rgba(244,114,182,0.2)',
            }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-100">
              <Store className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">你是美容院負責人？</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto leading-relaxed">
              如你是此美容院的負責人或授權代表，可提交資料申請認領，我們將安排專員與你聯繫。認領成功後，可進一步完善商戶資訊與展示內容。
            </p>
            <Link
              href="/claim-salon"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f472b6, #e11d48)',
                boxShadow: '0 4px 14px rgba(228,29,72,0.25)',
              }}
            >
              <Store className="w-4 h-4" />
              認領我的美容院
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
