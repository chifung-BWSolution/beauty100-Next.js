'use client';

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Search, Store, RefreshCw, ExternalLink, User, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2, Globe, AlertTriangle, MapPin, Phone, Mail, MessageCircle, Clock, Tag, Image as ImageIcon, FileText, Hash, Calendar, Info, Copy, Check } from 'lucide-react';
import ShopifyAPI from '@/api/shopify';
import SalonOwnerModal from '@/components/admin/SalonOwnerModal';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { loadBeautyProductsFromCache, syncShopifyProductsToCache } from '@/api/shopify';

const REGION_GROUPS = [
  { region: '香港島', emoji: '🏙️', districts: ['中環', '上環', '灣仔', '銅鑼灣', '北角', '鰂魚涌', '天后', '炮台山', '柴灣', '西灣河', '西營盤', '香港仔', '堅尼地城', '半山區', '跑馬地'] },
  { region: '九龍', emoji: '🌆', districts: ['尖沙咀', '觀塘', '旺角', '油麻地', '佐敦', '太子', '深水埗', '長沙灣', '荔枝角', '美孚', '九龍城', '九龍塘', '何文田', '紅磡', '九龍灣', '牛頭角', '藍田', '黃大仙', '鑽石山', '新蒲崗', '慈雲山', '大角咀', '彩虹', '樂富'] },
  { region: '新界', emoji: '🌿', districts: ['元朗', '荃灣', '屯門', '大埔', '沙田', '火炭', '馬鞍山', '將軍澳', '天水圍', '葵芳', '葵涌', '青衣', '上水', '粉嶺', '西貢', '大圍', '大窩口', '東涌'] },
  { region: '離島區', emoji: '🏝️', districts: ['離島區'] },
];

function groupDistricts(districts: any[]) {
  const grouped = REGION_GROUPS.map(g => {
    const matched = districts.filter(d => g.districts.some(gd => d.name?.includes(gd) || gd.includes(d.name)));
    return { ...g, items: matched };
  });
  const allGroupedIds = grouped.flatMap(g => g.items.map((d: any) => d.id));
  const ungrouped = districts.filter(d => !allGroupedIds.includes(d.id));
  return { grouped, ungrouped };
}

const PAGE_SIZE = 50;

