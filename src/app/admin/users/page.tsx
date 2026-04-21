'use client';

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Search, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'admin', label: '管理員' },
  { value: 'merchant', label: '商戶' },
  { value: 'sub_merchant', label: '副商戶' },
  { value: 'kol', label: 'KOL' },
  { value: 'marketing', label: '市場營銷' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: '', fullName: '', role: 'merchant' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await base44.functions.invoke('listUsers');
      setUsers((res as any).data?.users || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('載入資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email || !newUserData.fullName) { toast.error('請填寫所有欄位'); return; }
    setCreating(true);
    try {
      await base44.functions.invoke('inviteAdminUser', {
        email: newUserData.email, role: newUserData.role, full_name: newUserData.fullName,
      });
      await loadData();
      toast.success(`已邀請 ${newUserData.email}`);
      setDialogOpen(false);
      setNewUserData({ email: '', fullName: '', role: 'merchant' });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('邀請失敗，請確保電郵未被使用');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
      await loadData();
      toast.success('角色已更新');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('更新失敗');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">用戶管理</h1>
          </div>
          <p className="text-slate-500">管理平台用戶和分配角色</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />新增用戶
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>邀請新用戶</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">電郵地址</label>
                <Input type="email" value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} placeholder="user@example.com" className="h-10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名</label>
                <Input type="text" value={newUserData.fullName} onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})} placeholder="用戶姓名" className="h-10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">角色</label>
                <Select value={newUserData.role} onValueChange={(val) => setNewUserData({...newUserData, role: val})}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                <Button type="submit" disabled={creating} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                  {creating ? '邀請中...' : '邀請用戶'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="shadow-sm border-0 mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input placeholder="搜尋電郵或姓名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10" />
                </div>
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48 h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有角色</SelectItem>
                  {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>電郵</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>建立日期</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <TableRow key={u.id} className="border-b hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" />{u.email}</div>
                      </TableCell>
                      <TableCell>{u.full_name}</TableCell>
                      <TableCell>
                        <Select value={u.role || 'merchant'} onValueChange={(val) => handleRoleChange(u.id, val)}>
                          <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {u.created_date ? new Date(u.created_date).toLocaleDateString('zh-HK') : '-'}
                      </TableCell>
                      <TableCell><Shield className="w-4 h-4 text-fuchsia-500" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">未找到符合條件的用戶</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
