'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  Sparkles, Lock, Wrench, RotateCcw, PenLine, Camera,
  ArrowLeft, Send, CheckCircle2, Search, Store, Loader2,
  Calendar, User, Phone, Mail, MessageSquare, X, Upload, Image as ImageIcon,
} from 'lucide-react';
import { uploadFile } from '@/api/supabaseApi';

const CHANGE_REASONS = [
  { key: 'new_opening', label: '新美容院開張', emoji: '🆕', icon: Sparkles, color: 'from-emerald-50 to-teal-50', border: 'border-emerald-200', text: 'text-emerald-700', description: '報告新開業的美容院' },
  { key: 'closed', label: '美容院結業', emoji: '🔒', icon: Lock, color: 'from-red-50 to-rose-50', border: 'border-red-200', text: 'text-red-700', description: '報告已結業的美容院' },
  { key: 'renovation', label: '美容院裝修', emoji: '🔧', icon: Wrench, color: 'from-amber-50 to-orange-50', border: 'border-amber-200', text: 'text-amber-700', description: '報告正在裝修中的美容院' },
  { key: 'reopened', label: '美容院重開', emoji: '🔄', icon: RotateCcw, color: 'from-blue-50 to-sky-50', border: 'border-blue-200', text: 'text-blue-700', description: '報告重新開業的美容院' },
  { key: 'update_info', label: '更新美容院資料', emoji: '📝', icon: PenLine, color: 'from-purple-50 to-violet-50', border: 'border-purple-200', text: 'text-purple-700', description: '更正或補充美容院資料' },
  { key: 'upload_photo', label: '上載相片', emoji: '📷', icon: Camera, color: 'from-pink-50 to-rose-50', border: 'border-pink-200', text: 'text-pink-700', description: '提供美容院的最新相片' },
];

const DATE_REASONS = ['closed', 'renovation', 'reopened', 'new_opening'];

