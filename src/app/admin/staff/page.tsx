'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserCog, Plus, Pencil, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface Staff {
  id: string;
  user_id: string | null;
  name: string;
  position: string | null;
  is_active: boolean;
}

export default function AdminStaffPage() {
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Staff create
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPosition, setNewStaffPosition] = useState('');
  const [newStaffUserId, setNewStaffUserId] = useState('');
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Staff edit
  const [editStaffDialogOpen, setEditStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffPosition, setEditStaffPosition] = useState('');
  const [editStaffUserId, setEditStaffUserId] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);

  // Password reset
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStaff, setPasswordStaff] = useState<Staff | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, staffRes] = await Promise.all([
        base44.functions.invoke('listUsers'),
        supabase.from('staff').select('*').order('created_at', { ascending: false }),
      ]);
      setUsers((usersRes as any).data?.users || []);
      if (staffRes.data) setAllStaff(staffRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!newStaffName.trim()) { toast.error('請輸入 Staff 名稱'); return; }
    setCreatingStaff(true);
    const { error } = await supabase.from('staff').insert({
      name: newStaffName.trim(),
      position: newStaffPosition.trim() || null,
      user_id: (newStaffUserId && newStaffUserId !== 'none') ? newStaffUserId : null,
    });
    if (error) {
      toast.error('新增 Staff 失敗');
    } else {
      toast.success('Staff 已新增');
      setNewStaffName('');
      setNewStaffPosition('');
      setNewStaffUserId('');
      setStaffDialogOpen(false);
      loadData();
    }
    setCreatingStaff(false);
  };

  const openEditStaffDialog = (staff: Staff) => {
    setEditingStaff(staff);
    setEditStaffName(staff.name);
    setEditStaffPosition(staff.position || '');
    setEditStaffUserId(staff.user_id || 'none');
    setEditStaffDialogOpen(true);
  };

  const handleSaveStaffEdit = async () => {
    if (!editingStaff) return;
    if (!editStaffName.trim()) { toast.error('名稱不能為空'); return; }
    setSavingStaff(true);
    const { error } = await supabase.from('staff').update({
      name: editStaffName.trim(),
      position: editStaffPosition.trim() || null,
      user_id: (editStaffUserId && editStaffUserId !== 'none') ? editStaffUserId : null,
      updated_at: new Date().toISOString(),
    }).eq('id', editingStaff.id);

    if (error) {
      toast.error('更新 Staff 失敗');
    } else {
      toast.success('Staff 已更新');
      if (editStaffUserId && editStaffUserId !== 'none') {
        setPasswordStaff({ ...editingStaff, user_id: editStaffUserId, name: editStaffName });
        setMustChangePassword(true);
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordDialogOpen(true);
      }
      setEditStaffDialogOpen(false);
      loadData();
    }
    setSavingStaff(false);
  };

  const toggleStaffActive = async (staff: Staff) => {
    const { error } = await supabase.from('staff').update({ is_active: !staff.is_active }).eq('id', staff.id);
    if (!error) loadData();
  };

  const openPasswordReset = (staff: Staff) => {
    setPasswordStaff(staff);
    setMustChangePassword(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!passwordStaff?.user_id) { toast.error('此 Staff 沒有關聯用戶帳號'); return; }
    if (!newPassword || newPassword.length < 6) { toast.error('密碼最少需要 6 個字元'); return; }
    if (newPassword !== confirmNewPassword) { toast.error('密碼不一致'); return; }
    setResettingPassword(true);
    try {
      const res = await base44.functions.invoke('resetUserPassword', {
        user_id: passwordStaff.user_id,
        new_password: newPassword,
      });
      if ((res as any)?.error) throw new Error((res as any).error);
      toast.success('密碼已重設');
      setPasswordDialogOpen(false);
      setMustChangePassword(false);
    } catch (err: any) {
      toast.error('密碼重設失敗：' + (err.message || '未知錯誤'));
    } finally {
      setResettingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Staff 管理</h1>
          </div>
          <p className="text-slate-500">管理平台 Staff 記錄、關聯用戶帳號及重設密碼</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />新增 Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>新增 Staff</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">名稱 *</Label>
                  <Input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="Staff 名稱" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">職位</Label>
                  <Input value={newStaffPosition} onChange={e => setNewStaffPosition(e.target.value)} placeholder="選填" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">關聯用戶帳號</Label>
                  <Select value={newStaffUserId} onValueChange={setNewStaffUserId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="選擇用戶（選填）" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">不關聯</SelectItem>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>取消</Button>
                  <Button onClick={handleCreateStaff} disabled={creatingStaff} className="bg-rose-500 hover:bg-rose-600 text-white">
                    {creatingStaff ? '新增中...' : '新增'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Table */}
        <Card className="shadow-sm border-0">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名稱</TableHead>
                  <TableHead>職位</TableHead>
                  <TableHead>關聯用戶</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStaff.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm">{s.position || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {users.find(u => u.id === s.user_id)?.email || (s.user_id ? s.user_id : '-')}
                    </TableCell>
                    <TableCell>
                      <Badge className={s.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-slate-100 text-slate-500 border-0'}>
                        {s.is_active ? '啟用' : '停用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => openEditStaffDialog(s)}>
                          <Pencil className="w-3 h-3 mr-1" />編輯
                        </Button>
                        {s.user_id && (
                          <Button size="sm" variant="outline" className="text-xs h-7 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => openPasswordReset(s)}>
                            <Key className="w-3 h-3 mr-1" />重設密碼
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toggleStaffActive(s)}>
                          {s.is_active ? '停用' : '啟用'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {allStaff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">暫無 Staff 記錄</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Staff Dialog */}
        <Dialog open={editStaffDialogOpen} onOpenChange={(open) => { if (!open) setEditStaffDialogOpen(false); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>編輯 Staff</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">名稱</Label>
                <Input value={editStaffName} onChange={e => setEditStaffName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">職位</Label>
                <Input value={editStaffPosition} onChange={e => setEditStaffPosition(e.target.value)} placeholder="選填" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">關聯用戶帳號</Label>
                <Select value={editStaffUserId} onValueChange={setEditStaffUserId}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不關聯</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                ⚠️ 儲存後，如有關聯用戶帳號，會要求重設該帳號的密碼。
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => setEditStaffDialogOpen(false)}>取消</Button>
                <Button onClick={handleSaveStaffEdit} disabled={savingStaff} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                  {savingStaff ? '儲存中...' : '儲存'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Reset Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
          if (!open && mustChangePassword) {
            toast.error('編輯 Staff 後必須重設關聯帳號的密碼');
            return;
          }
          if (!open) setPasswordDialogOpen(false);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                {mustChangePassword ? '必須重設密碼' : '重設用戶密碼'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {mustChangePassword && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  ⚠️ 編輯 Staff 資料後，必須為關聯的用戶帳號重設密碼才能關閉此對話框。
                </div>
              )}
              <div className="text-sm text-slate-600">
                Staff: <span className="font-semibold">{passwordStaff?.name}</span><br />
                關聯帳號: <span className="font-semibold">{users.find(u => u.id === passwordStaff?.user_id)?.email || '-'}</span>
              </div>
              <div>
                <Label className="text-sm font-medium">新密碼</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="最少 6 個字元" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium">確認新密碼</Label>
                <Input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="再次輸入新密碼" className="mt-1" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                {!mustChangePassword && <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>取消</Button>}
                <Button onClick={handleResetPassword} disabled={resettingPassword} className="bg-amber-500 hover:bg-amber-600 text-white">
                  {resettingPassword ? '重設中...' : '確認重設密碼'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
