'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/public/PublicLayout';
import {
  Search, MapPin, Sparkles, X, Phone, Globe,
  Star, Store, ChevronLeft, ChevronRight, CheckCircle2,
  ChevronDown, RotateCcw, Clock,
} from 'lucide-react';

const PAGE_SIZE = 12;

const REGION_GROUPS = [
  { region: '全部地區', emoji: '📍', districts: [] as string[] },
  { region: '香港島', emoji: '🏙️', districts: ['中環', '上環', '灣仔', '銅鑼灣', '北角', '鰂魚涌', '天后', '炮台山', '柴灣', '西灣河', '西營盤', '香港仔', '堅尼地城', '半山區', '跑馬地'] },
  { region: '九龍', emoji: '🌆', districts: ['尖沙咀', '觀塘', '旺角', '油麻地', '佐敦', '太子', '深水埗', '長沙灣', '荔枝角', '美孚', '九龍城', '九龍塘', '何文田', '紅磡', '九龍灣', '牛頭角', '藍田', '黃大仙', '鑽石山', '新蒲崗', '慈雲山', '大角咀', '彩虹', '樂富'] },
  { region: '新界', emoji: '🌿', districts: ['元朗', '荃灣', '屯門', '大埔', '沙田', '火炭', '馬鞍山', '將軍澳', '天水圍', '葵芳', '葵涌', '青衣', '上水', '粉嶺', '西貢', '大圍', '大窩口'] },
  { region: '離島區', emoji: '🏝️', districts: ['離島', '東涌', '大嶼山', '長洲', '坪洲', '南丫島', '梅窩', '愉景灣'] },
];

// Cover styles for salons without images - 16 diverse backgrounds
const COVER_STYLES = [
  {
    bgImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
    overlayFrom: 'rgba(6,78,59,0.7)',
    overlayTo: 'rgba(13,148,136,0.5)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80',
    overlayFrom: 'rgba(251,113,133,0.6)',
    overlayTo: 'rgba(249,168,212,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
    overlayFrom: 'rgba(41,37,36,0.6)',
    overlayTo: 'rgba(146,64,14,0.4)',
    textColor: '#f5f5f4',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
    overlayFrom: 'rgba(3,105,161,0.6)',
    overlayTo: 'rgba(6,182,212,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    overlayFrom: 'rgba(88,28,135,0.65)',
    overlayTo: 'rgba(147,51,234,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
    overlayFrom: 'rgba(30,58,138,0.65)',
    overlayTo: 'rgba(59,130,246,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    overlayFrom: 'rgba(157,23,77,0.6)',
    overlayTo: 'rgba(236,72,153,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80',
    overlayFrom: 'rgba(20,83,45,0.65)',
    overlayTo: 'rgba(34,197,94,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
    overlayFrom: 'rgba(120,53,15,0.65)',
    overlayTo: 'rgba(217,119,6,0.4)',
    textColor: '#fef3c7',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    overlayFrom: 'rgba(159,18,57,0.6)',
    overlayTo: 'rgba(244,63,94,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80',
    overlayFrom: 'rgba(17,94,89,0.65)',
    overlayTo: 'rgba(45,212,191,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    overlayFrom: 'rgba(55,48,163,0.65)',
    overlayTo: 'rgba(99,102,241,0.4)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&q=80',
    overlayFrom: 'rgba(9,9,11,0.5)',
    overlayTo: 'rgba(63,63,70,0.4)',
    textColor: '#fafafa',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    overlayFrom: 'rgba(21,94,117,0.65)',
    overlayTo: 'rgba(34,211,238,0.35)',
    textColor: '#ffffff',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    overlayFrom: 'rgba(113,63,18,0.65)',
    overlayTo: 'rgba(234,179,8,0.35)',
    textColor: '#fef9c3',
  },
  {
    bgImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    overlayFrom: 'rgba(76,29,149,0.6)',
    overlayTo: 'rgba(168,85,247,0.35)',
    textColor: '#ffffff',
  },
];

// Simple hash to consistently assign a cover style based on salon name/id
function getCoverStyleIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % COVER_STYLES.length;
}

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
  office_hr_mon: string | null;
  office_hr_tue: string | null;
  office_hr_wed: string | null;
  office_hr_thu: string | null;
  office_hr_fri: string | null;
  office_hr_sat: string | null;
  office_hr_sun: string | null;
}

interface TagCategory {
  category: string;
  tags: { id: string; label: string; category: string }[];
}

