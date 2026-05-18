'use client';

import React, { useState, useEffect } from 'react';
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
import { Search, Store, RefreshCw, ExternalLink, User, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2, Globe, MapPin, Phone, Mail, MessageCircle, Clock, Tag, Image as ImageIcon, FileText, Calendar, Copy, Check } from 'lucide-react';
import SalonOwnerModal from '@/components/admin/SalonOwnerModal';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

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

export default function AdminSalonsPage() {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [claimFilter, setClaimFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [viewDetailsSalon, setViewDetailsSalon] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [labelCategoryMap, setLabelCategoryMap] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleUpdateSalonStatus = async (profileId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const updates: Record<string, any> = { salon_status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'active') {
        updates.closed_date = null;
        updates.renovation_date = null;
      }
      if (newStatus === 'new_opening') {
        updates.created_by = null;
        updates.contact_person = null;
      }
      const { error } = await supabase.from('salon_profiles').update(updates).eq('id', profileId);
      if (error) throw error;
      toast.success(`已更新美容院狀態為「${newStatus === 'active' ? '營業中' : newStatus === 'closed' ? '已結業' : newStatus === 'renovation' ? '裝修中' : newStatus === 'new_opening' ? '新開張' : newStatus}」`);
      if (viewDetailsSalon) {
        setViewDetailsSalon({ ...viewDetailsSalon, salon_status: newStatus });
      }
      setSalons(prev => prev.map(s => s.id === profileId ? { ...s, salon_status: newStatus } : s));
    } catch (e: any) {
      console.error('Failed to update salon status:', e);
      toast.error('更新狀態失敗：' + (e.message || '未知錯誤'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check auth session first
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.warn('No active session - salon_profiles query may return empty due to RLS');
      }

      // Fetch all salon profiles with pagination
      const FETCH_LIMIT = 1000;
      let allProfiles: any[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error, count } = await supabase
          .from('salon_profiles')
          .select('id, salon_name, address, district, district_name, description, image_src, product_media, tags, selected_tags, highlight_tags, seo_title, seo_description, contact_number, whatsapp_number, contact_person, email, website, is_active, product_type, created_by, office_hr_mon, office_hr_tue, office_hr_wed, office_hr_thu, office_hr_fri, office_hr_sat, office_hr_sun, salon_status, closed_date, renovation_date, reopened_date, new_opening_date, created_date, updated_at, shopify_product_id, handle', { count: 'exact' })
          .order('created_date', { ascending: false })
          .range(from, from + FETCH_LIMIT - 1);

        if (error) {
          console.error('Error fetching salon_profiles:', error);
          toast.error('載入美容院資料失敗：' + (error.message || '未知錯誤'));
          break;
        }
        if (data && data.length > 0) {
          allProfiles = [...allProfiles, ...data];
          from += FETCH_LIMIT;
          if (data.length < FETCH_LIMIT) hasMore = false;
        } else {
          if (from === 0) {
            console.warn('salon_profiles returned empty. Count:', count, 'Session:', sessionData?.session?.user?.email);
          }
          hasMore = false;
        }
      }

      // Fetch applications for claim status
      const { data: applications } = await supabase
        .from('salon_applications')
        .select('id, salon_profile_id, application_type, status, contact_person, created_by')
        .eq('application_type', 'claim');

      // Fetch users to map user IDs to emails
      const { data: usersData } = await supabase.from('users').select('id, email, full_name');
      const userMap: Record<string, { email: string; full_name: string }> = {};
      (usersData || []).forEach((u: any) => {
        userMap[u.id] = { email: u.email || '', full_name: u.full_name || '' };
      });

      // Fetch tags for category mapping
      const { data: tagsData } = await supabase.from('salon_tags').select('label, category');
      if (tagsData) {
        const lcMap: Record<string, string> = {};
        tagsData.forEach((t: any) => { lcMap[t.label] = t.category; });
        setLabelCategoryMap(lcMap);
      }

      // Build districts list from profiles
      const districtMap: Record<string, any> = {};
      allProfiles.forEach((p: any) => {
        const dName = p.district_name || p.district;
        if (dName) {
          districtMap[dName] = { id: dName, name: dName };
        }
      });
      setDistricts(Object.values(districtMap));

      // Build application map by salon_profile_id
      const applicationByProfileId: Record<string, any> = {};
      (applications || []).forEach((a: any) => {
        if (a.salon_profile_id) applicationByProfileId[String(a.salon_profile_id)] = a;
      });

      // Map profiles to display items
      const mapped = allProfiles.map((profile: any) => {
        const application = applicationByProfileId[String(profile.id)];

        let claimStatus = 'unclaimed';
        let ownerEmail = null;
        let ownerName = null;

        if (profile.created_by) {
          claimStatus = 'claimed';
          const user = userMap[profile.created_by];
          ownerEmail = user?.email || profile.email || null;
          ownerName = profile.contact_person || user?.full_name || ownerEmail || '(未知用戶)';
        } else if (application && application.status !== 'rejected') {
          claimStatus = application.status === 'approved' ? 'claimed' : 'pending';
          const user = userMap[application.created_by];
          ownerEmail = user?.email || null;
          ownerName = application.contact_person || user?.full_name || ownerEmail || '(未知用戶)';
        }

        // Get first image
        const image = profile.image_src || (profile.product_media && profile.product_media.length > 0 ? profile.product_media[0]?.src || profile.product_media[0] : '');

        return {
          ...profile,
          title: profile.salon_name || '(未命名)',
          image,
          claimStatus,
          ownerEmail,
          ownerName,
        };
      });

      setSalons(mapped);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('載入資料時發生錯誤：' + (error?.message || '未知錯誤'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = salons.filter(p => {
    const matchSearch =
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.district_name || p.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.contact_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchClaim = claimFilter === 'all' || p.claimStatus === claimFilter;
    const matchDistrict = districtFilter === 'all' || p.district_name === districtFilter || p.district === districtFilter;
    return matchSearch && matchClaim && matchDistrict;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: any, bVal: any;
    if (sortField === 'title') { aVal = a.title?.toLowerCase() || ''; bVal = b.title?.toLowerCase() || ''; }
    else if (sortField === 'created_date') { aVal = new Date(a.created_date || 0).getTime(); bVal = new Date(b.created_date || 0).getTime(); }
    else if (sortField === 'district') { aVal = (a.district_name || a.district || '').toLowerCase(); bVal = (b.district_name || b.district || '').toLowerCase(); }
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

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const stats = {
    total: salons.length,
    claimed: salons.filter(p => p.claimStatus === 'claimed').length,
    pending: salons.filter(p => p.claimStatus === 'pending').length,
    unclaimed: salons.filter(p => p.claimStatus === 'unclaimed').length,
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
          <p className="text-sm text-slate-500">從資料庫載入美容院...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">所有美容院</h1>
          <p className="text-slate-500">從 salon_profiles 載入所有美容院資料</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button variant="outline" onClick={loadData} disabled={loading} className="gap-2 border-pink-200 text-pink-600 hover:bg-pink-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />重新整理
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
                  <TableHead className="font-semibold whitespace-nowrap">美容院狀態</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-slate-100" onClick={() => handleSort('created_date')}>
                    建立日期 <SortIcon field="created_date" />
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 whitespace-normal text-sm">{salon.district_name || salon.district || '-'}</TableCell>
                    <TableCell className="whitespace-normal"><ClaimBadge status={salon.claimStatus} /></TableCell>
                    <TableCell className="whitespace-normal">
                      {salon.ownerEmail ? (
                        <button onClick={() => setSelectedSalon(salon)} className="flex items-center gap-1.5 text-pink-600 hover:text-pink-700 hover:underline text-sm">
                          <User className="w-3.5 h-3.5" />{salon.ownerName || salon.ownerEmail}
                        </button>
                      ) : <span className="text-slate-400 text-sm">-</span>}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <Badge className={
                        salon.salon_status === 'closed' ? 'bg-red-100 text-red-600 border-0' :
                        salon.salon_status === 'renovation' ? 'bg-amber-100 text-amber-600 border-0' :
                        salon.salon_status === 'new_opening' ? 'bg-blue-100 text-blue-600 border-0' :
                        'bg-emerald-100 text-emerald-700 border-0'
                      }>
                        {salon.salon_status === 'closed' ? '🔒 已結業' : salon.salon_status === 'renovation' ? '🔧 裝修中' : salon.salon_status === 'new_opening' ? '🆕 新開張' : '✅ 營業中'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                      {salon.created_date ? new Date(salon.created_date).toLocaleDateString('zh-HK', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewDetailsSalon(salon)} className="text-pink-600 hover:bg-pink-50">
                          <Eye className="w-4 h-4 mr-1" />詳情
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => window.open(`/salon/${salon.handle || salon.id}`, '_blank')}
                          title="查看公開頁面"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12">
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
                      {(salon.district_name || salon.district) && <p className="text-sm text-purple-500">{salon.district_name || salon.district}</p>}
                    </div>
                    <ClaimBadge status={salon.claimStatus} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewDetailsSalon(salon)} className="flex-1 text-pink-600 hover:bg-pink-50">
                      <Eye className="w-4 h-4 mr-1" />詳情
                    </Button>
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
            const salon = viewDetailsSalon;

            const DAY_LABELS: Record<string, string> = {
              office_hr_mon: '星期一', office_hr_tue: '星期二', office_hr_wed: '星期三',
              office_hr_thu: '星期四', office_hr_fri: '星期五', office_hr_sat: '星期六', office_hr_sun: '星期日',
            };

            const seoTitle = salon.seo_title || '';
            const seoDescription = salon.seo_description || '';
            const address = salon.address || '';
            const district = salon.district || salon.district_name || '';
            const description = salon.description || '';
            const selectedTags = salon.selected_tags || [];
            const highlightTags = salon.highlight_tags || [];
            const openingHours: Record<string, string> = {};
            Object.keys(DAY_LABELS).forEach(key => {
              openingHours[key] = salon[key] || '';
            });
            const hasOpeningHours = Object.values(openingHours).some(v => v);

            // Images from product_media
            const images = salon.product_media || [];

            // Contact info
            const contactPerson = salon.contact_person || '';
            const contactNumber = salon.contact_number || '';
            const whatsappNumber = salon.whatsapp_number || '';
            const email = salon.email || '';
            const website = salon.website || '';

            return (
            <div className="divide-y">
              {/* Hero Header */}
              <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white shadow-sm shrink-0 border">
                    {salon.image ? (
                      <img src={salon.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Store className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-800 truncate">{salon.title}</h3>
                    {salon.product_type && (
                      <p className="text-sm text-slate-500 mt-0.5">{salon.product_type}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={
                        salon.salon_status === 'closed' ? 'bg-red-100 text-red-700 border-0' :
                        salon.salon_status === 'renovation' ? 'bg-amber-100 text-amber-700 border-0' :
                        salon.salon_status === 'new_opening' ? 'bg-blue-100 text-blue-700 border-0' :
                        'bg-emerald-100 text-emerald-700 border-0'
                      }>
                        {salon.salon_status === 'closed' ? '🔒 已結業' : salon.salon_status === 'renovation' ? '🔧 裝修中' : salon.salon_status === 'new_opening' ? '🆕 新開張' : '✅ 營業中'}
                      </Badge>
                      {salon.claimStatus === 'claimed' && <Badge className="bg-emerald-100 text-emerald-700 border-0">✅ 已認領</Badge>}
                      {salon.claimStatus === 'pending' && <Badge className="bg-amber-100 text-amber-700 border-0">⏳ 待審核</Badge>}
                      {salon.claimStatus === 'unclaimed' && <Badge className="bg-slate-100 text-slate-500 border-0">未認領</Badge>}
                    </div>
                    {/* Quick links */}
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="text-sm gap-1 h-7" onClick={() => window.open(`/salon/${salon.id}`, '_blank')}>
                        <ExternalLink className="w-3 h-3" />查看公開頁面
                      </Button>
                      <Button variant="outline" size="sm" className="text-sm gap-1 h-7" onClick={() => handleCopyText(salon.id, 'id')}>
                        {copiedField === 'id' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        ID: {String(salon.id).slice(0, 8)}...
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 美容院狀態管理 */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4 text-pink-500" />美容院狀態
                </h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-slate-600">目前狀態：</span>
                    <Badge className={
                      salon.salon_status === 'closed' ? 'bg-red-100 text-red-700 border-0' :
                      salon.salon_status === 'renovation' ? 'bg-amber-100 text-amber-700 border-0' :
                      salon.salon_status === 'new_opening' ? 'bg-blue-100 text-blue-700 border-0' :
                      'bg-emerald-100 text-emerald-700 border-0'
                    }>
                      {salon.salon_status === 'closed' ? '🔒 已結業' : salon.salon_status === 'renovation' ? '🔧 裝修中' : salon.salon_status === 'new_opening' ? '🆕 新開張' : '✅ 營業中'}
                    </Badge>
                    {salon.closed_date && salon.salon_status === 'closed' && (
                      <span className="text-xs text-red-500">結業日期：{new Date(salon.closed_date).toLocaleDateString('zh-HK')}</span>
                    )}
                    {salon.renovation_date && salon.salon_status === 'renovation' && (
                      <span className="text-xs text-amber-500">裝修日期：{new Date(salon.renovation_date).toLocaleDateString('zh-HK')}</span>
                    )}
                    {salon.reopened_date && salon.salon_status === 'renovation' && (
                      <span className="text-xs text-amber-500">· 預計重開：{new Date(salon.reopened_date).toLocaleDateString('zh-HK')}</span>
                    )}
                    {salon.new_opening_date && salon.salon_status === 'new_opening' && (
                      <span className="text-xs text-blue-500">開張日期：{new Date(salon.new_opening_date).toLocaleDateString('zh-HK')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">快速設定：</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-7 ${salon.salon_status === 'active' || !salon.salon_status ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}`}
                      disabled={updatingStatus || salon.salon_status === 'active' || !salon.salon_status}
                      onClick={() => handleUpdateSalonStatus(salon.id, 'active')}
                    >
                      ✅ 營業中
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-7 ${salon.salon_status === 'renovation' ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}`}
                      disabled={updatingStatus || salon.salon_status === 'renovation'}
                      onClick={() => handleUpdateSalonStatus(salon.id, 'renovation')}
                    >
                      🔧 裝修中
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-7 ${salon.salon_status === 'closed' ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                      disabled={updatingStatus || salon.salon_status === 'closed'}
                      onClick={() => handleUpdateSalonStatus(salon.id, 'closed')}
                    >
                      🔒 已結業
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`text-xs h-7 ${salon.salon_status === 'new_opening' ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
                      disabled={updatingStatus || salon.salon_status === 'new_opening'}
                      onClick={() => handleUpdateSalonStatus(salon.id, 'new_opening')}
                    >
                      🆕 新開張
                    </Button>
                    {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                </div>
              </div>

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
                      <p className="font-medium">{district || '-'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">網址代碼</p>
                      <p className="font-medium text-sm break-all">{salon.handle || '-'}</p>
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
              {(selectedTags.length > 0 || salon.tags) && (
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
                    }) : (salon.tags || '').split(',').filter(Boolean).map((tag: string, idx: number) => (
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
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 12).map((img: any, idx: number) => {
                      const imgSrc = typeof img === 'string' ? img : img?.src || img?.url || '';
                      return (
                        <a key={idx} href={imgSrc} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 hover:ring-2 ring-pink-300 transition-all cursor-pointer">
                            <img src={imgSrc} alt={`圖片 ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        </a>
                      );
                    })}
                    {images.length > 12 && (
                      <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                        +{images.length - 12} 更多
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Owner 資訊 */}
              {(salon.ownerEmail || salon.ownerName) && (
                <div className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-pink-500" />擁有者資料
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">擁有者名稱</p>
                      <p className="font-medium">{salon.ownerName || '-'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-sm mb-1">擁有者電郵</p>
                      <p className="font-medium text-sm truncate">{salon.ownerEmail || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 建立時間 */}
              <div className="p-6 bg-slate-50/50">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    建立時間：{salon.created_date ? new Date(salon.created_date).toLocaleString('zh-HK') : '-'}
                  </span>
                  <span>Profile ID: {salon.id}</span>
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
