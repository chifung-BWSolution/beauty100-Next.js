'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, Phone, Globe, Clock, Star, Store,
  MessageCircle, Mail, User, Sparkles, Image as ImageIcon, X,
} from 'lucide-react';

const DAY_KEYS = ['office_hr_mon', 'office_hr_tue', 'office_hr_wed', 'office_hr_thu', 'office_hr_fri', 'office_hr_sat', 'office_hr_sun'] as const;
const DAY_LABELS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

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

interface SalonPreviewModalProps {
  open: boolean;
  onClose: () => void;
  formData: Record<string, any>;
  profileId?: string;
}

export default function SalonPreviewModal({ open, onClose, formData, profileId }: SalonPreviewModalProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const parseTags = (): string[] => {
    const tags: string[] = [];
    if (formData.selected_tags && Array.isArray(formData.selected_tags) && formData.selected_tags.length > 0) {
      tags.push(...formData.selected_tags);
    }
    if (formData.tags) {
      formData.tags.split(',').forEach((t: string) => {
        const trimmed = t.trim();
        if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      });
    }
    return tags;
  };

  const parseHighlightTags = (): string[] => {
    if (!formData.highlight_tags) return [];
    return Array.isArray(formData.highlight_tags) ? formData.highlight_tags : [];
  };

  const getImageSrc = (): string | null => {
    if (formData.product_media && Array.isArray(formData.product_media) && formData.product_media.length > 0) {
      const first = formData.product_media[0];
      if (typeof first === 'string') return first;
      return first?.src || first?.url || null;
    }
    return null;
  };

  const getMediaImages = (): string[] => {
    if (!formData.product_media) return [];
    if (Array.isArray(formData.product_media)) {
      return formData.product_media.map((m: any) => {
        if (typeof m === 'string') return m;
        return m?.src || m?.url || null;
      }).filter(Boolean);
    }
    return [];
  };

  const getAllHours = (): { label: string; hours: string | null; isToday: boolean }[] => {
    const jsDay = new Date().getDay();
    const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
    return DAY_KEYS.map((key, i) => ({
      label: DAY_LABELS[i],
      hours: formData[key] || null,
      isToday: i === todayIndex,
    }));
  };

  const imgSrc = getImageSrc();
  const mediaImages = getMediaImages();
  const allTags = parseTags();
  const highlights = parseHighlightTags();

  const handleSlug = formData.handle
    ? formData.handle.trim().toLowerCase().replace(/[\s\u3000]+/g, '-')
    : '';

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              👁️ 預覽美容院頁面
              <Badge variant="outline" className="text-xs font-normal">未發佈 · 僅供預覽</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* URL preview bar */}
            <div className="mx-6 mb-4 bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono break-all">
              beauty100-magazine.com/salon/{handleSlug || <span className="italic text-slate-400">未設定</span>}
            </div>

            {/* SEO preview */}
            {(formData.seo_title || formData.seo_description) && (
              <div className="mx-6 mb-4 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">搜尋引擎預覽</p>
                <p className="text-blue-700 text-base font-medium truncate">
                  {formData.seo_title || formData.salon_name || '未設定標題'}
                </p>
                <p className="text-xs text-emerald-700 mb-0.5">
                  beauty100-magazine.com/salon/{handleSlug || '...'}
                </p>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {formData.seo_description || '未設定描述'}
                </p>
              </div>
            )}

            {/* Salon page preview content */}
            <div className="px-6 pb-6">
              {/* Hero Image */}
              <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 mb-6">
                {imgSrc ? (
                  <img src={imgSrc} alt={formData.salon_name || '美容院'} className="w-full h-full object-cover" />
                ) : (() => {
                  const styleIdx = getCoverStyleIndex(profileId || formData.salon_name || '');
                  const coverStyle = COVER_STYLES[styleIdx];
                  return (
                    <div className="relative w-full h-full">
                      <img src={coverStyle.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${coverStyle.overlayFrom}, ${coverStyle.overlayTo})` }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-2" style={{ color: coverStyle.textColor }}>Beauty Salon</p>
                        <h1 className="text-2xl font-bold text-center leading-tight drop-shadow-md" style={{ color: coverStyle.textColor }}>
                          {formData.salon_name || '美容院'}
                        </h1>
                        <div className="mt-3 w-16 h-0.5 opacity-60 rounded" style={{ backgroundColor: coverStyle.textColor }} />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Salon Name & District */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  {formData.salon_name || '未命名美容院'}
                </h1>
                {formData.district && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-medium">{formData.district}</span>
                  </div>
                )}
              </div>

              {/* Quick Contact Actions */}
              <div className="flex flex-wrap gap-2 mb-6">
                {formData.whatsapp_number && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <MessageCircle className="w-4 h-4" />WhatsApp 聯絡
                  </span>
                )}
                {formData.contact_number && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    <Phone className="w-4 h-4" />{formData.contact_number}
                  </span>
                )}
                {formData.website && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <Globe className="w-4 h-4" />網站
                  </span>
                )}
                {formData.email && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
                    <Mail className="w-4 h-4" />電郵
                  </span>
                )}
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  {/* Address */}
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-400 mb-0.5">地址</p>
                        <p className={`text-sm ${formData.address ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                          {formData.address || '未有資料'}
                        </p>
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
                        <p className={`text-sm ${formData.contact_person ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                          {formData.contact_person || '未有資料'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-400 mb-1.5">營業時間</p>
                      <div className="space-y-0.5">
                        {getAllHours().map(({ label, hours, isToday }) => (
                          <div key={label} className={`flex items-center justify-between text-xs py-0.5 px-1.5 rounded ${isToday ? 'bg-rose-50 font-semibold' : ''}`}>
                            <span className={isToday ? 'text-slate-800' : 'text-slate-500'}>
                              {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mr-1" />}
                              {label}
                            </span>
                            <span className={isToday ? 'text-rose-600 font-bold' : hours ? 'text-slate-600' : 'text-slate-400 italic'}>
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
              {formData.description && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
                  <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />簡介
                  </h2>
                  <div className="text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: formData.description }} />
                </div>
              )}

              {/* Highlight Tags */}
              {highlights.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
                  <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />主打服務
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map(tag => (
                      <Badge key={tag} className="text-sm border-0 font-normal bg-amber-50 text-amber-700 px-3 py-1">
                        <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />{removeTagPrefix(tag)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* All Tags grouped */}
              {allTags.length > 0 && (() => {
                const grouped: Record<string, string[]> = {};
                const uncategorized: string[] = [];
                allTags.forEach(tag => {
                  let found = false;
                  for (const key of Object.keys(TAG_CATEGORIES)) {
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
                      <Sparkles className="w-4 h-4 text-rose-400" />服務標籤
                    </h2>
                    <div className="space-y-4">
                      {categoryOrder.filter(key => grouped[key]?.length > 0).map(key => {
                        const cat = TAG_CATEGORIES[key];
                        return (
                          <div key={key}>
                            <p className="text-xs font-semibold text-slate-500 mb-1.5">{cat.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {grouped[key].map(tag => (
                                <Badge key={tag} className={`text-xs border-0 font-normal px-2.5 py-0.5 ${highlights.includes(tag) ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : cat.color}`}>
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
                              <Badge key={tag} className={`text-xs border-0 font-normal px-2.5 py-0.5 ${highlights.includes(tag) ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-50 text-slate-600'}`}>
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
                    <ImageIcon className="w-4 h-4 text-rose-400" />相片
                  </h2>
                  <div className="grid grid-cols-4 gap-2">
                    {mediaImages.slice(0, 4).map((src, i) => {
                      const isLast = i === 3 && mediaImages.length > 4;
                      return (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer" onClick={() => { setGalleryIndex(i); setGalleryOpen(true); }}>
                          <img src={src} alt={`${formData.salon_name} - ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
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

              {/* Storefront & Namecard */}
              {(formData.storefront_photo || formData.namecard_photo) && (
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-6">
                  <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-rose-400" />店舖相片
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.storefront_photo && (
                      <div className="rounded-xl overflow-hidden bg-slate-100">
                        <img src={formData.storefront_photo} alt="店舖外觀" className="w-full h-48 object-cover" loading="lazy" />
                        <p className="text-xs text-slate-400 text-center py-1.5">店舖外觀</p>
                      </div>
                    )}
                    {formData.namecard_photo && (
                      <div className="rounded-xl overflow-hidden bg-slate-100">
                        <img src={formData.namecard_photo} alt="名片" className="w-full h-48 object-cover" loading="lazy" />
                        <p className="text-xs text-slate-400 text-center py-1.5">名片</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setGalleryOpen(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-50" onClick={() => setGalleryOpen(false)}>
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl font-light z-50"
            onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev - 1 + mediaImages.length) % mediaImages.length); }}
          >‹</button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl font-light z-50"
            onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev + 1) % mediaImages.length); }}
          >›</button>
          <div className="max-w-4xl max-h-[85vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img src={mediaImages[galleryIndex]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <p className="text-center text-white/70 text-sm mt-3">{galleryIndex + 1} / {mediaImages.length}</p>
          </div>
        </div>
      )}
    </>
  );
}