export default function SuggestSalonUpdatePage() {
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [salonSearch, setSalonSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMerchantPopup, setShowMerchantPopup] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    salon_name: '',
    address: '',
    district: '',
    contact_number: '',
    email: '',
    website: '',
    description: '',
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
    submitter_note: '',
    is_shop_owner: false,
    event_date: '',
  });

  // Photo uploads for upload_photo reason
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Simple math captcha
  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSalons = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const { data } = await supabase
        .from('shopify_products_cache')
        .select('id, title, district_name, handle, image_src')
        .ilike('title', `%${term}%`)
        .limit(10);
      setSearchResults(data || []);
      setShowDropdown((data || []).length > 0);
    } catch {
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (salonSearch.length >= 2 && !selectedSalon) searchSalons(salonSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [salonSearch, searchSalons, selectedSalon]);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setPhotoUploading(true);
    try {
      const { file_url } = await uploadFile({ file });
      setUploadedPhotos(prev => [...prev, file_url]);
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('相片上傳失敗，請重試');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSelectSalon = async (salon: any) => {
    setSelectedSalon(salon);
    setFormData(prev => ({ ...prev, salon_name: salon.title }));
    setSalonSearch(salon.title);
    setSearchResults([]);
    setShowDropdown(false);

    // Pre-fill form data from salon profile if available
    try {
      const { data: profile } = await supabase
        .from('salon_profiles')
        .select('contact_number, email, website, description, address, district')
        .eq('shopify_product_id', String(salon.id))
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          salon_name: salon.title,
          address: profile.address || prev.address,
          district: profile.district || salon.district_name || prev.district,
          contact_number: profile.contact_number || prev.contact_number,
          email: profile.email || prev.email,
          website: profile.website || prev.website,
          description: profile.description || prev.description,
        }));
      } else if (salon.district_name) {
        setFormData(prev => ({
          ...prev,
          salon_name: salon.title,
          district: salon.district_name || prev.district,
        }));
      }
    } catch {
      // If no profile found, at least set district from search result
      if (salon.district_name) {
        setFormData(prev => ({
          ...prev,
          district: salon.district_name || prev.district,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      alert('驗證碼答案不正確，請重試');
      return;
    }

    if (!formData.submitter_name.trim() || !formData.salon_name.trim()) {
      alert('請填寫必填欄位');
      return;
    }

    setSubmitting(true);
    try {
      const reason = CHANGE_REASONS.find(r => r.key === selectedReason);
      const dateField = selectedReason === 'closed' ? 'closed_date'
        : selectedReason === 'renovation' ? 'renovation_date'
        : selectedReason === 'reopened' ? 'reopened_date'
        : selectedReason === 'new_opening' ? 'new_opening_date'
        : null;

      const payload: Record<string, unknown> = {
        salon_name: formData.salon_name,
        submission_type: 'public_suggestion',
        change_reason: selectedReason,
        submitter_name: formData.submitter_name,
        submitter_email: formData.submitter_email || null,
        submitter_phone: formData.submitter_phone || null,
        submitter_note: formData.submitter_note || null,
        is_shop_owner: formData.is_shop_owner,
        status: 'pending_approval',
        created_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (selectedSalon?.id) {
        // Try to find matching salon_profile
        const { data: profile } = await supabase
          .from('salon_profiles')
          .select('id, shopify_product_id')
          .eq('shopify_product_id', String(selectedSalon.id))
          .single();
        if (profile) {
          payload.profile_id = profile.id;
          payload.shopify_product_id = profile.shopify_product_id;
        }
      }

      // Add form fields based on reason
      if (formData.address) payload.address = formData.address;
      if (formData.district) payload.district = formData.district;
      if (formData.contact_number) payload.contact_number = formData.contact_number;
      if (formData.email) payload.email = formData.email;
      if (formData.website) payload.website = formData.website;
      if (formData.description) payload.description = formData.description;

      // Add uploaded photos
      if (uploadedPhotos.length > 0) {
        payload.product_media = uploadedPhotos;
      }

      if (dateField && formData.event_date) {
        payload[dateField] = new Date(formData.event_date).toISOString();
      }

      const { error } = await supabase
        .from('salon_profile_versions')
        .insert(payload);

      if (error) throw error;

      // If is_shop_owner is checked, show the merchant popup instead of going straight to success
      if (formData.is_shop_owner) {
        setShowMerchantPopup(true);
      } else {
        setStep('success');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const reasonInfo = CHANGE_REASONS.find(r => r.key === selectedReason);
  const showDateField = selectedReason && DATE_REASONS.includes(selectedReason);
  const dateLabel = selectedReason === 'closed' ? '結業日期'
    : selectedReason === 'renovation' ? '裝修開始日期'
    : selectedReason === 'reopened' ? '重開日期'
    : selectedReason === 'new_opening' ? '開張日期'
    : '';

  return (
    <PublicLayout>
      {/* Merchant redirect popup */}
      {showMerchantPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">🎉 提交成功！</h3>
              <button
                onClick={() => { setShowMerchantPopup(false); setStep('success'); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              感謝你的提交！我哋留意到你係店舖負責人，你想唔想去<strong>商戶專區</strong>登記？
              登記後你可以直接管理你嘅美容院資料，加入更多詳細資訊、相片同服務。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => { setShowMerchantPopup(false); setStep('success'); }}
              >
                唔使了
              </Button>
              <Button
                className="flex-1 rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
                onClick={() => { window.location.href = '/merchant-signup'; }}
              >
                <Store className="w-4 h-4 mr-2" />
                去商戶專區登記
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #eff6ff 100%)' }}
      >
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative z-10">
          <Badge className="mb-4 bg-rose-100 text-rose-700 border-0 text-sm px-3 py-1">
            📋 公眾資料更新
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
            更新美容院資料
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            協助我哋保持美容院資料最新，你嘅每個報告都好重要！
          </p>
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </section>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* STEP: Select reason */}
        {step === 'select' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 text-center">請選擇更新類型</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHANGE_REASONS.map((reason) => {
                const Icon = reason.icon;
                return (
                  <button
                    key={reason.key}
                    onClick={() => { setSelectedReason(reason.key); setStep('form'); }}
                    className={`group relative overflow-hidden rounded-2xl border-2 ${reason.border} p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                    style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                  >
                    <div className={`bg-gradient-to-br ${reason.color} absolute inset-0`} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{reason.emoji}</span>
                        <h3 className={`text-lg font-bold ${reason.text}`}>{reason.label}</h3>
                      </div>
                      <p className="text-sm text-slate-500">{reason.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP: Form */}
        {step === 'form' && reasonInfo && (
          <div className="space-y-6">
            <button
              onClick={() => { setStep('select'); setSelectedReason(null); setSelectedSalon(null); setSalonSearch(''); }}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回選擇
            </button>

            <div className={`rounded-2xl border-2 ${reasonInfo.border} p-4 sm:p-6`}>
              <div className={`bg-gradient-to-br ${reasonInfo.color} rounded-xl p-4 mb-6`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{reasonInfo.emoji}</span>
                  <div>
                    <h2 className={`text-xl font-bold ${reasonInfo.text}`}>{reasonInfo.label}</h2>
                    <p className="text-sm text-slate-500">{reasonInfo.description}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Salon search */}
                <div ref={dropdownRef}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    美容院名稱 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="搜尋美容院名稱..."
                      value={salonSearch}
                      onChange={(e) => {
                        setSalonSearch(e.target.value);
                        setFormData(prev => ({ ...prev, salon_name: e.target.value }));
                        setSelectedSalon(null);
                        if (e.target.value.length >= 2) {
                          setShowDropdown(true);
                        } else {
                          setShowDropdown(false);
                        }
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0 && !selectedSalon) {
                          setShowDropdown(true);
                        }
                      }}
                      className="pl-9"
                      required
                    />
                    {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                  </div>
                  {showDropdown && searchResults.length > 0 && !selectedSalon && (
                    <div className="mt-1 border rounded-xl bg-white shadow-lg max-h-60 overflow-y-auto z-50 relative">
                      {searchResults.map((salon) => (
                        <button
                          type="button"
                          key={salon.id}
                          onClick={() => handleSelectSalon(salon)}
                          className="flex items-center gap-3 w-full px-4 py-3 hover:bg-rose-50 transition-colors text-left border-b last:border-b-0"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-pink-50 flex items-center justify-center shrink-0">
                            {salon.image_src ? (
                              <img src={salon.image_src} alt="" className="w-10 h-10 object-cover" />
                            ) : (
                              <Store className="w-5 h-5 text-pink-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{salon.title}</p>
                            {salon.district_name && <p className="text-xs text-slate-400">{salon.district_name}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedSalon && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      已選擇：{selectedSalon.title}
                      {selectedSalon.district_name && <span className="text-slate-400">（{selectedSalon.district_name}）</span>}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSalon(null);
                          setSalonSearch('');
                          setFormData(prev => ({
                            ...prev,
                            salon_name: '',
                            address: '',
                            district: '',
                            contact_number: '',
                            email: '',
                            website: '',
                            description: '',
                          }));
                        }}
                        className="ml-auto text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {salonSearch.length >= 2 && searchResults.length === 0 && !searching && !selectedSalon && (
                    <p className="mt-1.5 text-xs text-slate-400">搵唔到？可以直接輸入美容院名稱</p>
                  )}
                </div>

                {/* Date field for status changes */}
                {showDateField && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {dateLabel}
                    </label>
                    <Input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    />
                    <p className="text-xs text-slate-400 mt-1">如果知道確切日期，請填寫</p>
                  </div>
                )}

                {/* Additional fields for update_info reason */}
                {(selectedReason === 'update_info' || selectedReason === 'new_opening') && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-semibold text-slate-600">美容院資料（選填）</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">地址</label>
                        <Input
                          placeholder="詳細地址"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">地區</label>
                        <Input
                          placeholder="例如：銅鑼灣"
                          value={formData.district}
                          onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">聯絡電話</label>
                        <Input
                          placeholder="電話號碼"
                          value={formData.contact_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">電郵</label>
                        <Input
                          placeholder="email@example.com"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-500 mb-1">網站</label>
                        <Input
                          placeholder="https://..."
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <MessageSquare className="inline w-4 h-4 mr-1" />
                    備註
                  </label>
                  <Textarea
                    placeholder="補充說明（選填）..."
                    value={formData.submitter_note}
                    onChange={(e) => setFormData(prev => ({ ...prev, submitter_note: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Submitter info */}
                <div className="border-t pt-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-600">你的聯絡資料</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        <User className="inline w-3 h-3 mr-0.5" />
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="你的姓名"
                        value={formData.submitter_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, submitter_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        <Mail className="inline w-3 h-3 mr-0.5" />
                        電郵（選填）
                      </label>
                      <Input
                        placeholder="email@example.com"
                        type="email"
                        value={formData.submitter_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, submitter_email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        <Phone className="inline w-3 h-3 mr-0.5" />
                        電話（選填）
                      </label>
                      <Input
                        placeholder="電話號碼"
                        value={formData.submitter_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, submitter_phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Is shop owner checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.is_shop_owner}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_shop_owner: e.target.checked }))}
                      className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">我是該店舖負責人</p>
                      <p className="text-xs text-amber-600">如果你是負責人，登記為商家會獲得優先處理及可加入更多資訊</p>
                    </div>
                  </label>
                </div>

                {/* Captcha */}
                <div className="border-t pt-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    🔒 驗證碼
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 rounded-lg px-4 py-2 text-lg font-bold text-slate-700 select-none">
                      {captchaA} + {captchaB} = ?
                    </div>
                    <Input
                      placeholder="答案"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      className="w-24"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting || !formData.submitter_name.trim() || !formData.salon_name.trim()}
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />提交中...</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" />提交更新建議</>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* STEP: Success */}
        {step === 'success' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">感謝你的提交！</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                我哋嘅團隊會盡快審核你嘅更新建議。經審核後，資料會自動更新到相關美容院頁面。
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('select');
                  setSelectedReason(null);
                  setSelectedSalon(null);
                  setSalonSearch('');
                  setFormData({
                    salon_name: '', address: '', district: '', contact_number: '', email: '',
                    website: '', description: '', submitter_name: '', submitter_email: '',
                    submitter_phone: '', submitter_note: '', is_shop_owner: false, event_date: '',
                  });
                  setCaptchaAnswer('');
                }}
                className="rounded-xl"
              >
                <PenLine className="w-4 h-4 mr-2" />
                再提交一個
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="rounded-xl"
                style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
              >
                返回首頁
              </Button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
