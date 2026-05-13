'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, UserCheck, Clock, CheckCircle2, ArrowRightCircle, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type FormStatus = 'pending' | 'in_progress' | 'followed_up';

const STATUS_OPTIONS: { value: FormStatus; label: string; color: string }[] = [
  { value: 'pending', label: '待處理', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: '處理中', color: 'bg-blue-100 text-blue-800' },
  { value: 'followed_up', label: '已跟進', color: 'bg-green-100 text-green-800' },
];

interface Staff {
  id: string;
  user_id: string | null;
  name: string;
  position: string | null;
  is_active: boolean;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: FormStatus;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  staff?: Staff | null;
}

interface KolApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  platform_name: string;
  platform_link: string;
  followers: string;
  content_direction: string;
  region: string;
  experience: string | null;
  introduction: string;
  status: FormStatus;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  staff?: Staff | null;
}

interface KolPromotionRequest {
  id: string;
  salon_name: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  promotion_type: string;
  service_description: string;
  budget_range: string;
  preferred_kol_type: string[];
  preferred_followers: string;
  preferred_platform: string[];
  promotion_date: string | null;
  additional_requirements: string | null;
  status: FormStatus;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  staff?: Staff | null;
}

export default function AdminEnquiriesPage() {
  const { user } = useAuth();
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [kolApplications, setKolApplications] = useState<KolApplication[]>([]);
  const [kolPromotionRequests, setKolPromotionRequests] = useState<KolPromotionRequest[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [selectedKol, setSelectedKol] = useState<KolApplication | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<KolPromotionRequest | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Find current staff by user_id
    if (user && staffList.length > 0) {
      const myStaff = staffList.find(s => s.user_id === user.id);
      setCurrentStaff(myStaff || null);
    }
  }, [user, staffList]);

  const loadData = async () => {
    try {
      const [contactRes, kolRes, promoRes, staffRes] = await Promise.all([
        supabase.from('contact_submissions').select('*, staff:handled_by(id, name, position)').order('created_at', { ascending: false }),
        supabase.from('kol_applications').select('*, staff:handled_by(id, name, position)').order('created_at', { ascending: false }),
        supabase.from('kol_promotion_requests').select('*, staff:handled_by(id, name, position)').order('created_at', { ascending: false }),
        supabase.from('staff').select('*').eq('is_active', true).order('name'),
      ]);

      if (contactRes.data) setContactSubmissions(contactRes.data as any);
      if (kolRes.data) setKolApplications(kolRes.data as any);
      if (promoRes.data) setKolPromotionRequests(promoRes.data as any);
      if (staffRes.data) setStaffList(staffRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (id: string, status: FormStatus) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('更新狀態失敗');
      return;
    }
    toast.success('狀態已更新');
    setContactSubmissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const updateKolStatus = async (id: string, status: FormStatus) => {
    const { error } = await supabase
      .from('kol_applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('更新狀態失敗');
      return;
    }
    toast.success('狀態已更新');
    setKolApplications(prev => prev.map(k => k.id === id ? { ...k, status } : k));
  };

  const handleContactClaim = async (id: string) => {
    if (!currentStaff) {
      toast.error('找不到你的 Staff 記錄，請聯繫管理員設定');
      return;
    }

    const { error } = await supabase
      .from('contact_submissions')
      .update({ handled_by: currentStaff.id, handled_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('認領失敗');
      return;
    }
    toast.success(`已認領，負責人：${currentStaff.name}`);
    setContactSubmissions(prev =>
      prev.map(c => c.id === id ? { ...c, handled_by: currentStaff.id, handled_at: new Date().toISOString(), staff: currentStaff } : c)
    );
  };

  const handleKolClaim = async (id: string) => {
    if (!currentStaff) {
      toast.error('找不到你的 Staff 記錄，請聯繫管理員設定');
      return;
    }

    const { error } = await supabase
      .from('kol_applications')
      .update({ handled_by: currentStaff.id, handled_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('認領失敗');
      return;
    }
    toast.success(`已認領，負責人：${currentStaff.name}`);
    setKolApplications(prev =>
      prev.map(k => k.id === id ? { ...k, handled_by: currentStaff.id, handled_at: new Date().toISOString(), staff: currentStaff } : k)
    );
  };

  const updatePromotionStatus = async (id: string, status: FormStatus) => {
    const { error } = await supabase
      .from('kol_promotion_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('更新狀態失敗');
      return;
    }
    toast.success('狀態已更新');
    setKolPromotionRequests(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handlePromotionClaim = async (id: string) => {
    if (!currentStaff) {
      toast.error('找不到你的 Staff 記錄，請聯繫管理員設定');
      return;
    }

    const { error } = await supabase
      .from('kol_promotion_requests')
      .update({ handled_by: currentStaff.id, handled_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('認領失敗');
      return;
    }
    toast.success(`已認領，負責人：${currentStaff.name}`);
    setKolPromotionRequests(prev =>
      prev.map(p => p.id === id ? { ...p, handled_by: currentStaff.id, handled_at: new Date().toISOString(), staff: currentStaff } : p)
    );
  };

  const getStatusBadge = (status: FormStatus) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return <Badge className={`${opt.color} border-0 font-medium`}>{opt.label}</Badge>;
  };

  const pendingContactCount = contactSubmissions.filter(c => c.status === 'pending').length;
  const pendingKolCount = kolApplications.filter(k => k.status === 'pending').length;
  const pendingPromotionCount = kolPromotionRequests.filter(p => p.status === 'pending').length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">表單查詢管理</h1>
        <p className="text-slate-500 mt-1">管理聯絡表單、KOL 合作申請及 KOL 推廣申請</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingContactCount + pendingKolCount + pendingPromotionCount}</p>
              <p className="text-xs text-slate-500">待處理</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contactSubmissions.length}</p>
              <p className="text-xs text-slate-500">聯絡查詢</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kolApplications.length}</p>
              <p className="text-xs text-slate-500">KOL 申請</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kolPromotionRequests.length}</p>
              <p className="text-xs text-slate-500">KOL 推廣</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {contactSubmissions.filter(c => c.status === 'followed_up').length + kolApplications.filter(k => k.status === 'followed_up').length + kolPromotionRequests.filter(p => p.status === 'followed_up').length}
              </p>
              <p className="text-xs text-slate-500">已跟進</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Staff Info */}
      {currentStaff && (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
          <UserCheck className="w-4 h-4" />
          <span>你目前的 Staff 身份：<strong>{currentStaff.name}</strong>{currentStaff.position && ` (${currentStaff.position})`}</span>
        </div>
      )}

      {!currentStaff && user && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>你尚未設定 Staff 記錄，認領功能暫不可用。請到「用戶管理」頁面的 Staff 管理新增。</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="contact" className="w-full">
        <TabsList>
          <TabsTrigger value="contact" className="gap-1">
            聯絡查詢
            {pendingContactCount > 0 && (
              <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0 ml-1">{pendingContactCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="kol" className="gap-1">
            KOL 申請
            {pendingKolCount > 0 && (
              <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0 ml-1">{pendingKolCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="promotion" className="gap-1">
            KOL 推廣
            {pendingPromotionCount > 0 && (
              <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0 ml-1">{pendingPromotionCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Contact Submissions Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">聯絡表單提交</CardTitle>
            </CardHeader>
            <CardContent>
              {contactSubmissions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">暫無聯絡查詢</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>姓名</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>主題</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>負責人</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactSubmissions.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm">{item.email}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{item.subject}</TableCell>
                          <TableCell>
                            <Select
                              value={item.status || 'pending'}
                              onValueChange={(val) => updateContactStatus(item.id, val as FormStatus)}
                            >
                              <SelectTrigger className="w-[110px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {item.staff ? (
                              <span className="text-sm font-medium text-slate-700">{(item.staff as any).name}</span>
                            ) : (
                              <span className="text-xs text-slate-400">未指派</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => setSelectedContact(item)}
                              >
                                查看
                              </Button>
                              {!item.handled_by && (
                                <Button
                                  size="sm"
                                  className="text-xs h-7 bg-rose-500 hover:bg-rose-600 text-white"
                                  onClick={() => handleContactClaim(item.id)}
                                  disabled={!currentStaff}
                                >
                                  認領
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KOL Applications Tab */}
        <TabsContent value="kol">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KOL 合作申請</CardTitle>
            </CardHeader>
            <CardContent>
              {kolApplications.length === 0 ? (
                <p className="text-slate-500 text-center py-8">暫無 KOL 申請</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>姓名</TableHead>
                        <TableHead>平台</TableHead>
                        <TableHead>粉絲數</TableHead>
                        <TableHead>地區</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>負責人</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kolApplications.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm">{item.platform_name}</TableCell>
                          <TableCell className="text-sm">{item.followers}</TableCell>
                          <TableCell className="text-sm">{item.region}</TableCell>
                          <TableCell>
                            <Select
                              value={item.status || 'pending'}
                              onValueChange={(val) => updateKolStatus(item.id, val as FormStatus)}
                            >
                              <SelectTrigger className="w-[110px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {item.staff ? (
                              <span className="text-sm font-medium text-slate-700">{(item.staff as any).name}</span>
                            ) : (
                              <span className="text-xs text-slate-400">未指派</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => setSelectedKol(item)}
                              >
                                查看
                              </Button>
                              {!item.handled_by && (
                                <Button
                                  size="sm"
                                  className="text-xs h-7 bg-rose-500 hover:bg-rose-600 text-white"
                                  onClick={() => handleKolClaim(item.id)}
                                  disabled={!currentStaff}
                                >
                                  認領
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KOL Promotion Requests Tab */}
        <TabsContent value="promotion">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KOL 推廣申請</CardTitle>
            </CardHeader>
            <CardContent>
              {kolPromotionRequests.length === 0 ? (
                <p className="text-slate-500 text-center py-8">暫無 KOL 推廣申請</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>美容院</TableHead>
                        <TableHead>聯絡人</TableHead>
                        <TableHead>推廣類型</TableHead>
                        <TableHead>預算</TableHead>
                        <TableHead>平台</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>負責人</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kolPromotionRequests.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                            {item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="font-medium">{item.salon_name}</TableCell>
                          <TableCell className="text-sm">{item.contact_person}</TableCell>
                          <TableCell className="text-sm">{item.promotion_type}</TableCell>
                          <TableCell className="text-sm">{item.budget_range}</TableCell>
                          <TableCell className="text-sm">
                            <div className="flex flex-wrap gap-1">
                              {item.preferred_platform?.map(p => (
                                <Badge key={p} className="text-xs bg-purple-100 text-purple-700 border-0">{p}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.status || 'pending'}
                              onValueChange={(val) => updatePromotionStatus(item.id, val as FormStatus)}
                            >
                              <SelectTrigger className="w-[110px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {item.staff ? (
                              <span className="text-sm font-medium text-slate-700">{(item.staff as any).name}</span>
                            ) : (
                              <span className="text-xs text-slate-400">未指派</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => setSelectedPromotion(item)}
                              >
                                查看
                              </Button>
                              {!item.handled_by && (
                                <Button
                                  size="sm"
                                  className="text-xs h-7 bg-rose-500 hover:bg-rose-600 text-white"
                                  onClick={() => handlePromotionClaim(item.id)}
                                  disabled={!currentStaff}
                                >
                                  認領
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Contact Detail Modal */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>聯絡查詢詳情</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">姓名</p>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">主題</p>
                <p className="font-medium">{selectedContact.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">訊息</p>
                <p className="text-sm bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">狀態</p>
                  {getStatusBadge(selectedContact.status || 'pending')}
                </div>
                <div>
                  <p className="text-xs text-slate-500">負責人</p>
                  <p className="font-medium">{selectedContact.staff ? (selectedContact.staff as any).name : '未指派'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">提交時間</p>
                <p className="text-sm">{selectedContact.created_at ? format(new Date(selectedContact.created_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KOL Detail Modal */}
      <Dialog open={!!selectedKol} onOpenChange={() => setSelectedKol(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>KOL 申請詳情</DialogTitle>
          </DialogHeader>
          {selectedKol && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">姓名</p>
                  <p className="font-medium">{selectedKol.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">電話</p>
                  <p className="font-medium">{selectedKol.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium">{selectedKol.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">地區</p>
                  <p className="font-medium">{selectedKol.region}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">平台</p>
                  <p className="font-medium">{selectedKol.platform_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">粉絲數</p>
                  <p className="font-medium">{selectedKol.followers}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">平台連結</p>
                <a href={selectedKol.platform_link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline break-all">
                  {selectedKol.platform_link}
                </a>
              </div>
              <div>
                <p className="text-xs text-slate-500">內容方向</p>
                <p className="text-sm">{selectedKol.content_direction}</p>
              </div>
              {selectedKol.experience && (
                <div>
                  <p className="text-xs text-slate-500">合作經驗</p>
                  <p className="text-sm">{selectedKol.experience}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">自我介紹</p>
                <p className="text-sm bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedKol.introduction}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">狀態</p>
                  {getStatusBadge(selectedKol.status || 'pending')}
                </div>
                <div>
                  <p className="text-xs text-slate-500">負責人</p>
                  <p className="font-medium">{selectedKol.staff ? (selectedKol.staff as any).name : '未指派'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">提交時間</p>
                <p className="text-sm">{selectedKol.created_at ? format(new Date(selectedKol.created_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KOL Promotion Detail Modal */}
      <Dialog open={!!selectedPromotion} onOpenChange={() => setSelectedPromotion(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KOL 推廣申請詳情</DialogTitle>
          </DialogHeader>
          {selectedPromotion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">美容院名稱</p>
                  <p className="font-medium">{selectedPromotion.salon_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">聯絡人</p>
                  <p className="font-medium">{selectedPromotion.contact_person}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">電話</p>
                  <p className="font-medium">{selectedPromotion.contact_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium">{selectedPromotion.contact_email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">推廣類型</p>
                  <p className="font-medium">{selectedPromotion.promotion_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">預算範圍</p>
                  <p className="font-medium">{selectedPromotion.budget_range}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">服務/產品描述</p>
                <p className="text-sm bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedPromotion.service_description}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">希望 KOL 類型</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPromotion.preferred_kol_type?.map(t => (
                    <Badge key={t} className="text-xs bg-purple-100 text-purple-700 border-0">{t}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">期望粉絲數量</p>
                <p className="font-medium">{selectedPromotion.preferred_followers}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">推廣平台</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPromotion.preferred_platform?.map(p => (
                    <Badge key={p} className="text-xs bg-rose-100 text-rose-700 border-0">{p}</Badge>
                  ))}
                </div>
              </div>
              {selectedPromotion.promotion_date && (
                <div>
                  <p className="text-xs text-slate-500">期望推廣時間</p>
                  <p className="text-sm">{selectedPromotion.promotion_date}</p>
                </div>
              )}
              {selectedPromotion.additional_requirements && (
                <div>
                  <p className="text-xs text-slate-500">其他要求</p>
                  <p className="text-sm bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedPromotion.additional_requirements}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">狀態</p>
                  {getStatusBadge(selectedPromotion.status || 'pending')}
                </div>
                <div>
                  <p className="text-xs text-slate-500">負責人</p>
                  <p className="font-medium">{selectedPromotion.staff ? (selectedPromotion.staff as any).name : '未指派'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">提交時間</p>
                <p className="text-sm">{selectedPromotion.created_at ? format(new Date(selectedPromotion.created_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