export default function ExploreSalonsPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<SalonProfile[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('全部地區');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedHoursSalonId, setExpandedHoursSalonId] = useState<string | null>(null);

  // Opening hours helpers
  const DAY_KEYS = ['office_hr_sun', 'office_hr_mon', 'office_hr_tue', 'office_hr_wed', 'office_hr_thu', 'office_hr_fri', 'office_hr_sat'] as const;
  const DAY_LABELS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  const getTodayHours = (salon: SalonProfile): string | null => {
    const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
    const key = DAY_KEYS[dayIndex];
    return salon[key] || null;
  };

  const getAllHours = (salon: SalonProfile): { label: string; hours: string | null; isToday: boolean }[] => {
    const todayIndex = new Date().getDay();
    return DAY_KEYS.map((key, i) => ({
      label: DAY_LABELS[i],
      hours: salon[key] || null,
      isToday: i === todayIndex,
    }));
  };

  // Tag prefix removal helper
  const removeTagPrefix = (tag: string): string => {
    const prefixes = ['face_', 'machine_', 'body_', 'hair_', 'semi-perm_', 'eyes_', 'med_', 'pay_', 'quali_', 'seg_', 'service_', 'amenities_', 'booking_'];
    for (const prefix of prefixes) {
      if (tag.startsWith(prefix)) {
        return tag.slice(prefix.length);
      }
    }
    return tag;
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all salons using pagination (Supabase default limit is 1000)
        const FETCH_LIMIT = 1000;
        let allSalons: any[] = [];
        let from = 0;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from('salon_profiles')
            .select('id, salon_name, address, district, district_name, description, image_src, product_media, tags, selected_tags, highlight_tags, contact_number, whatsapp_number, website, is_active, product_type, created_by, office_hr_mon, office_hr_tue, office_hr_wed, office_hr_thu, office_hr_fri, office_hr_sat, office_hr_sun')
            .or('is_active.eq.true,is_active.is.null')
            .order('salon_name')
            .range(from, from + FETCH_LIMIT - 1);

          if (error) {
            console.error('Error fetching salons:', error);
            break;
          }

          if (data) {
            allSalons = [...allSalons, ...data];
            if (data.length < FETCH_LIMIT) {
              hasMore = false;
            } else {
              from += FETCH_LIMIT;
            }
          } else {
            hasMore = false;
          }
        }

        setSalons(allSalons);

        const tagsRes = await supabase
          .from('salon_tags')
          .select('*')
          .order('sort_order');

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
        const salonDistrict = (salon.district_name || salon.district || '').trim();
        if (!salonDistrict) return false;
        const inRegion = currentRegionGroup.districts.some(d => salonDistrict.includes(d));
        if (!inRegion) return false;
      }

      // District filter
      if (selectedDistrict) {
        const salonDistrict = (salon.district_name || salon.district || '').trim();
        if (!salonDistrict.includes(selectedDistrict)) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const salonTags = parseTags(salon);
        const hasAllTags = selectedTags.every(tag => salonTags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [salons, searchQuery, selectedRegion, selectedDistrict, selectedTags, currentRegionGroup, parseTags]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion, selectedDistrict, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filteredSalons.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSalons = filteredSalons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
  };

  const activeFilterCount =
    (selectedRegion !== '全部地區' ? 1 : 0) +
    (selectedDistrict ? 1 : 0) +
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

  const [expandedFilterSection, setExpandedFilterSection] = useState<string | null>(null);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">找美容院</h1>
          <p className="text-sm text-slate-400">探索香港優質美容院，搵到最啱你嘅美容服務</p>
        </div>

        {/* ===== REDESIGNED FILTER SECTION ===== */}
        <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(241,245,249,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          
          {/* Search Bar - Always visible at top */}
          <div className="p-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="搜尋美容院名稱、地區、地址..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 pr-10 rounded-xl border-slate-200 bg-slate-50/80 text-sm focus:border-rose-300 focus:bg-white focus:ring-1 focus:ring-rose-100 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Row - Horizontal chips always visible */}
          <div className="px-4 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Region Dropdown Chip */}
              <div className="relative">
                <button
                  onClick={() => setExpandedFilterSection(expandedFilterSection === 'region' ? null : 'region')}
                  className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border transition-all ${
                    selectedRegion !== '全部地區'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 font-medium'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedRegion !== '全部地區' ? (selectedDistrict || selectedRegion) : '地區'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedFilterSection === 'region' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Service Type Dropdown Chip */}
              <div className="relative">
                <button
                  onClick={() => setExpandedFilterSection(expandedFilterSection === 'services' ? null : 'services')}
                  className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg border transition-all ${
                    selectedTags.length > 0
                      ? 'bg-purple-50 text-purple-700 border-purple-200 font-medium'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedTags.length > 0 ? `已選 ${selectedTags.length} 項` : '服務類型'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedFilterSection === 'services' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Active filter badges inline */}
              {activeFilterCount > 0 && (
                <>
                  <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedRegion !== '全部地區' && (
                      <Badge className="bg-rose-100 text-rose-700 border-0 text-xs gap-1 pr-1.5 py-0.5 cursor-pointer hover:bg-rose-200 transition-colors" onClick={() => { setSelectedRegion('全部地區'); setSelectedDistrict(''); }}>
                        <MapPin className="w-2.5 h-2.5" />
                        {selectedDistrict || selectedRegion}
                        <X className="w-2.5 h-2.5 ml-0.5" />
                      </Badge>
                    )}
                    {selectedTags.slice(0, 3).map(tag => (
                      <Badge key={tag} className="bg-purple-100 text-purple-700 border-0 text-xs gap-1 pr-1.5 py-0.5 cursor-pointer hover:bg-purple-200 transition-colors" onClick={() => toggleTag(tag)}>
                        {tag}
                        <X className="w-2.5 h-2.5 ml-0.5" />
                      </Badge>
                    ))}
                    {selectedTags.length > 3 && (
                      <Badge className="bg-slate-100 text-slate-600 border-0 text-xs py-0.5">
                        +{selectedTags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors ml-auto sm:ml-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    重設
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Expandable Region Panel */}
          {expandedFilterSection === 'region' && (
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 animate-in slide-in-from-top-1 duration-200">
              <div className="space-y-3">
                {/* Selected region summary */}
                {selectedRegion !== '全部地區' && (
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-400 shrink-0">已選：</span>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className="bg-rose-100 text-rose-700 border-0 text-xs gap-1 pr-1.5 py-0.5 cursor-pointer hover:bg-rose-200 transition-colors" onClick={() => { setSelectedRegion('全部地區'); setSelectedDistrict(''); }}>
                        <MapPin className="w-2.5 h-2.5" />
                        {selectedDistrict || selectedRegion}
                        <X className="w-2.5 h-2.5" />
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Region sections in scrollable area */}
                <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {/* Region tabs */}
                  <div className="bg-white rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-2">選擇區域</p>
                    <div className="flex flex-wrap gap-1.5">
                      {REGION_GROUPS.map(rg => (
                        <button
                          key={rg.region}
                          onClick={() => {
                            setSelectedRegion(rg.region);
                            setSelectedDistrict('');
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            selectedRegion === rg.region
                              ? 'bg-rose-500 text-white border-rose-500 font-medium shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          {selectedRegion === rg.region && <span className="mr-0.5">✓</span>}
                          {rg.emoji} {rg.region}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* District sub-selection */}
                  {selectedRegion !== '全部地區' && currentRegionGroup && currentRegionGroup.districts.length > 0 && (
                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">選擇分區（{selectedRegion}）</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => { setSelectedDistrict(''); setExpandedFilterSection(null); }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                            !selectedDistrict
                              ? 'bg-rose-500 text-white border-rose-500 font-medium shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          {!selectedDistrict && <span className="mr-0.5">✓</span>}
                          全部{selectedRegion}
                        </button>
                        {currentRegionGroup.districts.map(d => (
                          <button
                            key={d}
                            onClick={() => { setSelectedDistrict(d === selectedDistrict ? '' : d); setExpandedFilterSection(null); }}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                              selectedDistrict === d
                                ? 'bg-rose-500 text-white border-rose-500 font-medium shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            {selectedDistrict === d && <span className="mr-0.5">✓</span>}
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Done button */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    onClick={() => setExpandedFilterSection(null)}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm px-4"
                  >
                    完成
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Services Panel */}
          {expandedFilterSection === 'services' && (
            <div className="border-t border-slate-100 p-4 bg-slate-50/50 animate-in slide-in-from-top-1 duration-200">
              {tagCategories.length > 0 && (() => {
                const serviceTypeKeywords = ['面部', '身體', '醫美', '脫毛', '紋繡', '眼睫', '護理', '儀器', '美容', '激光', 'Spa', '按摩', '纖體', '塑形', '瘦身', '抗衰', '暗瘡', '色斑', '半永久', '微針', '水光', 'HIFU', '射頻'];
                const serviceCategories = tagCategories.filter(({ category }) =>
                  serviceTypeKeywords.some(k => category.includes(k))
                );
                const otherCategories = tagCategories.filter(({ category }) =>
                  !serviceTypeKeywords.some(k => category.includes(k))
                );
                const allCategories = [...serviceCategories, ...otherCategories];

                return (
                  <div className="space-y-4">
                    {/* Quick selected tags summary */}
                    {selectedTags.length > 0 && (
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <span className="text-xs text-slate-400 shrink-0">已選：</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTags.map(tag => (
                            <Badge key={tag} className="bg-purple-100 text-purple-700 border-0 text-xs gap-1 pr-1.5 py-0.5 cursor-pointer hover:bg-purple-200 transition-colors" onClick={() => toggleTag(tag)}>
                              {tag}
                              <X className="w-2.5 h-2.5" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category sections in a scrollable area */}
                    <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                      {allCategories.map(({ category, tags }) => (
                        <div key={category} className="bg-white rounded-xl p-3 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 mb-2">{category}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map(tag => (
                              <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.label)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                                  selectedTags.includes(tag.label)
                                    ? 'bg-purple-500 text-white border-purple-500 font-medium shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                              >
                                {selectedTags.includes(tag.label) && <span className="mr-0.5">✓</span>}
                                {tag.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Done button */}
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        onClick={() => setExpandedFilterSection(null)}
                        className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm px-4"
                      >
                        完成
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        {/* ===== END REDESIGNED FILTER ===== */}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            找到 <span className="font-semibold text-rose-600">{filteredSalons.length}</span> 間美容院
            {totalPages > 1 && (
              <span className="ml-2 text-slate-400">（第 {safePage} / {totalPages} 頁）</span>
            )}
          </p>
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
                const salonDistrict = (salon.district_name || salon.district || '').trim();
                const filteredHighlights = highlights.filter(tag => removeTagPrefix(tag) !== salonDistrict);
                const displayTags = filteredHighlights.length > 0 ? filteredHighlights : salonTags.filter(tag => removeTagPrefix(tag) !== salonDistrict).slice(0, 4);
                const isClaimed = !!salon.created_by;

                return (
                  <div
                    key={salon.id}
                    onClick={() => router.push(`/salon/${salon.id}`)}
                    className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 isolate will-change-transform block cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '1rem' }}
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
                      ) : (() => {
                        const styleIdx = getCoverStyleIndex(salon.id || salon.salon_name || '');
                        const coverStyle = COVER_STYLES[styleIdx];
                        return (
                          <div className="relative w-full h-full">
                            <img
                              src={coverStyle.bgImage}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(135deg, ${coverStyle.overlayFrom}, ${coverStyle.overlayTo})`,
                              }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-1" style={{ color: coverStyle.textColor }}>
                                Beauty Salon
                              </p>
                              <h3 className="text-lg font-bold text-center leading-tight drop-shadow-md line-clamp-2" style={{ color: coverStyle.textColor }}>
                                {salon.salon_name || '美容院'}
                              </h3>
                              <div className="mt-2 w-10 h-0.5 opacity-60 rounded" style={{ backgroundColor: coverStyle.textColor }} />
                            </div>
                          </div>
                        );
                      })()}

                      {/* District badge - top left */}
                      {(salon.district_name || salon.district) && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-sm font-medium text-slate-700 px-2.5 py-1 rounded-full shadow-sm">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {salon.district_name || salon.district}
                        </div>
                      )}

                      {/* Claim button - top right */}
                      {!isClaimed ? (
                        <div
                          role="button"
                          className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-rose-600 px-2.5 py-1.5 rounded-full shadow-sm hover:bg-rose-500 hover:text-white transition-all duration-200 border border-rose-200 hover:border-rose-500 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/merchant-signup?type=claim&salon=${encodeURIComponent(JSON.stringify({ salon_name: salon.salon_name, salon_id: salon.id, district: salon.district_name || salon.district || '' }))}`;
                          }}
                        >
                          <Store className="w-3 h-3" />
                          認領店家
                        </div>
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
                        <p className="text-sm text-slate-400 mb-2 line-clamp-1 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          {salon.address}
                        </p>
                      )}

                      {/* Opening Hours */}
                      {getTodayHours(salon) && (
                        <div className="mb-2.5">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedHoursSalonId(expandedHoursSalonId === salon.id ? null : salon.id);
                            }}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-full"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>今日: {getTodayHours(salon)}</span>
                            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${expandedHoursSalonId === salon.id ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedHoursSalonId === salon.id && (
                            <div className="mt-2 pl-5 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                              {getAllHours(salon).map(({ label, hours, isToday }) => (
                                <div
                                  key={label}
                                  className={`flex justify-between text-sm py-0.5 ${
                                    isToday ? 'font-semibold text-slate-800' : 'text-slate-500'
                                  }`}
                                >
                                  <span>{label}</span>
                                  <span className={isToday ? 'font-bold' : ''}>{hours || '休息'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
                              {removeTagPrefix(tag)}
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
                        <span
                          className="text-[14px] font-semibold text-rose-500 hover:text-rose-600 transition-colors whitespace-nowrap"
                        >
                          立即查看 →
                        </span>
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
