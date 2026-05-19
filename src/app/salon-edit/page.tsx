'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import ShopifyAPI from '@/api/shopify';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DistrictSelect from '@/components/DistrictSelect';
import { Store, Save, MapPin, Tag, Clock, Image, Globe, ArrowLeft, History, Send, CheckCircle, Star, RotateCcw, Info, Eye } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import OpeningHoursEditor from '@/components/salon/OpeningHoursEditor';
import ProductMediaUpload from '@/components/salon/ProductMediaUpload';
import RichTextEditor from '@/components/salon/RichTextEditor';
import TagSelector from '@/components/salon/TagSelector';
import SalonPreviewModal from '@/components/salon/SalonPreviewModal';
import { toast } from 'sonner';
import { format } from 'date-fns';

const EMPTY_FORM: Record<string, any> = {
  salon_name: '', contact_person: '', contact_number: '', whatsapp_number: '', email: '',
  website: '', storefront_photo: '', namecard_photo: '', description: '',
  address: '', district: '', tags: '', handle: '', seo_title: '', seo_description: '',
  office_hr_mon: '', office_hr_tue: '', office_hr_wed: '', office_hr_thu: '',
  office_hr_fri: '', office_hr_sat: '', office_hr_sun: '', product_media: [] as string[],
  selected_tags: [] as string[], highlight_tags: [] as string[], cover_photo: '',
};

