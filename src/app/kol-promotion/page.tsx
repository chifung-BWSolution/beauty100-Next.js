'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Send, CheckCircle2, Megaphone, Star, Users, Target } from 'lucide-react';

const PROMOTION_TYPES = [
  { value: '到店體驗', label: '到店體驗' },
  { value: '產品試用', label: '產品試用' },
  { value: '療程體驗', label: '療程體驗' },
  { value: '品牌活動', label: '品牌活動' },
];

const BUDGET_RANGES = [
  { value: '$1,000-3,000', label: '$1,000 - $3,000' },
  { value: '$3,000-5,000', label: '$3,000 - $5,000' },
  { value: '$5,000-10,000', label: '$5,000 - $10,000' },
  { value: '$10,000+', label: '$10,000 以上' },
];

const KOL_TYPES = [
  { value: '美容護膚', label: '美容護膚' },
  { value: '健康養生', label: '健康養生' },
  { value: '生活分享', label: '生活分享' },
  { value: '身材管理', label: '身材管理' },
];

const FOLLOWER_RANGES = [
  { value: '1K-10K', label: '1K - 10K' },
  { value: '10K-50K', label: '10K - 50K' },
  { value: '50K-100K', label: '50K - 100K' },
  { value: '100K+', label: '100K 以上' },
];

const PLATFORMS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: '小紅書', label: '小紅書' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Facebook', label: 'Facebook' },
];

interface SalonProfile {
  id: string;
  salon_name: string;
  contact_person: string | null;
  contact_number: string | null;
  email: string | null;
}

interface SalonContactInfo {
  contact_person: string;
  contact_phone: string;
  contact_email: string;
}