// Smart link button: active → storefront URL, draft → fetch real preview URL on demand
function PreviewLinkButton({ salon }: { salon: any }) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // For active products, go directly to the storefront
    if (salon.status === 'active' && salon.handle) {
      window.open(`https://2btwx1-uz.myshopify.com/products/${salon.handle}`, '_blank');
      return;
    }

    // For draft products, fetch the real preview URL from Shopify
    if (previewUrl) {
      window.open(previewUrl, '_blank');
      return;
    }

    setLoading(true);
    try {
      const numericId = String(salon.id).replace(/.*\//, '');
      const result = await ShopifyAPI.getProductPreviewUrl(numericId);
      const url = (result as any)?.previewUrl || (result as any)?.adminUrl || null;
      if (url) {
        setPreviewUrl(url);
        window.open(url, '_blank');
      } else {
        // Fallback to admin URL
        window.open(`https://2btwx1-uz.myshopify.com/admin/products/${numericId}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to fetch preview URL:', err);
      // Fallback to admin URL
      const numericId = String(salon.id).replace(/.*\//, '');
      window.open(`https://2btwx1-uz.myshopify.com/admin/products/${numericId}`, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${salon.status === 'active' ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50' : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'}`}
      onClick={handleClick}
      disabled={loading}
      title={salon.status === 'active' ? '查看上架頁面' : '預覽草稿'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ExternalLink className="w-4 h-4" />
      )}
    </Button>
  );
}

export default function AdminSalonsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [claimFilter, setClaimFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [viewDetailsSalon, setViewDetailsSalon] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [labelCategoryMap, setLabelCategoryMap] = useState<Record<string, string>>({});
  const [shopifyDetailLoading, setShopifyDetailLoading] = useState(false);
  const [shopifyDetailData, setShopifyDetailData] = useState<any>(null);
  const [shopifyMetafields, setShopifyMetafields] = useState<any[]>([]);
  const [shopifyDetailError, setShopifyDetailError] = useState<string | null>(null);
  const [cachedRawData, setCachedRawData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const fetchAllBeautyProducts = async () => {
    setLoadingProgress('從資料庫載入美容院...');
    try {
      const products = await loadBeautyProductsFromCache();
      return products;
    } catch (err) {
      console.warn('Failed to load beauty products:', err instanceof Error ? err.message : err);
      return [];
    } finally {
      setLoadingProgress('');
    }
  };

  const handleSyncShopify = async () => {
    setSyncing(true);
    setLoadingProgress('同步 Shopify 資料中...');
    try {
      const result = await syncShopifyProductsToCache();
      toast.success(`同步完成！共 ${result.synced} 間美容院`);
      await loadData();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('同步失敗，請稍後再試');
    } finally {
      setSyncing(false);
      setLoadingProgress('');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [beautyProductsResult, profilesResult, applicationsResult, usersResult, districtsResult, tagsResult] = await Promise.allSettled([
        fetchAllBeautyProducts(),
        base44.entities.SalonProfile.list(),
        base44.entities.SalonApplication.list(),
        base44.functions.invoke('listUsers', {}),
        supabase.from('shopify_products_cache').select('district_id, district_name').not('district_id', 'is', null),
        supabase.from('salon_tags').select('label, category'),
      ]);

      const beautyProducts = beautyProductsResult.status === 'fulfilled' ? beautyProductsResult.value : [];
      const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value : [];
      const applications = applicationsResult.status === 'fulfilled' ? applicationsResult.value : [];
      const users = usersResult.status === 'fulfilled' ? usersResult.value : null;
      const districtsRows = districtsResult.status === 'fulfilled' ? (districtsResult.value as any)?.data || [] : [];

      if (tagsResult.status === 'fulfilled' && (tagsResult.value as any)?.data) {
        const lcMap: Record<string, string> = {};
        (tagsResult.value as any).data.forEach((t: any) => { lcMap[t.label] = t.category; });
        setLabelCategoryMap(lcMap);
      }

      // Build unique districts list from cache
      const districtMap: Record<string, any> = {};
      districtsRows.forEach((r: any) => {
        if (r.district_id) districtMap[r.district_id] = { id: r.district_id, name: r.district_name };
      });
      const districtsList = Object.values(districtMap);
      setDistricts(districtsList);

      const userByEmail: Record<string, string> = {};
      ((users as any)?.data?.users || []).forEach((u: any) => { userByEmail[u.email] = u.full_name || u.email; });

      const profileByShopifyId: Record<string, any> = {};
      (profiles as any[]).forEach(p => { if (p.shopify_product_id) profileByShopifyId[String(p.shopify_product_id)] = p; });

      const applicationByShopifyId: Record<string, any> = {};
      (applications as any[]).forEach(a => { if (a.shopify_product_id && a.application_type === 'claim') applicationByShopifyId[String(a.shopify_product_id)] = a; });

      const merged = (beautyProducts as any[]).map(product => {
        const pid = String(product.id);
        const profile = profileByShopifyId[pid];
        const application = applicationByShopifyId[pid];

        let claimStatus = 'unclaimed';
        let ownerEmail = null;
        let ownerName = null;

        if (profile) {
          claimStatus = 'claimed';
          ownerEmail = profile.created_by;
          ownerName = profile.contact_person || userByEmail[profile.created_by] || profile.created_by;
        } else if (application && application.status !== 'rejected') {
          claimStatus = application.status === 'approved' ? 'claimed' : 'pending';
          ownerEmail = application.created_by;
          ownerName = application.contact_person || userByEmail[application.created_by] || application.created_by;
        }

        return {
          id: product.id, title: product.title, vendor: product.vendor, handle: product.handle,
          status: product.status, tags: product.tags, product_type: product.product_type,
          created_at: product.created_at, image: product.image?.src || product.images?.[0]?.src || '',
          district_id: product.district_id || null, district_name: product.district_name || null,
          claimStatus, ownerEmail, ownerName, profile,
        };
      });

      setProducts(merged);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.profile?.contact_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.profile?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchClaim = claimFilter === 'all' || p.claimStatus === claimFilter;
    const matchDistrict = districtFilter === 'all' || p.district_id === districtFilter || p.district_name === districtFilter;
    return matchSearch && matchClaim && matchDistrict;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: any, bVal: any;
    if (sortField === 'title') { aVal = a.title?.toLowerCase() || ''; bVal = b.title?.toLowerCase() || ''; }
    else if (sortField === 'created_at') { aVal = new Date(a.created_at || 0).getTime(); bVal = new Date(b.created_at || 0).getTime(); }
    else if (sortField === 'district') { aVal = a.district_name?.toLowerCase() || ''; bVal = b.district_name?.toLowerCase() || ''; }
    else if (sortField === 'claimStatus') { aVal = a.claimStatus || ''; bVal = b.claimStatus || ''; }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-slate-300 inline ml-1" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-pink-500 inline ml-1" /> : <ChevronDown className="w-3 h-3 text-pink-500 inline ml-1" />;
  };

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleStatusChange = async (salon: any, newStatus: string) => {
    try {
      const res = await base44.functions.invoke('shopifyData', { type: 'update_product', product: { id: salon.id, status: newStatus } });
      if ((res as any).data?.error) throw new Error((res as any).data.error);
      setProducts(prev => prev.map(p => p.id === salon.id ? { ...p, status: newStatus } : p));
      toast.success('狀態已更新');
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('狀態更新失敗');
    }
  };

  const handleViewDetails = async (salon: any) => {
    setViewDetailsSalon(salon);
    setShopifyDetailData(null);
    setShopifyMetafields([]);
    setShopifyDetailError(null);
    setCachedRawData(null);
    setShopifyDetailLoading(true);

    let hasCachedData = false;

    // Step 1: Try loading from local DB cache (raw_data column) — instant, no edge function needed
    try {
      const { data: cacheRow, error: cacheErr } = await supabase
        .from('shopify_products_cache')
        .select('raw_data')
        .eq('id', String(salon.id))
        .single();

      if (!cacheErr && cacheRow?.raw_data) {
        const raw = typeof cacheRow.raw_data === 'string' ? JSON.parse(cacheRow.raw_data) : cacheRow.raw_data;
        setCachedRawData(raw);
        hasCachedData = true;
        // Use cached data as initial detail data
        const product = raw.product || raw;
        if (product) {
          setShopifyDetailData(product);
        }
      }
    } catch (cacheLoadErr) {
      console.warn('Failed to load raw_data from cache:', cacheLoadErr);
    }

    // Step 2: Try Shopify API for latest data + metafields
    try {
      const numericId = String(salon.id).replace(/.*\//, '');
      const [productRes, metafieldsRes] = await Promise.allSettled([
        ShopifyAPI.getProduct(numericId),
        ShopifyAPI.getProductMetafields(numericId),
      ]);
      if (productRes.status === 'fulfilled' && (productRes.value as any)?.product) {
        setShopifyDetailData((productRes.value as any).product);
      } else if (productRes.status === 'rejected') {
        console.warn('Shopify getProduct failed:', productRes.reason);
        setShopifyDetailError(hasCachedData
          ? '無法從 Shopify 載入最新資料，顯示快取版本'
          : '無法從 Shopify 載入產品詳情（Edge Function 可能需要更新）'
        );
      }
      if (metafieldsRes.status === 'fulfilled') {
        setShopifyMetafields((metafieldsRes.value as any)?.metafields || []);
      } else {
        console.warn('Shopify getProductMetafields failed:', metafieldsRes.reason);
      }
    } catch (err) {
      console.error('Failed to load Shopify details:', err);
      setShopifyDetailError(`Shopify API 呼叫失敗: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setShopifyDetailLoading(false);
    }
  };

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const stats = {
    total: products.length,
    claimed: products.filter(p => p.claimStatus === 'claimed').length,
    pending: products.filter(p => p.claimStatus === 'pending').length,
    unclaimed: products.filter(p => p.claimStatus === 'unclaimed').length,
  };

  const ClaimBadge = ({ status }: { status: string }) => {
    if (status === 'claimed') return <Badge className="bg-emerald-100 text-emerald-700 border-0">已認領</Badge>;
    if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700 border-0">待審核</Badge>;
    return <Badge className="bg-slate-100 text-slate-500 border-0">未認領</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
          {loadingProgress && <p className="text-sm text-slate-500">{loadingProgress}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">所有美容院</h1>
          <p className="text-slate-500">從資料庫快取載入，可手動同步 Shopify 最新資料</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button variant="outline" onClick={loadData} disabled={loading} className="gap-2 border-pink-200 text-pink-600 hover:bg-pink-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />重新整理
          </Button>
          <Button onClick={handleSyncShopify} disabled={syncing || loading} className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '同步 Shopify'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0">
        {[
          { label: '總計', value: stats.total, color: 'text-slate-700' },
          { label: '已認領', value: stats.claimed, color: 'text-emerald-600' },
          { label: '待審核', value: stats.pending, color: 'text-amber-600' },
          { label: '未認領', value: stats.unclaimed, color: 'text-slate-400' },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-4 shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">美容院列表</CardTitle>
              <span className="text-sm text-slate-400">共 {sorted.length} 間</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜尋名稱、負責人、電話或電郵..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 w-full"
                />
              </div>
              <select
                value={districtFilter}
                onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 sm:w-48"
              >
                <option value="all">所有地區</option>
                {(() => {
                  const { grouped, ungrouped } = groupDistricts(districts);
                  return (
                    <>
                      {grouped.map(g => g.items.length === 0 ? null : (
                        <optgroup key={g.region} label={`${g.emoji} ${g.region}`}>
                          {g.items.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </optgroup>
                      ))}
                      {ungrouped.length > 0 && (
                        <optgroup label="其他">
                          {ungrouped.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </optgroup>
                      )}
                    </>
                  );
                })()}
              </select>
              <select
                value={claimFilter}
                onChange={(e) => { setClaimFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 sm:w-36"
              >
                <option value="all">所有狀態</option>
                <option value="claimed">已認領</option>
                <option value="pending">待審核</option>
                <option value="unclaimed">未認領</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
          <div className="hidden md:block overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-slate-100" onClick={() => handleSort('title')}>
                    美容院 <SortIcon field="title" />
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-slate-100" onClick={() => handleSort('district')}>
                    地區 <SortIcon field="district" />
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-slate-100" onClick={() => handleSort('claimStatus')}>
                    認領狀態 <SortIcon field="claimStatus" />
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">負責人</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-slate-100" onClick={() => handleSort('created_at')}>
                    建立日期 <SortIcon field="created_at" />
                  </TableHead>
                  <TableHead className="font-semibold text-right whitespace-nowrap">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((salon) => (
                  <TableRow key={salon.id} className="hover:bg-slate-50/50">
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                          {salon.image ? <img src={salon.image} alt="" className="w-10 h-10 object-cover" /> : <Store className="w-5 h-5 text-pink-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 break-words">{salon.title}</p>
                          <select
                            value={salon.status}
                            onChange={(e) => handleStatusChange(salon, e.target.value)}
                            className={`text-sm mt-1 rounded border px-1.5 py-0.5 focus:outline-none cursor-pointer ${salon.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : salon.status === 'draft' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                          >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 whitespace-normal text-sm">{salon.district_name || '-'}</TableCell>
                    <TableCell className="whitespace-normal"><ClaimBadge status={salon.claimStatus} /></TableCell>
                    <TableCell className="whitespace-normal">
                      {salon.ownerEmail ? (
                        <button onClick={() => setSelectedSalon(salon)} className="flex items-center gap-1.5 text-pink-600 hover:text-pink-700 hover:underline text-sm">
                          <User className="w-3.5 h-3.5" />{salon.ownerName || salon.ownerEmail}
                        </button>
                      ) : <span className="text-slate-400 text-sm">-</span>}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                      {salon.created_at ? new Date(salon.created_at).toLocaleDateString('zh-HK', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(salon)} className="text-pink-600 hover:bg-pink-50">
                          <Eye className="w-4 h-4 mr-1" />詳情
                        </Button>
                        {(salon.handle || salon.id) && (
                          <PreviewLinkButton salon={salon} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">找不到美容院</p>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3 overflow-auto flex-1 min-h-0">
            {paginated.map((salon) => (
              <Card key={salon.id} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                      {salon.image ? <img src={salon.image} alt="" className="w-10 h-10 object-cover" /> : <Store className="w-5 h-5 text-pink-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{salon.title}</p>
                      {salon.district_name && <p className="text-sm text-purple-500">{salon.district_name}</p>}
                    </div>
                    <ClaimBadge status={salon.claimStatus} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(salon)} className="flex-1 text-pink-600 hover:bg-pink-50">
                      <Eye className="w-4 h-4 mr-1" />詳情
                    </Button>
                    {(salon.handle || salon.id) && (
                      <div className="flex-1">
                        <PreviewLinkButton salon={salon} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {paginated.length === 0 && (
              <div className="text-center py-12"><Store className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">找不到美容院</p></div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100 shrink-0">
              <p className="text-sm text-slate-500">第 {safePage} / {totalPages} 頁</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) page = i + 1;
                  else if (safePage <= 3) page = i + 1;
                  else if (safePage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = safePage - 2 + i;
                  return (
                    <Button key={page} variant={safePage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 p-0 ${safePage === page ? 'bg-pink-500 border-pink-500 hover:bg-pink-600' : ''}`}>
                      {page}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SalonOwnerModal salon={selectedSalon} onClose={() => setSelectedSalon(null)} />

      <Dialog open={!!viewDetailsSalon} onOpenChange={(open) => !open && setViewDetailsSalon(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">美容院詳情</DialogTitle>
          </DialogHeader>
          {viewDetailsSalon && (() => {
            const profile = viewDetailsSalon.profile;
            const mfMap: Record<string, string> = {};
            shopifyMetafields.forEach((mf: any) => { mfMap[`${mf.namespace}.${mf.key}`] = mf.value; });
            const getMetafield = (ns: string, key: string) => mfMap[`${ns}.${key}`] || '';

            const DAY_LABELS: Record<string, string> = {
              office_hr_mon: '星期一', office_hr_tue: '星期二', office_hr_wed: '星期三',
              office_hr_thu: '星期四', office_hr_fri: '星期五', office_hr_sat: '星期六', office_hr_sun: '星期日',
            };

            const seoTitle = profile?.seo_title || getMetafield('global', 'title_tag') || shopifyDetailData?.title || '';
            const seoDescription = profile?.seo_description || getMetafield('global', 'description_tag') || '';
            const address = profile?.address || getMetafield('custom', 'address') || '';
            const district = profile?.district || '';
            const description = profile?.description || shopifyDetailData?.body_html || '';
            const selectedTags = profile?.selected_tags || [];
            const highlightTags = profile?.highlight_tags || [];
            const openingHours: Record<string, string> = {};
            Object.keys(DAY_LABELS).forEach(key => {
              openingHours[key] = profile?.[key] || getMetafield('custom', key) || '';
            });
            const hasOpeningHours = Object.values(openingHours).some(v => v);

            // Images: prefer shopifyDetailData, fallback to cached raw_data
            const images = shopifyDetailData?.images || cachedRawData?.images || cachedRawData?.product?.images || [];

            // Contact info
            const contactPerson = profile?.contact_person || '';
            const contactNumber = profile?.contact_number || '';
            const whatsappNumber = profile?.whatsapp_number || '';
            const email = profile?.email || '';
            const website = profile?.website || '';

            // Shopify IDs
            const shopifyProductId = String(viewDetailsSalon.id);
            const numericId = shopifyProductId.replace(/.*\//, '');

            return (
            <div className="divide-y">
              {/* Hero Header */}
              <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white shadow-sm shrink-0 border">
                    {viewDetailsSalon.image ? (
                      <img src={viewDetailsSalon.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Store className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 truncate">{viewDetailsSalon.title}</h3>
                    {viewDetailsSalon.vendor && (
                      <p className="text-sm text-slate-500 mt-0.5">{viewDetailsSalon.vendor}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className={viewDetailsSalon.status === 'active' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-600'}>{viewDetailsSalon.status}</Badge>
                      {viewDetailsSalon.product_type && <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">{viewDetailsSalon.product_type}</Badge>}
                      {viewDetailsSalon.claimStatus === 'claimed' && <Badge className="bg-emerald-100 text-emerald-700 border-0">✅ 已認領</Badge>}
                      {viewDetailsSalon.claimStatus === 'pending' && <Badge className="bg-amber-100 text-amber-700 border-0">⏳ 待審核</Badge>}
                      {viewDetailsSalon.claimStatus === 'unclaimed' && <Badge className="bg-slate-100 text-slate-500 border-0">未認領</Badge>}
                    </div>
                    {/* Quick links */}
                    <div className="flex gap-2 mt-3">
                      {viewDetailsSalon.handle && (
                        <a href={`https://2btwx1-uz.myshopify.com/products/${viewDetailsSalon.handle}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="text-sm gap-1 h-7">
                            <ExternalLink className="w-3 h-3" />Shopify 頁面
                          </Button>
                        </a>
                      )}
                      <Button variant="outline" size="sm" className="text-sm gap-1 h-7" onClick={() => handleCopyText(numericId, 'id')}>
                        {copiedField === 'id' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        ID: {numericId}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {shopifyDetailError && !shopifyDetailLoading && (
                <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">{shopifyDetailError}</p>
                    <p className="text-sm text-amber-600 mt-1">顯示嘅資料來自本地快取{cachedRawData ? '（已有快取資料）' : '（無快取資料）'}</p>
                    <Button variant="outline" size="sm" className="mt-2 text-sm h-7" onClick={() => handleViewDetails(viewDetailsSalon)}>
                      <RefreshCw className="w-3 h-3 mr-1" />重試
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading indicator at top */}
              {shopifyDetailLoading && (
                <div className="flex items-center justify-center py-3 gap-2 text-slate-500 bg-blue-50/50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">正在從 Shopify 載入最新資料...</span>
                </div>
              )}

              {/* 聯絡資料 */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-pink-500" />聯絡資料
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><User className="w-3 h-3" />聯絡人</p>
                    <p className="font-medium">{contactPerson || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />聯絡電話</p>
                    <p className="font-medium">{contactNumber ? (
                      <a href={`tel:${contactNumber}`} className="text-blue-600 hover:underline">{contactNumber}</a>
                    ) : '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" />WhatsApp</p>
                    <p className="font-medium">{whatsappNumber ? (
                      <a href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{whatsappNumber}</a>
                    ) : '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />電郵地址</p>
                    <p className="font-medium truncate">{email ? (
                      <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
                    ) : '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 col-span-2">
                    <p className="text-slate-500 text-sm mb-1 flex items-center gap-1"><Globe className="w-3 h-3" />網站</p>
                    <p className="font-medium break-all">{website ? (
                      <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{website}</a>
                    ) : '-'}</p>
                  </div>
                </div>
              </div>

              {/* 地址及地區 */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-500" />地址及地區
                </h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-sm mb-1">詳細地址</p>
                    <p className="font-medium">{address || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">地區</p>
                      <p className="font-medium">{district || viewDetailsSalon.district_name || '-'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">網址代碼</p>
                      <p className="font-medium text-sm break-all">{viewDetailsSalon.handle || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 美容院簡介 */}
              {description && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-pink-500" />美容院簡介
                  </h4>
                  <div className="bg-white border rounded-lg p-4 text-sm max-h-48 overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: description }} />
                </div>
              )}

              {/* 服務標籤 */}
              {(selectedTags.length > 0 || viewDetailsSalon.tags) && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-pink-500" />服務標籤
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.length > 0 ? selectedTags.map((tag: string, idx: number) => {
                      const category = labelCategoryMap[tag];
                      return (
                        <Badge key={idx} variant="outline" className={`text-sm ${highlightTags.includes(tag) ? 'bg-pink-50 border-pink-300 text-pink-700 font-medium' : ''}`}>
                          {highlightTags.includes(tag) && '⭐ '}{tag}
                          {category && <span className="text-slate-400 ml-1">({category})</span>}
                        </Badge>
                      );
                    }) : (viewDetailsSalon.tags || '').split(',').filter(Boolean).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-sm">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 每日營業時間 */}
              {hasOpeningHours && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-500" />每日營業時間
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    {Object.entries(DAY_LABELS).map(([key, label]) => (
                      <div key={key} className={`rounded-lg p-2.5 ${openingHours[key] ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50'}`}>
                        <p className="text-slate-500 text-sm mb-0.5">{label}</p>
                        <p className={`font-medium text-sm ${openingHours[key] ? 'text-emerald-700' : 'text-slate-400'}`}>{openingHours[key] || '未設定'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO 設定 */}
              {(seoTitle || seoDescription) && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />SEO 設定
                  </h4>
                  <div className="grid grid-cols-1 gap-3 text-sm bg-blue-50/50 p-4 rounded-lg">
                    <div>
                      <p className="text-slate-500 mb-0.5 text-sm">SEO 頁面標題</p>
                      <p className="font-medium">{seoTitle || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5 text-sm">SEO 頁面描述</p>
                      <p className="font-medium text-sm">{seoDescription || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 圖片 / 媒體 */}
              {images && images.length > 0 && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-500" />美容院頁面媒體 ({images.length})
                    {!shopifyDetailData && cachedRawData && (
                      <Badge variant="outline" className="text-[14px] ml-1 text-amber-600 border-amber-200 bg-amber-50">快取</Badge>
                    )}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 12).map((img: any, idx: number) => (
                      <a key={idx} href={img.src} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:ring-2 ring-pink-300 transition-all cursor-pointer">
                          <img src={img.src} alt={`圖片 ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      </a>
                    ))}
                    {images.length > 12 && (
                      <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        +{images.length - 12} 更多
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metafields（如有） */}
              {shopifyMetafields.length > 0 && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-purple-500" />Shopify Metafields ({shopifyMetafields.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm max-h-60 overflow-y-auto">
                    {shopifyMetafields.map((mf: any, idx: number) => (
                      <div key={idx} className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <p className="text-purple-600 text-sm font-mono">{mf.namespace}.{mf.key}</p>
                          <Badge variant="outline" className="text-[14px] text-purple-500 border-purple-200">{mf.type}</Badge>
                        </div>
                        <p className="font-medium mt-1 text-sm break-all">{typeof mf.value === 'string' && mf.value.length > 200 ? mf.value.slice(0, 200) + '...' : String(mf.value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner 資訊 */}
              {(viewDetailsSalon.ownerEmail || viewDetailsSalon.ownerName) && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-500" />擁有者資料
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">擁有者名稱</p>
                      <p className="font-medium">{viewDetailsSalon.ownerName || '-'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">擁有者電郵</p>
                      <p className="font-medium text-sm truncate">{viewDetailsSalon.ownerEmail || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shopify 數據來源 + 建立時間 */}
              <div className="p-6 bg-slate-50/50">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      建立時間：{new Date(viewDetailsSalon.created_at).toLocaleString('zh-HK')}
                    </span>
                    {shopifyDetailData && !shopifyDetailError && (
                      <Badge variant="outline" className="text-[14px] text-emerald-600 border-emerald-200 bg-emerald-50">
                        ✓ Shopify API 已連線
                      </Badge>
                    )}
                    {shopifyDetailError && cachedRawData && (
                      <Badge variant="outline" className="text-[14px] text-amber-600 border-amber-200 bg-amber-50">
                        ⚠ 使用本地快取資料
                      </Badge>
                    )}
                  </div>
                  <span>Shopify ID: {numericId}</span>
                </div>
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