function slugify(text: string) {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function VersionHistoryList({ versions, onLoad, onToggleStar, togglingStarId, editingVersionName, setEditingVersionName, versionNameInput, setVersionNameInput, onSaveVersionName, statusBadge, showLoadButton }: any) {
  const starredCount = versions.filter((v: any) => v.is_starred).length;

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mb-3">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium mb-1">版本管理說明</p>
          <ul className="space-y-0.5 text-blue-600">
            <li>• 最多可為 <strong>5 個版本</strong>加星標（⭐）保留</li>
            <li>• 未加星標的版本將於 <strong>90 日後自動刪除</strong></li>
            <li>• 可為每個版本自訂名稱，方便識別</li>
          </ul>
          <p className="mt-1">目前星標版本：{starredCount} / 5</p>
        </div>
      </div>

      {versions.length === 0 && <p className="text-slate-500 text-sm text-center py-4">暫無歷史版本</p>}

      {versions.map((v: any) => (
        <div key={v.id} className={`border rounded-xl p-3.5 ${v.is_starred ? 'border-amber-300 bg-amber-50/30' : ''}`}>
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {statusBadge(v.status)}
              <span className="text-sm text-slate-400">{format(new Date(v.created_date || v.created_at), 'yyyy/MM/dd HH:mm')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleStar(v)}
                disabled={togglingStarId === v.id}
                title={v.is_starred ? '移除星標' : starredCount >= 5 ? '已達最多5個星標' : '加入星標'}
                className={`p-1.5 rounded-lg transition-colors ${v.is_starred ? 'text-amber-500 hover:bg-amber-100' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'}`}
              >
                <Star className={`w-4 h-4 ${v.is_starred ? 'fill-amber-400' : ''}`} />
              </button>
              {showLoadButton && (
                <Button size="sm" variant="outline" onClick={() => onLoad(v)} className="text-sm h-7 px-2">
                  <RotateCcw className="w-3 h-3 mr-1" />載入
                </Button>
              )}
            </div>
          </div>

          {editingVersionName === v.id ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={versionNameInput}
                onChange={(e) => setVersionNameInput(e.target.value)}
                placeholder="輸入版本名稱..."
                className="h-7 text-sm flex-1"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') onSaveVersionName(v); if (e.key === 'Escape') setEditingVersionName(null); }}
                autoFocus
              />
              <Button size="sm" className="h-7 px-2 text-sm" onClick={() => onSaveVersionName(v)}>儲存</Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-sm" onClick={() => setEditingVersionName(null)}>取消</Button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingVersionName(v.id); setVersionNameInput(v.version_name || ''); }}
              className="text-sm font-medium text-slate-700 hover:text-blue-600 mb-1 block w-full text-left"
            >
              {v.version_name || <span className="italic text-slate-400 text-sm">點擊設定版本名稱...</span>}
            </button>
          )}

          <p className="text-sm text-slate-500 truncate">{v.salon_name}</p>
          {v.rejection_reason && <p className="text-sm text-red-600 mt-1">拒絕原因：{v.rejection_reason}</p>}

          {!v.is_starred && v.status !== 'draft' && v.status !== 'pending_approval' && (
            <p className="text-sm text-amber-600 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" />此版本 90 日後將自動刪除（加星標可永久保留）
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SalonEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('id');
  const { user, isLoadingAuth } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>(EMPTY_FORM);
  const [draftVersion, setDraftVersion] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<any>(null);
  const [handleError, setHandleError] = useState('');
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [editingVersionName, setEditingVersionName] = useState<string | null>(null);
  const [versionNameInput, setVersionNameInput] = useState('');
  const [togglingStarId, setTogglingStarId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) { router.replace('/login'); return; }
    if (profileId) loadData();
    else { setLoading(false); }
  }, [profileId, user, isLoadingAuth]);

  const loadData = async () => {
    try {
      const [profileRes, versionsRes, districtsRes] = await Promise.all([
        supabase.from('salon_profiles').select('*').eq('id', profileId).single(),
        supabase.from('salon_profile_versions').select('*').eq('profile_id', profileId).order('created_date', { ascending: false }),
        supabase.from('districts').select('id, name').order('sort_order', { ascending: true }).then(({ data, error }) => { if (error) return { districts: [] }; return { districts: (data || []).map((d: any) => ({ id: d.id, name: d.name })) }; }),
      ]);

      const districtsList = (districtsRes as any)?.districts || [];
      setDistricts(districtsList);

      const p = profileRes.data;
      if (!p) { router.replace('/salon-profile'); return; }
      setProfile(p);

      const allVersions = versionsRes.data || [];
      setVersions(allVersions);

      const pending = allVersions.find((v: any) => v.status === 'pending_approval');
      const isPending = !!pending || p.shopify_sync_pending === true;
      setPendingVersion(isPending ? (pending || { id: 'flag', status: 'pending_approval' }) : null);

      const draft = allVersions.find((v: any) => v.status === 'draft');
      if (draft) {
        setDraftVersion(draft);
        setFormData(extractFormData(draft));
      } else {
        setFormData(extractFormData(p));
        // Prefill from Shopify if we have a product ID and haven't synced yet
        const shopifyId = p.shopify_product_id;
        if (shopifyId && !p.shopify_synced) {
          prefillFromShopify(shopifyId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const prefillFromShopify = async (shopifyProductId: string) => {
    try {
      const numericId = String(shopifyProductId).replace(/.*\//, '');
      const [productRes, metafieldsRes] = await Promise.all([
        ShopifyAPI.getProduct(numericId),
        ShopifyAPI.getProductMetafields(numericId),
      ]);
      const product = (productRes as any)?.product;
      if (!product) return;

      const metafields = (metafieldsRes as any)?.metafields || [];
      let seoTitle = '', seoDescription = '', address = '';
      const officeHours: Record<string, string> = {};

      metafields.forEach((mf: any) => {
        if (mf.namespace === 'global' && mf.key === 'title_tag') seoTitle = mf.value;
        if (mf.namespace === 'global' && mf.key === 'description_tag') seoDescription = mf.value;
        if (mf.namespace === 'custom' && mf.key === 'address') address = mf.value;
        const hrKeys = ['office_hr_mon','office_hr_tue','office_hr_wed','office_hr_thu','office_hr_fri','office_hr_sat','office_hr_sun'];
        if (mf.namespace === 'custom' && hrKeys.includes(mf.key)) officeHours[mf.key] = mf.value;
      });

      setFormData(prev => ({
        ...prev,
        salon_name: product.title || prev.salon_name,
        description: product.body_html || prev.description,
        tags: product.tags || prev.tags,
        handle: product.handle || prev.handle,
        seo_title: seoTitle || prev.seo_title,
        seo_description: seoDescription || prev.seo_description,
        address: address || prev.address,
        ...officeHours,
      }));
      toast.success('已從 Shopify 載入現有資料');
    } catch (e) {
      console.error('Shopify prefill error', e);
    }
  };

  const extractFormData = (src: any) => ({
    salon_name: src.salon_name || '',
    contact_person: src.contact_person || '',
    contact_number: src.contact_number || '',
    whatsapp_number: src.whatsapp_number || '',
    email: src.email || '',
    website: src.website || '',
    storefront_photo: src.storefront_photo || '',
    namecard_photo: src.namecard_photo || '',
    description: src.description || '',
    address: src.address || '',
    district: src.district || '',
    tags: src.tags || '',
    handle: src.handle || '',
    seo_title: src.seo_title || '',
    seo_description: src.seo_description || '',
    office_hr_mon: src.office_hr_mon || '',
    office_hr_tue: src.office_hr_tue || '',
    office_hr_wed: src.office_hr_wed || '',
    office_hr_thu: src.office_hr_thu || '',
    office_hr_fri: src.office_hr_fri || '',
    office_hr_sat: src.office_hr_sat || '',
    office_hr_sun: src.office_hr_sun || '',
    product_media: src.product_media || [],
    selected_tags: Array.isArray(src.selected_tags) ? src.selected_tags : [],
    highlight_tags: Array.isArray(src.highlight_tags) ? src.highlight_tags : [],
    cover_photo: src.cover_photo || '',
  });

  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const checkHandle = async (handleValue: string) => {
    const finalHandle = slugify(handleValue);
    if (!finalHandle) { setHandleError(''); return; }
    setCheckingHandle(true);
    setHandleError('');
    try {
      let handleQuery = supabase.from('salon_profiles').select('id', { count: 'exact', head: true }).eq('handle', finalHandle);
      if (profileId) {
        handleQuery = handleQuery.neq('id', profileId);
      }
      const { count } = await handleQuery;
      if (count && count > 0) {
        setHandleError('此網址代碼 (URL Handle) 已被其他美容院使用，請輸入另一個代碼。');
      }
    } catch (e) { console.error(e); }
    finally { setCheckingHandle(false); }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const finalHandle = slugify(formData.handle);
      const data = { ...formData, handle: finalHandle, profile_id: profileId, shopify_product_id: profile.shopify_product_id || '', status: 'draft' };
      if (draftVersion) {
        await supabase.from('salon_profile_versions').update(data).eq('id', draftVersion.id);
        setDraftVersion((prev: any) => ({ ...prev, ...data }));
        setVersions(prev => prev.map(v => v.id === draftVersion.id ? { ...v, ...data } : v));
      } else {
        const { data: created } = await supabase.from('salon_profile_versions').insert(data).select().single();
        if (created) {
          setDraftVersion(created);
          setVersions(prev => [created, ...prev]);
        }
      }
      setFormData(prev => ({ ...prev, handle: finalHandle }));
      toast.success('草稿已儲存');
    } catch (e) {
      toast.error('儲存草稿失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const originalData = extractFormData(profile);
      let hasChanges = false;
      const fieldsToCompare = Object.keys(EMPTY_FORM);
      for (const field of fieldsToCompare) {
        if (field === 'product_media' || field === 'selected_tags' || field === 'highlight_tags') {
          const orig = originalData[field as keyof typeof originalData] || [];
          const curr = formData[field] || [];
          if (JSON.stringify(orig) !== JSON.stringify(curr)) { hasChanges = true; break; }
        } else {
          if (originalData[field as keyof typeof originalData] !== formData[field]) { hasChanges = true; break; }
        }
      }

      if (!hasChanges) {
        toast.info('資料沒有任何更改，無需提交審核');
        setSubmitting(false);
        return;
      }

      const finalHandle = slugify(formData.handle);
      if (finalHandle) {
        // Check handle uniqueness against local database
        let handleQuery = supabase.from('salon_profiles').select('id', { count: 'exact', head: true }).eq('handle', finalHandle);
        if (profileId) {
          handleQuery = handleQuery.neq('id', profileId);
        }
        const { count: handleCount } = await handleQuery;
        if (handleCount && handleCount > 0) {
          toast.error('此網址代碼 (URL Handle) 已被其他美容院使用，請輸入另一個代碼。');
          setSubmitting(false);
          return;
        }
      }

      const dataToSubmit = { ...formData, handle: finalHandle, profile_id: profileId, shopify_product_id: profile.shopify_product_id || '', status: 'pending_approval' };
      if (draftVersion) {
        await supabase.from('salon_profile_versions').update(dataToSubmit).eq('id', draftVersion.id);
        setVersions(prev => prev.map(v => v.id === draftVersion.id ? { ...v, ...dataToSubmit } : v));
      } else {
        const { data: created } = await supabase.from('salon_profile_versions').insert(dataToSubmit).select().single();
        if (created) setVersions(prev => [created, ...prev]);
      }
      await supabase.from('salon_profiles').update({ shopify_sync_pending: true }).eq('id', profileId);

      setDraftVersion(null);
      toast.success('已提交審核，等待管理員批准');
      router.push('/salon-profile');
    } catch (e) {
      toast.error('提交失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadVersion = (version: any) => {
    setFormData(extractFormData(version));
    setShowHistory(false);
    toast.success('已載入此版本，記得儲存草稿');
  };

  const handleToggleStar = async (version: any) => {
    const starredCount = versions.filter(v => v.is_starred && v.id !== version.id).length;
    if (!version.is_starred && starredCount >= 5) {
      toast.error('最多只能為 5 個版本加星標，請先取消其他版本的星標');
      return;
    }
    setTogglingStarId(version.id);
    try {
      await supabase.from('salon_profile_versions').update({ is_starred: !version.is_starred }).eq('id', version.id);
      setVersions(prev => prev.map(v => v.id === version.id ? { ...v, is_starred: !version.is_starred } : v));
      toast.success(!version.is_starred ? '已加入星標' : '已移除星標');
    } catch (e) {
      toast.error('操作失敗');
    } finally {
      setTogglingStarId(null);
    }
  };

  const handleSaveVersionName = async (version: any) => {
    try {
      await supabase.from('salon_profile_versions').update({ version_name: versionNameInput.trim() }).eq('id', version.id);
      setVersions(prev => prev.map(v => v.id === version.id ? { ...v, version_name: versionNameInput.trim() } : v));
      setEditingVersionName(null);
      toast.success('版本名稱已儲存');
    } catch (e) {
      toast.error('儲存失敗');
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 border-0">已批准</Badge>;
    if (status === 'pending_approval') return <Badge className="bg-amber-100 text-amber-700 border-0">等待審核</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-0">被拒絕</Badge>;
    return <Badge className="bg-slate-100 text-slate-500 border-0">草稿</Badge>;
  };

  if (isLoadingAuth || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">缺少美容院 ID</p>
          <Button onClick={() => router.push('/salon-profile')}>返回</Button>
        </div>
      </div>
    );
  }

  if (pendingVersion) {
    return (
      <div className="p-4 md:p-8 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <button onClick={() => router.push('/salon-profile')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">資料更新審核中</h2>
              <p className="text-slate-500 text-sm mb-6">您提交的資料正由管理員審核，審核完成後才可再次編輯。</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
                  <Eye className="w-4 h-4" />預覽頁面
                </Button>
                <Button variant="outline" onClick={() => setShowHistory(true)} className="gap-2">
                  <History className="w-4 h-4" />查看歷史版本
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>歷史版本</DialogTitle></DialogHeader>
            <VersionHistoryList
              versions={versions} onLoad={handleLoadVersion} onToggleStar={handleToggleStar}
              togglingStarId={togglingStarId} editingVersionName={editingVersionName}
              setEditingVersionName={setEditingVersionName} versionNameInput={versionNameInput}
              setVersionNameInput={setVersionNameInput} onSaveVersionName={handleSaveVersionName}
              statusBadge={statusBadge} showLoadButton={false}
            />
          </DialogContent>
        </Dialog>
        <SalonPreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          formData={formData}
          profileId={profileId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <button onClick={() => router.push('/salon-profile')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">{profile?.salon_name}</h1>
                <p className="text-slate-500 text-sm md:text-sm">編輯美容院資料</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowHistory(true)} className="gap-2 whitespace-nowrap">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">歷史版本</span>
            <span className="sm:hidden">歷史</span>
          </Button>
        </div>

        {draftVersion && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <Save className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-blue-800 text-sm">你有未完成的草稿，上次儲存於 {format(new Date(draftVersion.updated_at || draftVersion.created_at), 'yyyy/MM/dd HH:mm')}。</p>
          </div>
        )}

        {/* Basic Info */}
        <Card className="shadow-sm border-0 mb-6">
          <CardHeader className="pb-4"><CardTitle className="text-lg">基本資料</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">美容院名稱 <span className="text-red-500">*</span></label>
                <Input value={formData.salon_name} onChange={(e) => handleChange('salon_name', e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">聯絡人</label>
                <Input value={formData.contact_person} onChange={(e) => handleChange('contact_person', e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">聯絡電話 <span className="text-red-500">*</span></label>
                <Input value={formData.contact_number} onChange={(e) => handleChange('contact_number', e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp 號碼</label>
                <Input value={formData.whatsapp_number} onChange={(e) => handleChange('whatsapp_number', e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">電郵地址 <span className="text-red-500">*</span></label>
                <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">網站</label>
                <Input value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://" className="h-11" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="shadow-sm border-0 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500" />地址及地區</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">詳細地址</label>
              <Input value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className="h-11" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">地區</label>
              {districts === null ? (
                <DistrictSelect districts={[]} value={formData.district} onChange={() => {}} loading={true} />
              ) : districts.length > 0 ? (
                <DistrictSelect districts={districts} value={formData.district} onChange={(val: string) => handleChange('district', val)} />
              ) : (
                <Input value={formData.district} onChange={(e) => handleChange('district', e.target.value)} placeholder="例：中環" className="h-11" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card className="shadow-sm border-0 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" />每日營業時間</CardTitle>
          </CardHeader>
          <CardContent>
            <OpeningHoursEditor formData={formData} onChange={handleChange} />
          </CardContent>
        </Card>

        {/* Shopify Fields */}
        <Card className="shadow-sm border-0 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2"><Tag className="w-5 h-5 text-blue-500" />Shopify 產品資料</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">美容院簡介</label>
              <RichTextEditor value={formData.description} onChange={(val: string) => handleChange('description', val)} placeholder="向客戶介紹您的美容院..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">服務標籤</label>
              <TagSelector
                selectedTags={formData.selected_tags}
                highlightTags={formData.highlight_tags}
                onChange={({ selectedTags, highlightTags }: any) => {
                  handleChange('selected_tags', selectedTags);
                  handleChange('highlight_tags', highlightTags);
                  handleChange('tags', selectedTags.join(', '));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">網址代碼</label>
              <div className="relative">
                <Input
                  value={formData.handle}
                  onChange={(e) => { handleChange('handle', e.target.value); setHandleError(''); }}
                  onBlur={(e) => checkHandle(e.target.value)}
                  placeholder="例：my-salon-name"
                  className={`h-11 ${handleError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {checkingHandle && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {handleError && <p className="text-sm text-red-500 mt-1">{handleError}</p>}
              {!handleError && (
                <p className="text-sm text-slate-400 mt-1 break-all">
                  https://beauty100-magazine.com/products/
                  {formData.handle && formData.handle.trim()
                    ? encodeURIComponent(formData.handle.trim().toLowerCase().replace(/[\s\u3000]+/g, '-'))
                    : <span className="italic">網址代碼</span>}
                </p>
              )}
            </div>
            <div className="pt-2 border-t space-y-3">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" />SEO 設定</p>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">SEO 頁面標題</label>
                <Input value={formData.seo_title} onChange={(e) => handleChange('seo_title', e.target.value.slice(0, 70))} maxLength={70} className="h-11" />
                <p className="text-sm text-slate-400 mt-1">{(formData.seo_title || '').length} / 70</p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">SEO 頁面描述</label>
                <Textarea value={formData.seo_description} onChange={(e) => handleChange('seo_description', e.target.value.slice(0, 160))} rows={3} maxLength={160} />
                <p className="text-sm text-slate-400 mt-1">{(formData.seo_description || '').length} / 160</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="shadow-sm border-0 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">身份驗證相片</CardTitle>
            <CardDescription>用於管理員核對身份</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload label="門市相片" value={formData.storefront_photo} onChange={(url: string) => handleChange('storefront_photo', url)} accept="image/*" description="展示您的門市外觀" />
              <FileUpload label="名片" value={formData.namecard_photo} onChange={(url: string) => handleChange('namecard_photo', url)} accept="image/*" description="您的名片相片" />
            </div>
          </CardContent>
        </Card>

        {/* Product Media */}
        <Card className="shadow-sm border-0 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2"><Image className="w-5 h-5 text-blue-500" />美容院頁面媒體</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductMediaUpload mediaList={formData.product_media} onChange={(newMedia: string[]) => handleChange('product_media', newMedia)} />
            {/* Cover Photo Selector */}
            {formData.product_media && formData.product_media.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">選擇封面相片（Cover Photo）</p>
                <p className="text-xs text-slate-500 mb-3">揀選一張相片作為美容院頁面嘅封面圖。如未選擇，將自動使用第一張相片。</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {formData.product_media.map((url: string, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => handleChange('cover_photo', formData.cover_photo === url ? '' : url)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-video ${formData.cover_photo === url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <img src={url} alt={`媒體 ${idx + 1}`} className="w-full h-full object-cover" />
                      {formData.cover_photo === url && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-blue-600 drop-shadow" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="gap-2 h-11 sm:h-auto">
              {saving ? <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div><span className="hidden sm:inline">儲存中...</span></> : <><Save className="w-4 h-4" /><span className="hidden sm:inline">儲存草稿</span></>}
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2 h-11 sm:h-auto">
              <Eye className="w-4 h-4" /><span className="hidden sm:inline">預覽</span>
            </Button>
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !!pendingVersion || !!handleError || checkingHandle} className="h-11 sm:h-auto sm:px-8 bg-blue-600 hover:bg-blue-700 gap-2">
            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span className="hidden sm:inline">提交中...</span></> : <><Send className="w-4 h-4" /><span className="hidden sm:inline">提交審核</span></>}
          </Button>
        </div>
        {pendingVersion && <p className="text-sm text-amber-600 text-right mt-2">有版本正在等待審核，請等待批准後再提交新版本。</p>}
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>歷史版本</DialogTitle></DialogHeader>
          <VersionHistoryList
            versions={versions} onLoad={handleLoadVersion} onToggleStar={handleToggleStar}
            togglingStarId={togglingStarId} editingVersionName={editingVersionName}
            setEditingVersionName={setEditingVersionName} versionNameInput={versionNameInput}
            setVersionNameInput={setVersionNameInput} onSaveVersionName={handleSaveVersionName}
            statusBadge={statusBadge} showLoadButton={true}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <SalonPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        profileId={profileId || undefined}
      />
    </div>
  );
}

export default function SalonEditPage() {
  return (
    <>
    <meta name="robots" content="noindex, nofollow" />
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SalonEditContent />
    </Suspense>
    </>
  );
}