export default function KolPromotionPage() {
  const { user, isLoadingAuth } = useAuth();
  const [salons, setSalons] = useState<SalonProfile[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [selectedSalonIds, setSelectedSalonIds] = useState<string[]>([]);
  const [salonContacts, setSalonContacts] = useState<Record<string, SalonContactInfo>>({});
  const [formData, setFormData] = useState({
    salon_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    promotion_type: '',
    service_description: '',
    budget_range: '',
    preferred_kol_type: [] as string[],
    preferred_followers: '',
    preferred_platform: [] as string[],
    promotion_date: '',
    additional_requirements: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's salons (admin sees all their created salons)
  const userRole = (user as any)?.role || (user as any)?.user_metadata?.role;
  
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user?.id) {
      setLoadingSalons(false);
      return;
    }
    
    const fetchSalons = async () => {
      setLoadingSalons(true);
      console.log('[KOL Promotion] Fetching salons for user:', user.id, 'role:', userRole);
      
      // Always try created_by first (works for both admin and merchant)
      const { data: ownedSalons, error: ownedError } = await supabase
        .from('salon_profiles')
        .select('id, salon_name, contact_person, contact_number, email')
        .eq('created_by', user.id);
      
      console.log('[KOL Promotion] Owned salons result:', ownedSalons, 'error:', ownedError);
      
      if (ownedSalons && ownedSalons.length > 0) {
        setSalons(ownedSalons);
        setLoadingSalons(false);
        return;
      }
      
      // If admin and no owned salons found, try fetching all
      if (userRole === 'admin') {
        const { data: allSalons, error: allError } = await supabase
          .from('salon_profiles')
          .select('id, salon_name, contact_person, contact_number, email')
          .order('salon_name');
        
        console.log('[KOL Promotion] Admin fallback - all salons:', allSalons, 'error:', allError);
        
        if (allSalons && allSalons.length > 0) {
          setSalons(allSalons);
        }
      }
      setLoadingSalons(false);
    };
    
    fetchSalons();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userRole, isLoadingAuth]);

  const toggleSalonSelection = (salonId: string) => {
    setSelectedSalonIds(prev => {
      const next = prev.includes(salonId)
        ? prev.filter(id => id !== salonId)
        : [...prev, salonId];
      
      // Auto-fill salon name
      if (next.length > 0) {
        setFormData(fd => ({
          ...fd,
          salon_name: next.map(id => salons.find(s => s.id === id)?.salon_name || '').join(', '),
        }));
      } else {
        setFormData(fd => ({
          ...fd,
          salon_name: '',
          contact_person: '',
          contact_phone: '',
          contact_email: '',
        }));
      }
      
      return next;
    });

    // Initialize contact info for newly selected salon
    setSalonContacts(prev => {
      if (prev[salonId]) return prev; // already initialized
      const salon = salons.find(s => s.id === salonId);
      return {
        ...prev,
        [salonId]: {
          contact_person: salon?.contact_person || '',
          contact_phone: salon?.contact_number || '',
          contact_email: salon?.email || '',
        },
      };
    });
  };

  const updateSalonContact = (salonId: string, field: keyof SalonContactInfo, value: string) => {
    setSalonContacts(prev => ({
      ...prev,
      [salonId]: {
        ...prev[salonId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate required fields
    if (salons.length > 0) {
      // If user has salons, they must select at least one
      if (selectedSalonIds.length === 0) {
        setError('請至少選擇一間美容院');
        setSubmitting(false);
        return;
      }
      // Validate each selected salon has contact info
      for (const salonId of selectedSalonIds) {
        const contact = salonContacts[salonId];
        if (!contact?.contact_person || !contact?.contact_phone || !contact?.contact_email) {
          const salonName = salons.find(s => s.id === salonId)?.salon_name || '';
          setError(`請填寫「${salonName}」的所有聯絡資料`);
          setSubmitting(false);
          return;
        }
      }
    } else {
      // Manual mode - require all basic fields
      if (!formData.salon_name || !formData.contact_person || !formData.contact_phone || !formData.contact_email) {
        setError('請填寫所有必填欄位');
        setSubmitting(false);
        return;
      }
    }

    if (!formData.promotion_type || !formData.service_description ||
        !formData.budget_range || !formData.preferred_followers) {
      setError('請填寫所有必填欄位');
      setSubmitting(false);
      return;
    }

    if (formData.preferred_kol_type.length === 0) {
      setError('請至少選擇一個 KOL 類型');
      setSubmitting(false);
      return;
    }

    if (formData.preferred_platform.length === 0) {
      setError('請至少選擇一個推廣平台');
      setSubmitting(false);
      return;
    }

    try {
      // Combine contact info from all selected salons (or use manual formData)
      let contactPerson = formData.contact_person;
      let contactPhone = formData.contact_phone;
      let contactEmail = formData.contact_email;

      if (salons.length > 0 && selectedSalonIds.length > 0) {
        contactPerson = selectedSalonIds.map(id => {
          const salonName = salons.find(s => s.id === id)?.salon_name || '';
          const person = salonContacts[id]?.contact_person || '';
          return selectedSalonIds.length > 1 ? `${salonName}: ${person}` : person;
        }).join(' / ');
        contactPhone = selectedSalonIds.map(id => {
          const salonName = salons.find(s => s.id === id)?.salon_name || '';
          const phone = salonContacts[id]?.contact_phone || '';
          return selectedSalonIds.length > 1 ? `${salonName}: ${phone}` : phone;
        }).join(' / ');
        contactEmail = selectedSalonIds.map(id => {
          const salonName = salons.find(s => s.id === id)?.salon_name || '';
          const email = salonContacts[id]?.contact_email || '';
          return selectedSalonIds.length > 1 ? `${salonName}: ${email}` : email;
        }).join(' / ');
      }

      const { error: dbError } = await supabase
        .from('kol_promotion_requests')
        .insert({
          salon_name: formData.salon_name,
          contact_person: contactPerson,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          promotion_type: formData.promotion_type,
          service_description: formData.service_description,
          budget_range: formData.budget_range,
          preferred_kol_type: formData.preferred_kol_type,
          preferred_followers: formData.preferred_followers,
          preferred_platform: formData.preferred_platform,
          promotion_date: formData.promotion_date || null,
          additional_requirements: formData.additional_requirements || null,
        });

      if (dbError) throw dbError;

      setSubmitted(true);
      setSelectedSalonIds([]);
      setFormData({
        salon_name: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        promotion_type: '',
        service_description: '',
        budget_range: '',
        preferred_kol_type: [],
        preferred_followers: '',
        preferred_platform: [],
        promotion_date: '',
        additional_requirements: '',
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArrayItem = (field: 'preferred_kol_type' | 'preferred_platform', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  return (
      <div className="bg-gradient-to-b from-purple-50 via-white to-rose-50 pb-8">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Megaphone className="w-4 h-4" />
            KOL 推廣合作
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            搵 KOL 幫你推廣美容院
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            填寫以下表格，我哋會為你配對最合適嘅 KOL，助你提升品牌知名度同客流量。
          </p>
        </section>

        {/* Features */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">精準配對</h3>
              <p className="text-sm text-slate-500">根據你嘅需求配對最合適嘅 KOL</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-rose-100">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">多平台覆蓋</h3>
              <p className="text-sm text-slate-500">Instagram、小紅書、YouTube 全覆蓋</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">效果追蹤</h3>
              <p className="text-sm text-slate-500">提供推廣效果數據報告</p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {submitted ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">提交成功！</h2>
              <p className="text-slate-600 mb-6">我哋會盡快與你聯絡，為你配對合適嘅 KOL。</p>
              <Button onClick={() => setSubmitted(false)} variant="outline">
                再填寫一份
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b pb-4">KOL 推廣申請表</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">基本資料</h3>
                
                {(isLoadingAuth || loadingSalons) ? (
                  <div className="text-sm text-slate-500 py-2">載入美容院資料中...</div>
                ) : salons.length > 0 ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">選擇美容院 * （可多選）</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {salons.map(salon => (
                        <label key={salon.id} className={`flex items-center gap-2 text-sm cursor-pointer border rounded-lg px-3 py-2.5 transition-colors ${selectedSalonIds.includes(salon.id) ? 'bg-purple-50 border-purple-300' : 'hover:bg-purple-50'}`}>
                          <Checkbox
                            checked={selectedSalonIds.includes(salon.id)}
                            onCheckedChange={() => toggleSalonSelection(salon.id)}
                          />
                          {salon.salon_name}
                        </label>
                      ))}
                    </div>
                    {selectedSalonIds.length > 0 && (
                      <div className="space-y-4 mt-3">
                        <p className="text-sm text-slate-500">每間美容院嘅 KOL 推廣聯絡人（可修改，如負責人同 salon 負責人唔同）</p>
                        {selectedSalonIds.map(salonId => {
                          const salon = salons.find(s => s.id === salonId);
                          const contact = salonContacts[salonId] || { contact_person: '', contact_phone: '', contact_email: '' };
                          return (
                            <div key={salonId} className="bg-slate-50 rounded-lg p-4 space-y-3">
                              <p className="text-sm font-semibold text-purple-700">{salon?.salon_name}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">聯絡人 *</label>
                                  <Input
                                    value={contact.contact_person}
                                    onChange={e => updateSalonContact(salonId, 'contact_person', e.target.value)}
                                    placeholder="KOL 推廣負責人"
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">電話 *</label>
                                  <Input
                                    value={contact.contact_phone}
                                    onChange={e => updateSalonContact(salonId, 'contact_phone', e.target.value)}
                                    placeholder="聯絡電話"
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">電郵 *</label>
                                  <Input
                                    value={contact.contact_email}
                                    onChange={e => updateSalonContact(salonId, 'contact_email', e.target.value)}
                                    placeholder="聯絡電郵"
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">美容院名稱 *</label>
                      <Input
                        value={formData.salon_name}
                        onChange={e => setFormData({ ...formData, salon_name: e.target.value })}
                        placeholder="你的美容院名稱"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">聯絡人姓名 *</label>
                      <Input
                        value={formData.contact_person}
                        onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                        placeholder="負責人姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">聯絡電話 *</label>
                      <Input
                        value={formData.contact_phone}
                        onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+852 XXXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">電郵地址 *</label>
                      <Input
                        type="email"
                        value={formData.contact_email}
                        onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Promotion Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">推廣詳情</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">推廣類型 *</label>
                    <Select value={formData.promotion_type} onValueChange={val => setFormData({ ...formData, promotion_type: val })}>
                      <SelectTrigger><SelectValue placeholder="選擇推廣類型" /></SelectTrigger>
                      <SelectContent>
                        {PROMOTION_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">預算範圍 *</label>
                    <Select value={formData.budget_range} onValueChange={val => setFormData({ ...formData, budget_range: val })}>
                      <SelectTrigger><SelectValue placeholder="選擇預算範圍" /></SelectTrigger>
                      <SelectContent>
                        {BUDGET_RANGES.map(b => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">想推廣嘅服務/產品描述 *</label>
                  <Textarea
                    value={formData.service_description}
                    onChange={e => setFormData({ ...formData, service_description: e.target.value })}
                    placeholder="請描述你想推廣嘅服務或產品..."
                    rows={3}
                  />
                </div>
              </div>

              {/* KOL Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">KOL 偏好</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">希望 KOL 類型 * （可多選）</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {KOL_TYPES.map(t => (
                      <label key={t.value} className="flex items-center gap-2 text-sm cursor-pointer border rounded-lg px-3 py-2 hover:bg-purple-50 transition-colors">
                        <Checkbox
                          checked={formData.preferred_kol_type.includes(t.value)}
                          onCheckedChange={() => toggleArrayItem('preferred_kol_type', t.value)}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">期望 KOL 粉絲數量 *</label>
                  <Select value={formData.preferred_followers} onValueChange={val => setFormData({ ...formData, preferred_followers: val })}>
                    <SelectTrigger><SelectValue placeholder="選擇粉絲數量範圍" /></SelectTrigger>
                    <SelectContent>
                      {FOLLOWER_RANGES.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">期望推廣平台 * （可多選）</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {PLATFORMS.map(p => (
                      <label key={p.value} className="flex items-center gap-2 text-sm cursor-pointer border rounded-lg px-3 py-2 hover:bg-purple-50 transition-colors">
                        <Checkbox
                          checked={formData.preferred_platform.includes(p.value)}
                          onCheckedChange={() => toggleArrayItem('preferred_platform', p.value)}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">其他資料</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">期望推廣時間/檔期</label>
                  <Input
                    value={formData.promotion_date}
                    onChange={e => setFormData({ ...formData, promotion_date: e.target.value })}
                    placeholder="例如：2025年2月 / 農曆新年前後"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">其他要求或備註</label>
                  <Textarea
                    value={formData.additional_requirements}
                    onChange={e => setFormData({ ...formData, additional_requirements: e.target.value })}
                    placeholder="任何其他要求..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white text-base font-medium"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      提交中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      提交申請
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
  );
}
