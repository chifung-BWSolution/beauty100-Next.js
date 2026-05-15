'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, CheckCircle } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import DistrictSelect from '@/components/DistrictSelect';

interface District {
  id: string;
  name: string;
}

interface ClaimedSalonData {
  salon_name?: string;
  contact_person?: string;
  contact_number?: string;
  whatsapp_number?: string;
  district?: string;
  shopify_product_id?: string;
  salon_profile_id?: string;
}

interface Props {
  applicationType: string;
  claimedSalonData: ClaimedSalonData | null;
  userEmail: string;
  userFullName: string;
  userId: string;
  initialDistricts: District[];
}

export default function MerchantSignupForm({
  applicationType,
  claimedSalonData,
  userEmail,
  userFullName,
  userId,
  initialDistricts,
}: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState(userFullName);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    salon_name: claimedSalonData?.salon_name || '',
    contact_person: claimedSalonData?.contact_person || '',
    contact_number: claimedSalonData?.contact_number || '',
    whatsapp_number: claimedSalonData?.whatsapp_number || '',
    email: userEmail,
    website: '',
    district: claimedSalonData?.district || '',
    storefront_photo: '',
    namecard_photo: '',
    br_document: '',
    shopify_product_id: claimedSalonData?.shopify_product_id || '',
    salon_profile_id: claimedSalonData?.salon_profile_id || null,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Update full_name in user metadata if changed
      if (fullName && fullName !== userFullName) {
        await supabase.auth.updateUser({ data: { full_name: fullName } });
      }

      const insertData: Record<string, unknown> = {
        ...formData,
        status: 'pending',
        application_type: applicationType,
      };
      if (userId) insertData.created_by = userId;
      if (!formData.salon_profile_id) delete insertData.salon_profile_id;

      const { error } = await supabase.from('salon_applications').insert(insertData);
      if (error) throw error;

      // Log user activity
      try {
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          user_email: userEmail,
          user_name: fullName,
          action: 'submit_application',
          details: `提交了美容院申請：${formData.salon_name}`,
        });
      } catch {}

      setSubmitted(true);
      setTimeout(() => router.push('/application-status'), 2000);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 md:p-8 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100"
            style={{ background: 'linear-gradient(135deg, #d1fae5, #6ee7b7)' }}
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">申請已成功提交！</h2>
          <p className="text-slate-400 text-sm leading-relaxed">感謝您的申請，我們將盡快審核並回覆您。</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(251,207,232,0.4)',
        boxShadow: '0 8px 40px rgba(244,114,182,0.08)',
      }}
    >
      <div className="px-6 pt-6 pb-2 border-b border-rose-50">
        <h2 className="text-base font-bold text-slate-800">
          {applicationType === 'claim' ? '認領美容院資料' : '新增美容院資料'}
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {applicationType === 'claim' ? '補充您認領的美容院資料' : '填寫您的美容院詳細資料'}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              您的姓名 <span className="text-rose-400">*</span>
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="請輸入您的姓名"
              required
              className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                美容院名稱 <span className="text-rose-400">*</span>
              </label>
              <Input
                value={formData.salon_name}
                onChange={(e) => handleChange('salon_name', e.target.value)}
                placeholder="請輸入美容院名稱"
                disabled={applicationType === 'claim'}
                required
                className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">聯絡人</label>
              <Input
                value={formData.contact_person}
                onChange={(e) => handleChange('contact_person', e.target.value)}
                placeholder="例：陳小姐"
                className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                聯絡電話 <span className="text-rose-400">*</span>
              </label>
              <Input
                value={formData.contact_number}
                onChange={(e) => handleChange('contact_number', e.target.value)}
                placeholder="例：2345 6789"
                required
                className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                WhatsApp 號碼 <span className="text-rose-400">*</span>
              </label>
              <Input
                value={formData.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="例：9123 4567"
                required
                className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                電郵地址 <span className="text-rose-400">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="salon@example.com"
                required
                className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">地區</label>
              {initialDistricts.length > 0 ? (
                <DistrictSelect
                  districts={initialDistricts}
                  value={formData.district}
                  onChange={(val) => handleChange('district', val)}
                  triggerClassName="h-12 border-rose-100 bg-rose-50/30 focus:border-rose-300"
                />
              ) : (
                <Input
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="例：中環、銅鑼灣"
                  className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
                />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">網站（選填）</label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.yoursalon.com"
                className="h-12 rounded-xl border-rose-100 bg-rose-50/30 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-rose-100" />
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">文件及相片</span>
              <div className="h-px flex-1 bg-rose-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                label="商業登記證 (BR)"
                value={formData.br_document}
                onChange={(url) => handleChange('br_document', url)}
                accept=".pdf,.jpg,.jpeg,.png"
                description="PDF 或圖片格式"
                required
              />
              <FileUpload
                label="門市相片"
                value={formData.storefront_photo}
                onChange={(url) => handleChange('storefront_photo', url)}
                accept="image/*"
                description="選填"
              />
              <FileUpload
                label="名片相片"
                value={formData.namecard_photo}
                onChange={(url) => handleChange('namecard_photo', url)}
                accept="image/*"
                description="選填"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(applicationType === 'claim' ? '/claim-salon' : '/merchant-onboarding')}
              className="flex-1 h-12 rounded-xl border-rose-200 text-slate-600 hover:bg-rose-50"
            >
              返回
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !fullName ||
                !formData.salon_name ||
                !formData.contact_number ||
                !formData.whatsapp_number ||
                !formData.email ||
                !formData.br_document
              }
              className="flex-[2] h-12 rounded-xl font-semibold text-white border-0 shadow-lg shadow-rose-200/50"
              style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  提交中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />提交申請
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
