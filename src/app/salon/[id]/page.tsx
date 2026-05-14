'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PublicLayout from '@/components/public/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  MapPin, Phone, Globe, Clock, Star, Store,
  ChevronLeft, CheckCircle2, MessageCircle, Mail,
  User, Sparkles, Image as ImageIcon, X, Lock, Wrench, AlertTriangle,
} from 'lucide-react';

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
  contact_person: string | null;
  whatsapp_number: string | null;
  website: string | null;
  email: string | null;
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
  created_date: string | null;
  storefront_photo: string | null;
  namecard_photo: string | null;
  salon_status: string | null;
  closed_date: string | null;
  renovation_date: string | null;
  reopened_date: string | null;
  new_opening_date: string | null;
}

const DAY_KEYS = ['office_hr_mon', 'office_hr_tue', 'office_hr_wed', 'office_hr_thu', 'office_hr_fri', 'office_hr_sat', 'office_hr_sun'] as const;
const DAY_LABELS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

// Cover styles for salons without images
const COVER_STYLES = [
  { bgImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80', overlayFrom: 'rgba(6,78,59,0.7)', overlayTo: 'rgba(13,148,136,0.5)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80', overlayFrom: 'rgba(251,113,133,0.6)', overlayTo: 'rgba(249,168,212,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80', overlayFrom: 'rgba(41,37,36,0.6)', overlayTo: 'rgba(146,64,14,0.4)', textColor: '#f5f5f4' },
  { bgImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', overlayFrom: 'rgba(3,105,161,0.6)', overlayTo: 'rgba(6,182,212,0.4)', textColor: '#ffffff' },
  { bgImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80', overlayFrom: 'rgba(113,63,18,0.65)', overlayTo: 'rgba(234,179,8,0.35)', textColor: '#fef9c3' },
];

function getCoverStyleIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % COVER_STYLES.length;
}

const removeTagPrefix = (tag: string): string => {
  const prefixes = ['face_', 'machine_', 'body_', 'hair_', 'semi-perm_', 'eyes_', 'med_', 'pay_', 'quali_', 'seg_', 'service_', 'amenities_', 'booking_'];
  for (const prefix of prefixes) {
    if (tag.startsWith(prefix)) {
      return tag.slice(prefix.length);
    }
  }
  return tag;
};

export default function SalonDetailPage() {
  const params = useParams();
  const salonId = params?.id as string;
  const [salon, setSalon] = useState<SalonProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (!salonId) return;
    const fetchSalon = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('salon_profiles')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSalon(data as SalonProfile);
      }
      setLoading(false);
    };
    fetchSalon();
  }, [salonId]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-rose-100/50 rounded-2xl" />
            <div className="h-8 bg-rose-100/60 rounded-lg w-1/3" />
            <div className="h-4 bg-rose-50 rounded w-2/3" />
            <div className="h-4 bg-rose-50 rounded w-1/2" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !salon) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-50">
            <Store className="w-8 h-8 text-rose-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">找不到美容院</h2>
          <p className="text-sm text-slate-400 mb-6">此美容院可能已下架或不存在</p>
          <Link href="/explore-salons">
            <Button variant="outline" className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50">
              <ChevronLeft className="w-4 h-4 mr-1" />
              返回搜尋
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  // Parse tags
  const parseTags = (): string[] => {
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
  };

  const parseHighlightTags = (): string[] => {
    if (!salon.highlight_tags) return [];
    const parsed = typeof salon.highlight_tags === 'string' ? JSON.parse(salon.highlight_tags) : salon.highlight_tags;
    return Array.isArray(parsed) ? parsed : [];
  };

  const getImageSrc = (): string | null => {
    if (salon.image_src) return salon.image_src;
    if (salon.product_media) {
      const media = typeof salon.product_media === 'string' ? JSON.parse(salon.product_media) : salon.product_media;
      if (Array.isArray(media) && media.length > 0) {
        const first = media[0];
        if (typeof first === 'string') return first;
        return first?.src || first?.url || null;
      }
    }
    return null;
  };

  const getMediaImages = (): string[] => {
    if (!salon.product_media) return [];
    const media = typeof salon.product_media === 'string' ? JSON.parse(salon.product_media) : salon.product_media;
    if (Array.isArray(media)) return media.map((m: any) => {
      if (typeof m === 'string') return m;
      return m?.src || m?.url || null;
    }).filter(Boolean);
    return [];
  };

  const getAllHours = (): { label: string; hours: string | null; isToday: boolean }[] => {
    const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
    // Our array: Mon=0, Tue=1...Sat=5, Sun=6
    const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
    return DAY_KEYS.map((key, i) => ({
      label: DAY_LABELS[i],
      hours: salon[key] || null,
      isToday: i === todayIndex,
    }));
  };

  const imgSrc = getImageSrc();
  const mediaImages = getMediaImages();
  const allTags = parseTags();
  const highlights = parseHighlightTags();
  const isClaimed = !!salon.created_by;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Back button */}
        <Link
          href="/explore-salons"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-rose-500 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          返回搜尋
        </Link>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 mb-6">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={salon.salon_name || '美容院'}
              className="w-full h-full object-cover"
            />
          ) : (() => {
            const styleIdx = getCoverStyleIndex(salon.id || salon.salon_name || '');
            const coverStyle = COVER_STYLES[styleIdx];
            return (
              <div className="relative w-full h-full">
                <img
                  src={coverStyle.bgImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${coverStyle.overlayFrom}, ${coverStyle.overlayTo})` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-2" style={{ color: coverStyle.textColor }}>
                    Beauty Salon
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-center leading-tight drop-shadow-md" style={{ color: coverStyle.textColor }}>
                    {salon.salon_name || '美容院'}
                  </h1>
                  <div className="mt-3 w-16 h-0.5 opacity-60 rounded" style={{ backgroundColor: coverStyle.textColor }} />
                </div>
              </div>
            );
          })()}

          {/* Claimed badge */}
          {isClaimed && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-xs font-semibold text-white px-3 py-1.5 rounded-full shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              已認領
            </div>
          )}

          {/* Status badge on image */}
          {salon.salon_status && salon.salon_status !== 'active' && (
            <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 backdrop-blur-sm text-sm font-semibold px-4 py-2 rounded-full shadow-md ${
              salon.salon_status === 'closed'
                ? 'bg-red-500/90 text-white'
                : salon.salon_status === 'renovation'
                ? 'bg-amber-500/90 text-white'
                : 'bg-slate-500/90 text-white'
            }`}>
              {salon.salon_status === 'closed' && <><Lock className="w-4 h-4" /> 已結業</>}
              {salon.salon_status === 'renovation' && <><Wrench className="w-4 h-4" /> 裝修中</>}
            </div>
          )}
        </div>

        {/* Salon Status Banner */}
        {salon.salon_status && salon.salon_status !== 'active' && (
          <div className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
            salon.salon_status === 'closed'
              ? 'bg-red-50 border border-red-200'
              : salon.salon_status === 'renovation'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              salon.salon_status === 'closed' ? 'bg-red-100' : salon.salon_status === 'renovation' ? 'bg-amber-100' : 'bg-slate-100'
            }`}>
              {salon.salon_status === 'closed' ? (
                <Lock className="w-5 h-5 text-red-500" />
              ) : salon.salon_status === 'renovation' ? (
                <Wrench className="w-5 h-5 text-amber-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div>
              <p className={`font-semibold text-sm ${
                salon.salon_status === 'closed' ? 'text-red-700' : salon.salon_status === 'renovation' ? 'text-amber-700' : 'text-slate-700'
              }`}>
                {salon.salon_status === 'closed' && '此美容院已結業'}
                {salon.salon_status === 'renovation' && '此美容院正在裝修中'}
              </p>
              <p className={`text-xs mt-0.5 ${
                salon.salon_status === 'closed' ? 'text-red-500' : salon.salon_status === 'renovation' ? 'text-amber-500' : 'text-slate-500'
              }`}>
                {salon.salon_status === 'closed' && salon.closed_date && `結業日期：${new Date(salon.closed_date).toLocaleDateString('zh-HK')}`}
                {salon.salon_status === 'renovation' && salon.renovation_date && `裝修開始日期：${new Date(salon.renovation_date).toLocaleDateString('zh-HK')}`}
                {salon.salon_status === 'renovation' && salon.reopened_date && ` · 預計重開日期：${new Date(salon.reopened_date).toLocaleDateString('zh-HK')}`}
              </p>
            </div>
          </div>
        )}

        {/* Salon Name & District */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {salon.salon_name || '未命名美容院'}
          </h1>
          {(salon.district_name || salon.district) && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-medium">{salon.district_name || salon.district}</span>
            </div>
          )}
        </div>

        {/* Quick Contact Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {salon.whatsapp_number && (
            <a
              href={`https://wa.me/${salon.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp 聯絡
            </a>
          )}
          {salon.contact_number && (
            <a
              href={`tel:${salon.contact_number}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <Phone className="w-4 h-4" />
              {salon.contact_number}
            </a>
          )}
          {salon.website && (
            <a
              href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Globe className="w-4 h-4" />
              網站
            </a>
          )}
          {salon.email && (
            <a
              href={`mailto:${salon.email}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors border border-purple-100"
            >
              <Mail className="w-4 h-4" />
              電郵
            </a>
          )}
          {!isClaimed && (
            <Link
              href={`/merchant-signup?type=claim&salon=${encodeURIComponent(JSON.stringify({ salon_name: salon.salon_name, salon_id: salon.id, district: salon.district_name || salon.district || '' }))}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 px-4 py-2 rounded-full hover:bg-rose-100 transition-colors border border-rose-200"
            >
              <Store className="w-4 h-4" />
              認領店家
            </Link>
          )}
        </div>

        {/* Info Cards - Left: Address + Contact, Right: Opening Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Left Column: Address + Contact Person */}
          <div className="space-y-4">
            {/* Address */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 mb-0.5">地址</p>
                  {salon.address ? (
                    <>
                      <p className="text-sm text-slate-700 mb-2">{salon.address}</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-1 px-3 py-2 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors group/map"
                      >
                        <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-medium text-slate-600 group-hover/map:text-rose-600 transition-colors">
                            在 Google Maps 中查看位置
                          </span>
                          <p className="text-[10px] text-slate-400">點擊開啟地圖</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 group-hover/map:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">未有資料</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-0.5">聯絡人</p>
                  <p className={`text-sm ${salon.contact_person ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                    {salon.contact_person || '未有資料'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Opening Hours */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-400 mb-1.5">營業時間</p>
                <div className="space-y-0.5">
                  {getAllHours().map(({ label, hours, isToday }) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between text-xs py-0.5 px-1.5 rounded ${
                        isToday ? 'bg-rose-50 font-semibold' : ''
                      }`}
                    >
                      <span className={`${isToday ? 'text-slate-800' : 'text-slate-500'}`}>
                        {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />}
                        {label}
                      </span>
                      <span className={`${isToday ? 'text-rose-600 font-bold' : hours ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                        {hours || '未有資料'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {salon.description && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              簡介
            </h2>
            <div
              className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-headings:text-slate-800"
              dangerouslySetInnerHTML={{ __html: salon.description }}
            />
          </div>
        )}

        {/* Highlight Tags */}
        {highlights.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              主打服務
            </h2>
            <div className="flex flex-wrap gap-2">
              {highlights.map(tag => (
                <Badge
                  key={tag}
                  className="text-sm border-0 font-normal bg-amber-50 text-amber-700 px-3 py-1"
                >
                  <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                  {removeTagPrefix(tag)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* All Tags - grouped by category */}
        {allTags.length > 0 && (() => {
          const TAG_CATEGORIES: Record<string, { prefix: string; label: string; color: string }> = {
            'face_': { prefix: 'face_', label: '面部基礎護理', color: 'bg-pink-50 text-pink-700' },
            'machine_': { prefix: 'machine_', label: '儀器醫美療程', color: 'bg-violet-50 text-violet-700' },
            'body_': { prefix: 'body_', label: '身體護理', color: 'bg-emerald-50 text-emerald-700' },
            'hair_': { prefix: 'hair_', label: '脫毛服務', color: 'bg-sky-50 text-sky-700' },
            'semi-perm_': { prefix: 'semi-perm_', label: '半永久紋繡', color: 'bg-fuchsia-50 text-fuchsia-700' },
            'eyes_': { prefix: 'eyes_', label: '眼睫服務', color: 'bg-indigo-50 text-indigo-700' },
            'med_': { prefix: 'med_', label: '特殊專科護理', color: 'bg-red-50 text-red-700' },
            'pay_': { prefix: 'pay_', label: '消費透明度', color: 'bg-amber-50 text-amber-700' },
            'quali_': { prefix: 'quali_', label: '品質認證', color: 'bg-lime-50 text-lime-700' },
            'seg_': { prefix: 'seg_', label: '客群特色', color: 'bg-orange-50 text-orange-700' },
            'service_': { prefix: 'service_', label: '專業服務', color: 'bg-teal-50 text-teal-700' },
            'amenities_': { prefix: 'amenities_', label: '便利設施', color: 'bg-cyan-50 text-cyan-700' },
            'booking_': { prefix: 'booking_', label: '語言及預約', color: 'bg-blue-50 text-blue-700' },
          };

          const grouped: Record<string, string[]> = {};
          const uncategorized: string[] = [];
          
          allTags.forEach(tag => {
            let found = false;
            for (const [key, cat] of Object.entries(TAG_CATEGORIES)) {
              if (tag.startsWith(key)) {
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(tag);
                found = true;
                break;
              }
            }
            if (!found) uncategorized.push(tag);
          });

          const categoryOrder = ['face_', 'machine_', 'body_', 'hair_', 'semi-perm_', 'eyes_', 'med_', 'pay_', 'quali_', 'seg_', 'service_', 'amenities_', 'booking_'];

          return (
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                服務標籤
              </h2>
              <div className="space-y-4">
                {categoryOrder.filter(key => grouped[key]?.length > 0).map(key => {
                  const cat = TAG_CATEGORIES[key];
                  return (
                    <div key={key}>
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">{cat.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {grouped[key].map(tag => (
                          <Badge
                            key={tag}
                            className={`text-xs border-0 font-normal px-2.5 py-0.5 ${
                              highlights.includes(tag)
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                : cat.color
                            }`}
                          >
                            {highlights.includes(tag) && <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400 text-amber-400" />}
                            {removeTagPrefix(tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {uncategorized.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">其他</p>
                    <div className="flex flex-wrap gap-1.5">
                      {uncategorized.map(tag => (
                        <Badge
                          key={tag}
                          className={`text-xs border-0 font-normal px-2.5 py-0.5 ${
                            highlights.includes(tag)
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          {highlights.includes(tag) && <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400 text-amber-400" />}
                          {removeTagPrefix(tag)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Media Gallery */}
        {mediaImages.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-rose-400" />
              相片
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {mediaImages.slice(0, 4).map((src, i) => {
                const isLast = i === 3 && mediaImages.length > 4;
                return (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer"
                    onClick={() => { setGalleryIndex(i); setGalleryOpen(true); }}
                  >
                    <img
                      src={src}
                      alt={`${salon.salon_name} - ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">+{mediaImages.length - 3}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lightbox Gallery */}
        {galleryOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl font-light z-50 w-12 h-12 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev - 1 + mediaImages.length) % mediaImages.length); }}
            >
              ‹
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl font-light z-50 w-12 h-12 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev + 1) % mediaImages.length); }}
            >
              ›
            </button>
            <div className="max-w-4xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={mediaImages[galleryIndex]}
                alt={`${salon.salon_name} - ${galleryIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <p className="text-center text-white/70 text-sm mt-3">
                {galleryIndex + 1} / {mediaImages.length}
              </p>
            </div>
          </div>
        )}

        {/* Storefront & Namecard photos */}
        {(salon.storefront_photo || salon.namecard_photo) && (
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-rose-400" />
              店舖相片
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {salon.storefront_photo && (
                <div className="rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={salon.storefront_photo}
                    alt="店舖外觀"
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <p className="text-xs text-slate-400 text-center py-1.5">店舖外觀</p>
                </div>
              )}
              {salon.namecard_photo && (
                <div className="rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={salon.namecard_photo}
                    alt="名片"
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <p className="text-xs text-slate-400 text-center py-1.5">名片</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
