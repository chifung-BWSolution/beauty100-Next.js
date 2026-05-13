'use client';

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Search, Eye, CheckCircle, XCircle, FileText, Store, Phone, Mail, Globe, MapPin, ExternalLink
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import VersionCompareModal from '@/components/admin/VersionCompareModal';
import { CATEGORY_PREFIX } from '@/components/salon/TagSelector';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [profileVersions, setProfileVersions] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [districts, setDistricts] = useState<any[]>([]);
  const [labelCategoryMap, setLabelCategoryMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveStatus, setApproveStatus] = useState('active');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [appsResult, versionsResult, usersResult, districtsResult, tagsResult] = await Promise.allSettled([
        base44.entities.SalonApplication.list('-created_date'),
        base44.entities.SalonProfileVersion.filter({ status: 'pending_approval' }),
        base44.functions.invoke('listUsers', {}),
        base44.functions.invoke('shopifyData', { type: 'districts' }),
        supabase.from('salon_tags').select('label, category'),
      ]);

      setApplications(appsResult.status === 'fulfilled' ? appsResult.value : []);
      setProfileVersions(versionsResult.status === 'fulfilled' ? versionsResult.value : []);
      setDistricts(districtsResult.status === 'fulfilled' ? (districtsResult.value as any)?.data?.districts || [] : []);

      if (tagsResult.status === 'fulfilled' && (tagsResult.value as any)?.data) {
        const lcMap: Record<string, string> = {};
        (tagsResult.value as any).data.forEach((t: any) => { lcMap[t.label] = t.category; });
        setLabelCategoryMap(lcMap);
      }

      const userMap: Record<string, string> = {};
      if (usersResult.status === 'fulfilled') {
        ((usersResult.value as any)?.data?.users || []).forEach((u: any) => {
          userMap[u.email] = u.full_name || u.email;
        });
      }
      setUsers(userMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buildShopifyTags = (district: string, selectedTagLabels: string[]) => {
    const prefixedLabels = selectedTagLabels.map(label => {
      const cat = labelCategoryMap[label];
      const prefix = cat ? ((CATEGORY_PREFIX as any)[cat] || '') : '';
      return prefix + label;
    });
    return [district, ...prefixedLabels].filter(Boolean);
  };

  const handleApproveApp = async (app: any, targetStatus = 'active') => {
    setProcessing(true);
    try {
      await base44.entities.SalonApplication.update(app.id, { status: 'approved' });
      const existing = await base44.entities.SalonProfile.filter({ application_id: app.id });
      if (existing.length === 0) {
        let shopifyProductId = app.shopify_product_id || '';
        let shopifySynced = false;

        if (app.application_type === 'new' && !shopifyProductId) {
          try {
            const districtObj = districts.find((d: any) => d.name === app.district);
            const selectedTagLabels = Array.isArray(app.selected_tags) && app.selected_tags.length > 0
              ? app.selected_tags
              : (app.tags ? app.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
            const tags = buildShopifyTags(app.district, selectedTagLabels);
            const highlightedService = Array.isArray(app.highlight_tags) ? app.highlight_tags : [];
            const metafields = highlightedService.length > 0 ? [{
              namespace: 'custom', key: 'highlighted_service',
              type: 'list.single_line_text_field', value: JSON.stringify(highlightedService),
            }] : [];
            const productData = {
              title: app.salon_name, product_type: '美容院', vendor: app.salon_name, status: targetStatus,
              tags, handle: '', body_html: '', seo_title: app.salon_name, seo_description: '',
              email: app.email, contact_number: app.contact_number, address: app.address || '',
              district_id: districtObj?.id || '',
              office_hr_mon: '', office_hr_tue: '', office_hr_wed: '', office_hr_thu: '',
              office_hr_fri: '', office_hr_sat: '', office_hr_sun: '',
              product_media: [], metafields,
            };
            const res = await base44.functions.invoke('shopifyData', { type: 'create_product', product: productData });
            if ((res as any).data?.product?.id) {
              shopifyProductId = String((res as any).data.product.id);
              shopifySynced = true;
            }
          } catch (err) { console.error('Failed to create product in Shopify:', err); }
        }

        await base44.entities.SalonProfile.create({
          application_id: app.id, salon_name: app.salon_name, contact_person: app.contact_person || '',
          contact_number: app.contact_number, whatsapp_number: app.whatsapp_number || '',
          email: app.email, website: app.website || '', storefront_photo: app.storefront_photo || '',
          namecard_photo: app.namecard_photo || '', address: app.address || '', district: app.district || '',
          tags: app.tags || '', selected_tags: app.selected_tags || [], highlight_tags: app.highlight_tags || [],
          description: app.description || '', handle: app.handle || '', seo_title: app.seo_title || '',
          seo_description: app.seo_description || '', office_hr_mon: app.office_hr_mon || '',
          office_hr_tue: app.office_hr_tue || '', office_hr_wed: app.office_hr_wed || '',
          office_hr_thu: app.office_hr_thu || '', office_hr_fri: app.office_hr_fri || '',
          office_hr_sat: app.office_hr_sat || '', office_hr_sun: app.office_hr_sun || '',
          product_media: app.product_media || [], shopify_product_id: shopifyProductId,
          shopify_synced: shopifySynced, is_active: true,
        });
      }
      try {
        const user = await base44.auth.me();
        await base44.entities.UserActivityLog.create({
          user_email: (user as any).email, user_name: (user as any).full_name,
          action: 'approve_application', details: `批准了美容院申請：${app.salon_name}`
        });
      } catch (e) { console.error('Failed to log activity', e); }
      await loadData();
      setShowDetailModal(false);
      setShowApproveModal(false);
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  const handleRejectApp = async () => {
    if (!rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await base44.entities.SalonApplication.update(selectedApp.id, { status: 'rejected', rejection_reason: rejectionReason });
      try {
        const user = await base44.auth.me();
        await base44.entities.UserActivityLog.create({
          user_email: (user as any).email, user_name: (user as any).full_name,
          action: 'reject_application', details: `拒絕了美容院申請：${selectedApp.salon_name}，原因：${rejectionReason}`
        });
      } catch (e) { console.error('Failed to log activity', e); }
      await loadData();
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason('');
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  const handleApproveVersion = async (version: any, targetStatus = 'active') => {
    setProcessing(true);
    try {
      const { profile_id, shopify_product_id, status, rejection_reason, id, created_date, updated_date, created_by, version_name, is_starred, ...profileData } = version;
      let shopifySynced = false;
      if (shopify_product_id) {
        try {
          const districtObj = districts.find((d: any) => d.name === profileData.district);
          const selectedTagLabels = Array.isArray(profileData.selected_tags) && profileData.selected_tags.length > 0
            ? profileData.selected_tags
            : (profileData.tags ? profileData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
          const tags = buildShopifyTags(profileData.district, selectedTagLabels);
          const highlightedService = Array.isArray(profileData.highlight_tags) ? profileData.highlight_tags : [];
          const productData = {
            id: shopify_product_id, status: targetStatus, title: profileData.salon_name,
            body_html: profileData.description || '', description: profileData.description || '',
            handle: profileData.handle || '', vendor: profileData.salon_name || '', product_type: '美容院',
            tags, seo_title: profileData.seo_title || '', seo_description: profileData.seo_description || '',
            email: profileData.email || '', contact_number: profileData.contact_number || '',
            address: profileData.address || '', district_id: districtObj?.id || '',
            office_hr_mon: profileData.office_hr_mon || '', office_hr_tue: profileData.office_hr_tue || '',
            office_hr_wed: profileData.office_hr_wed || '', office_hr_thu: profileData.office_hr_thu || '',
            office_hr_fri: profileData.office_hr_fri || '', office_hr_sat: profileData.office_hr_sat || '',
            office_hr_sun: profileData.office_hr_sun || '', product_media: profileData.product_media || [],
            metafields: [{ namespace: 'custom', key: 'highlighted_service', type: 'list.single_line_text_field', value: JSON.stringify(highlightedService) }],
          };
          const res = await base44.functions.invoke('shopifyData', { type: 'update_product', product: productData });
          if ((res as any).data?.error) throw new Error((res as any).data.error);
          shopifySynced = true;
        } catch (err: any) {
          console.error('Failed to update product in Shopify:', err);
          try {
            const user = await base44.auth.me();
            await base44.entities.UserActivityLog.create({
              user_email: (user as any).email, user_name: (user as any).full_name,
              action: 'shopify_api_error', details: `更新 Shopify 產品失敗：${version.salon_name}`,
              is_error: true, error_message: err.message || JSON.stringify(err)
            });
          } catch (e) {}
        }
      }
      await base44.entities.SalonProfile.update(profile_id, { ...profileData, shopify_sync_pending: false, shopify_synced: shopifySynced });
      await base44.entities.SalonProfileVersion.update(version.id, { status: 'approved' });
      try {
        const user = await base44.auth.me();
        await base44.entities.UserActivityLog.create({
          user_email: (user as any).email, user_name: (user as any).full_name,
          action: 'approve_profile_update', details: `批准了美容院資料更新：${version.salon_name}`
        });
      } catch (e) { console.error('Failed to log activity', e); }
      await loadData();
      setShowVersionModal(false);
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  const handleRejectVersion = async () => {
    if (!rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await base44.entities.SalonProfileVersion.update(selectedVersion.id, { status: 'rejected', rejection_reason: rejectionReason });
      await base44.entities.SalonProfile.update(selectedVersion.profile_id, { shopify_sync_pending: false });
      try {
        const user = await base44.auth.me();
        await base44.entities.UserActivityLog.create({
          user_email: (user as any).email, user_name: (user as any).full_name,
          action: 'reject_profile_update', details: `拒絕了美容院資料更新：${selectedVersion.salon_name}，原因：${rejectionReason}`
        });
      } catch (e) { console.error('Failed to log activity', e); }
      await loadData();
      setShowRejectModal(false);
      setShowVersionModal(false);
      setRejectionReason('');
    } catch (e) { console.error(e); }
    finally { setProcessing(false); }
  };

  const pendingApps = applications.filter(app => app.status === 'pending');
  const filteredApps = pendingApps.filter(app =>
    app.salon_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pendingApps: applications.filter(a => a.status === 'pending').length,
    pendingEdits: profileVersions.filter(v => v.submission_type !== 'public_suggestion').length,
    pendingPublicSuggestions: profileVersions.filter(v => v.submission_type === 'public_suggestion').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">申請管理</h1>
        <p className="text-slate-500">審核及管理美容院申請及資料更新</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 max-w-lg">
        {[
          { label: '待審核申請', value: stats.pendingApps, color: 'text-amber-600' },
          { label: '商戶更新', value: stats.pendingEdits, color: 'text-purple-600' },
          { label: '公眾建議', value: stats.pendingPublicSuggestions, color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">入駐申請</TabsTrigger>
          <TabsTrigger value="edits">
            資料更新申請
            {profileVersions.length > 0 && <Badge className="ml-2 bg-fuchsia-600 text-white border-0 h-5 px-1.5 text-sm">{profileVersions.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">待審核申請</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="搜尋美容院..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full md:w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-auto max-h-[55vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold whitespace-nowrap">美容院</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">類型</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">地區</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">日期</TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.map(app => (
                      <TableRow key={app.id} className="hover:bg-slate-50/50">
                        <TableCell className="whitespace-normal">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center shrink-0">
                              {app.storefront_photo ? <img src={app.storefront_photo} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Store className="w-5 h-5 text-pink-500" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 break-words">{app.salon_name}</p>
                              <p className="text-sm text-slate-400 break-all">{users[app.created_by] || app.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <Badge className={app.application_type === 'claim' ? 'bg-purple-100 text-purple-700 border-0' : 'bg-pink-100 text-pink-700 border-0'}>
                            {app.application_type === 'claim' ? '認領' : '新增'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 whitespace-normal">{app.district || '-'}</TableCell>
                        <TableCell className="text-slate-500 text-sm whitespace-normal">{format(new Date(app.created_date), 'MM/dd/yyyy')}</TableCell>
                        <TableCell className="text-right whitespace-normal">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedApp(app); setShowDetailModal(true); }} className="text-pink-600 hover:bg-pink-50 whitespace-nowrap">
                            <Eye className="w-4 h-4 mr-1" />查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredApps.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">沒有待審核的申請</p>
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {filteredApps.map(app => (
                  <Card key={app.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center shrink-0">
                          {app.storefront_photo ? <img src={app.storefront_photo} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Store className="w-5 h-5 text-pink-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{app.salon_name}</p>
                          <p className="text-sm text-slate-400 truncate">{users[app.created_by] || app.email}</p>
                        </div>
                        <Badge className={app.application_type === 'claim' ? 'bg-purple-100 text-purple-700 border-0' : 'bg-pink-100 text-pink-700 border-0'}>
                          {app.application_type === 'claim' ? '認領' : '新增'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between"><span className="text-slate-500">地區</span><span className="font-medium">{app.district || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">日期</span><span className="text-sm text-slate-500">{format(new Date(app.created_date), 'MM/dd')}</span></div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedApp(app); setShowDetailModal(true); }} className="w-full text-pink-600 hover:bg-pink-50">
                        <Eye className="w-4 h-4 mr-1" />查看詳情
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {filteredApps.length === 0 && (
                  <div className="text-center py-12"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">沒有待審核的申請</p></div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edits">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-lg">待審核資料更新</CardTitle></CardHeader>
            <CardContent>
              <div className="hidden md:block overflow-auto max-h-[55vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold whitespace-nowrap">美容院</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">來源</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">更新類型</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">提交者</TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">提交時間</TableHead>
                      <TableHead className="font-semibold text-right whitespace-nowrap">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profileVersions.map(v => {
                      const isPublic = v.submission_type === 'public_suggestion';
                      const changeReasonLabels: Record<string, string> = {
                        new_opening: '🆕 新開張',
                        closed: '🔒 結業',
                        renovation: '🔧 裝修',
                        reopened: '🔄 重開',
                        update_info: '📝 更新資料',
                        upload_photo: '📷 上載相片',
                      };
                      const reasonLabel = v.change_reason ? changeReasonLabels[v.change_reason] || v.change_reason : '-';
                      const dateInfo = v.closed_date ? `結業：${new Date(v.closed_date).toLocaleDateString('zh-HK')}` 
                        : v.renovation_date ? `裝修：${new Date(v.renovation_date).toLocaleDateString('zh-HK')}`
                        : v.reopened_date ? `重開：${new Date(v.reopened_date).toLocaleDateString('zh-HK')}`
                        : v.new_opening_date ? `開張：${new Date(v.new_opening_date).toLocaleDateString('zh-HK')}`
                        : null;
                      return (
                        <TableRow key={v.id} className="hover:bg-slate-50/50">
                          <TableCell className="whitespace-normal">
                            <p className="font-medium text-slate-800 break-words">{v.salon_name}</p>
                            {dateInfo && <p className="text-xs text-amber-600 mt-0.5">{dateInfo}</p>}
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            {isPublic ? (
                              <Badge className="bg-blue-100 text-blue-700 border-0">公眾</Badge>
                            ) : (
                              <Badge className="bg-purple-100 text-purple-700 border-0">商戶</Badge>
                            )}
                            {v.is_shop_owner && (
                              <Badge className="ml-1 bg-amber-100 text-amber-700 border-0 text-xs">負責人</Badge>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-normal text-sm">
                            {reasonLabel}
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            {isPublic ? (
                              <div className="text-sm">
                                <p className="font-medium text-slate-700">{v.submitter_name || '-'}</p>
                                {v.submitter_email && <p className="text-xs text-slate-400">{v.submitter_email}</p>}
                                {v.submitter_phone && <p className="text-xs text-slate-400">{v.submitter_phone}</p>}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400 break-all">{v.created_by_email || users[v.created_by] || '-'}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-500 text-sm whitespace-normal">{format(new Date(v.created_date), 'MM/dd/yyyy HH:mm')}</TableCell>
                          <TableCell className="text-right whitespace-normal">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedVersion(v); setShowVersionModal(true); }} className="text-pink-600 hover:bg-pink-50 whitespace-nowrap">
                              <Eye className="w-4 h-4 mr-1" />審核
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {profileVersions.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">目前沒有待審核的資料更新</p>
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-3">
                {profileVersions.map(v => {
                  const isPublic = v.submission_type === 'public_suggestion';
                  const changeReasonLabels: Record<string, string> = {
                    new_opening: '🆕 新開張',
                    closed: '🔒 結業',
                    renovation: '🔧 裝修',
                    reopened: '🔄 重開',
                    update_info: '📝 更新資料',
                    upload_photo: '📷 上載相片',
                  };
                  const reasonLabel = v.change_reason ? changeReasonLabels[v.change_reason] || v.change_reason : '';
                  const dateInfo = v.closed_date ? `結業：${new Date(v.closed_date).toLocaleDateString('zh-HK')}` 
                    : v.renovation_date ? `裝修：${new Date(v.renovation_date).toLocaleDateString('zh-HK')}`
                    : v.reopened_date ? `重開：${new Date(v.reopened_date).toLocaleDateString('zh-HK')}`
                    : v.new_opening_date ? `開張：${new Date(v.new_opening_date).toLocaleDateString('zh-HK')}`
                    : null;
                  return (
                    <Card key={v.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-800 mb-1">{v.salon_name}</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {isPublic ? (
                                <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">公眾</Badge>
                              ) : (
                                <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">商戶</Badge>
                              )}
                              {v.is_shop_owner && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">負責人</Badge>}
                              {reasonLabel && <Badge variant="outline" className="text-xs">{reasonLabel}</Badge>}
                            </div>
                          </div>
                        </div>
                        {isPublic && v.submitter_name && (
                          <p className="text-sm text-slate-500 mb-1">提交者：{v.submitter_name}</p>
                        )}
                        {!isPublic && (
                          <p className="text-sm text-slate-400 mb-1">{v.created_by_email || users[v.created_by] || '-'}</p>
                        )}
                        {dateInfo && <p className="text-xs text-amber-600 mb-2">{dateInfo}</p>}
                        <div className="text-sm text-slate-500 mb-3">{format(new Date(v.created_date), 'MM/dd HH:mm')}</div>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedVersion(v); setShowVersionModal(true); }} className="w-full text-pink-600 hover:bg-pink-50">
                          <Eye className="w-4 h-4 mr-1" />審核更新
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
                {profileVersions.length === 0 && (
                  <div className="text-center py-12"><CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">目前沒有待審核的資料更新</p></div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    {/* Detail Modal */}
    <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>申請詳情</DialogTitle></DialogHeader>
        {selectedApp && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${selectedApp.status === 'pending' ? 'bg-amber-50' : selectedApp.status === 'approved' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedApp.status} />
                <span className="text-sm text-slate-500">提交於 {format(new Date(selectedApp.created_date), 'yyyy年MM月dd日')}</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">美容院資料</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3"><Store className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-400">美容院名稱</p><p className="font-medium">{selectedApp.salon_name}</p></div></div>
                <div className="flex items-center gap-3"><Store className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-400">聯絡人</p><p className="font-medium">{selectedApp.contact_person || '-'}</p></div></div>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-400">地區</p><p className="font-medium">{selectedApp.district || '-'}</p></div></div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-400">聯絡電話</p><p className="font-medium">{selectedApp.contact_number}</p></div></div>
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-400">電郵地址</p><p className="font-medium">{selectedApp.email}</p></div></div>
                {selectedApp.website && (
                  <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-slate-400" /><div><p className="text-sm text-slate-400">網站</p><a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="font-medium text-fuchsia-600 hover:underline flex items-center gap-1">{selectedApp.website}<ExternalLink className="w-3 h-3" /></a></div></div>
                )}
              </div>
            </div>
            {((Array.isArray(selectedApp.selected_tags) && selectedApp.selected_tags.length > 0) || selectedApp.tags) ? (
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">服務標籤</h3>
                <div className="space-y-3">
                  {Array.isArray(selectedApp.selected_tags) && selectedApp.selected_tags.length > 0 ? (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">已選標籤（按類別）</p>
                      {(() => {
                        const grouped: Record<string, string[]> = {};
                        selectedApp.selected_tags.forEach((label: string) => {
                          const cat = labelCategoryMap[label] || '其他';
                          if (!grouped[cat]) grouped[cat] = [];
                          grouped[cat].push(label);
                        });
                        return Object.entries(grouped).map(([cat, labels]) => (
                          <div key={cat} className="mb-2">
                            <span className="text-sm font-medium text-slate-500 mr-2">{cat}：</span>
                            <span className="inline-flex flex-wrap gap-1">
                              {(labels as string[]).map(l => <Badge key={l} variant="secondary" className="text-sm bg-pink-50 text-pink-700 border border-pink-200">{l}</Badge>)}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : selectedApp.tags ? (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">標籤 (舊格式)</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.tags.split(',').map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-sm">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {Array.isArray(selectedApp.highlight_tags) && selectedApp.highlight_tags.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">⭐ Highlight 服務</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.highlight_tags.map((t: string) => <Badge key={t} className="text-sm bg-amber-50 text-amber-700 border border-amber-300">{t}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">文件及相片</h3>
              <div className="grid grid-cols-3 gap-4">
                {([['br_document','商業登記證'],['storefront_photo','門市相片'],['namecard_photo','名片']] as [string,string][]).map(([key, label]) => selectedApp[key] && (
                  <a key={key} href={selectedApp[key]} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="border rounded-xl p-3 hover:border-fuchsia-300 hover:bg-fuchsia-50/50 transition-colors">
                      <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                        {selectedApp[key].match(/\.(jpg|jpeg|png|webp)$/i) ? <img src={selectedApp[key]} alt={label} className="w-full h-full object-cover" /> : <FileText className="w-8 h-8 text-slate-400" />}
                      </div>
                      <p className="text-sm text-slate-500 text-center">{label}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            {selectedApp.status === 'pending' && (
              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => { setRejectTarget('app'); setShowRejectModal(true); }} className="border-red-200 text-red-600 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" />拒絕
                </Button>
                <Button onClick={() => setShowApproveModal(true)} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="w-4 h-4 mr-2" />批准
                </Button>
              </DialogFooter>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    <VersionCompareModal
      version={selectedVersion}
      open={showVersionModal}
      onClose={() => setShowVersionModal(false)}
      onApprove={(status: string) => handleApproveVersion(selectedVersion, status)}
      onReject={() => { setRejectTarget('version'); setShowRejectModal(true); }}
      processing={processing}
    />

    <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>批准申請</DialogTitle></DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-600 mb-4">
            即將批准 <strong>{selectedApp?.salon_name}</strong> 的申請。
            {selectedApp?.application_type === 'new' && !selectedApp?.shopify_product_id && '系統將會在 Shopify 建立對應的產品。'}
          </p>
          {selectedApp?.application_type === 'new' && !selectedApp?.shopify_product_id && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Shopify 產品狀態</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="approveStatus" value="active" checked={approveStatus === 'active'} onChange={(e) => setApproveStatus(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                  <span className="text-sm">Active (發佈)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="approveStatus" value="draft" checked={approveStatus === 'draft'} onChange={(e) => setApproveStatus(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                  <span className="text-sm">Draft (草稿)</span>
                </label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowApproveModal(false)}>取消</Button>
          <Button onClick={() => handleApproveApp(selectedApp, approveStatus)} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
            {processing ? '處理中...' : '確認批准'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
      <DialogContent>
        <DialogHeader><DialogTitle>拒絕申請</DialogTitle></DialogHeader>
        <div className="py-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">拒絕原因</label>
          <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="請說明拒絕此申請的原因..." rows={4} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRejectModal(false)}>取消</Button>
          <Button onClick={rejectTarget === 'app' ? handleRejectApp : handleRejectVersion} disabled={processing || !rejectionReason.trim()} className="bg-red-600 hover:bg-red-700">
            {processing ? '處理中...' : '確認拒絕'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
