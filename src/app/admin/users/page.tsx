'use client';

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Search, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const ROLES = [
  { value: 'admin', label: '管理員' },
  { value: 'merchant', label: '商戶' },
  { value: 'sub_merchant', label: '副商戶' },
  { value: 'kol', label: 'KOL' },
  { value: 'marketing', label: '市場營銷' },
  { value: 'member', label: '會員' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: '', fullName: '', roles: ['merchant'] as string[] });
  const [creating, setCreating] = useState(false);

  // Edit user roles dialog
  const [editRolesDialogOpen, setEditRolesDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      // Fetch from edge function (auth users)
      const usersRes = await base44.functions.invoke('listUsers');
      const authUsers: any[] = (usersRes as any).data?.users || [];

      // Fetch from users table to get the latest roles
      const { data: dbUsers, error: dbError } = await supabase
        .from('users')
        .select('id, email, full_name, role, roles, created_at');

      if (dbError) {
        console.error('Error loading users table:', dbError);
      }

      // Merge: use users table as primary source for roles, auth data for everything else
      if (dbUsers && dbUsers.length > 0) {
        const dbMap = new Map(dbUsers.map(u => [u.id, u]));
        const merged = authUsers.map(authUser => {
          const dbUser = dbMap.get(authUser.id);
          if (dbUser) {
            return {
              ...authUser,
              roles: dbUser.roles || (dbUser.role ? [dbUser.role] : []),
              role: dbUser.role || authUser.role,
              full_name: dbUser.full_name || authUser.full_name,
            };
          }
          return authUser;
        });
        // Also add any users in DB but not in auth list
        const authIds = new Set(authUsers.map(u => u.id));
        const extraDbUsers = dbUsers
          .filter(u => !authIds.has(u.id))
          .map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            roles: u.roles || (u.role ? [u.role] : []),
            created_date: u.created_at,
          }));
        setUsers([...merged, ...extraDbUsers]);
      } else {
        setUsers(authUsers);
      }
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
    if (newUserData.roles.length === 0) { toast.error('請至少選擇一個角色'); return; }
    setCreating(true);
    try {
      await base44.functions.invoke('inviteAdminUser', {
        email: newUserData.email, role: newUserData.roles[0], full_name: newUserData.fullName,
      });
      // Update roles array
      const { data: newUser } = await supabase.from('users').select('id').eq('email', newUserData.email).single();
      if (newUser) {
        await supabase.from('users').update({ roles: newUserData.roles, role: newUserData.roles[0] }).eq('id', newUser.id);
      }
      await loadData();
      toast.success(`已邀請 ${newUserData.email}`);
      setDialogOpen(false);
      setNewUserData({ email: '', fullName: '', roles: ['merchant'] });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('邀請失敗，請確保電郵未被使用');
    } finally {
      setCreating(false);
    }
  };

  const openEditRolesDialog = (user: any) => {
    setEditingUser(user);
    setEditRoles(user.roles || (user.role ? [user.role] : ['merchant']));
    setEditRolesDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    if (editRoles.length === 0) { toast.error('請至少選擇一個角色'); return; }
    setSavingRoles(true);
    try {
      // Try updating by user id first
      const { data, error } = await supabase
        .from('users')
        .update({ roles: editRoles, role: editRoles[0] })
        .eq('id', editingUser.id)
        .select();

      if (error) {
        throw error;
      }

      // If no rows returned, the ID might not match — try by email
      if (!data || data.length === 0) {
        const { data: data2, error: error2 } = await supabase
          .from('users')
          .update({ roles: editRoles, role: editRoles[0] })
          .eq('email', editingUser.email)
          .select();
        if (error2) throw error2;
        if (!data2 || data2.length === 0) {
          toast.error('更新失敗：找不到用戶記錄，可能是權限問題');
          setSavingRoles(false);
          return;
        }
      }

      // Update local state immediately so UI reflects the change
      setUsers(prev => prev.map(u => {
        if (u.id === editingUser.id || u.email === editingUser.email) {
          return { ...u, roles: editRoles, role: editRoles[0] };
        }
        return u;
      }));

      toast.success('角色已更新');
      setEditRolesDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating roles:', error);
      toast.error('更新失敗：' + (error.message || '未知錯誤'));
    } finally {
      setSavingRoles(false);
    }
  };

  const toggleNewUserRole = (role: string) => {
    setNewUserData(prev => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const toggleEditRole = (role: string) => {
    setEditRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleFilterRole = (role: string) => {
    setFilterRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const userRoles: string[] = u.roles || (u.role ? [u.role] : []);
    const matchesRole = filterRoles.length === 0 || filterRoles.some(fr => userRoles.includes(fr));
    return matchesSearch && matchesRole;
  });

  const getRoleBadges = (user: any) => {
    const roles: string[] = user.roles || (user.role ? [user.role] : ['merchant']);
    return roles.map(r => {
      const roleDef = ROLES.find(rd => rd.value === r);
      const colorMap: Record<string, string> = {
        admin: 'bg-red-100 text-red-700',
        merchant: 'bg-blue-100 text-blue-700',
        sub_merchant: 'bg-cyan-100 text-cyan-700',
        kol: 'bg-purple-100 text-purple-700',
        marketing: 'bg-orange-100 text-orange-700',
        member: 'bg-green-100 text-green-700',
      };
      return (
        <Badge key={r} className={`${colorMap[r] || 'bg-slate-100 text-slate-700'} border-0 text-xs`}>
          {roleDef?.label || r}
        </Badge>
      );
    });
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
            <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">用戶管理</h1>
          </div>
          <p className="text-slate-500">管理平台用戶、分配角色</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />新增用戶
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>邀請新用戶</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">電郵地址</Label>
                  <Input type="email" value={newUserData.email} onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} placeholder="user@example.com" className="h-10 mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">姓名</Label>
                  <Input type="text" value={newUserData.fullName} onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})} placeholder="用戶姓名" className="h-10 mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium">角色（可多選）</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ROLES.map(r => (
                      <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={newUserData.roles.includes(r.value)}
                          onCheckedChange={() => toggleNewUserRole(r.value)}
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
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
        </div>

        {/* Search & Filter */}
        <Card className="shadow-sm border-0 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input placeholder="搜尋電郵或姓名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500 mr-1">篩選角色：</span>
                {ROLES.map(r => (
                  <label key={r.value} className="flex items-center gap-1.5 text-sm cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100">
                    <Checkbox
                      checked={filterRoles.includes(r.value)}
                      onCheckedChange={() => toggleFilterRole(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
                {filterRoles.length > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-500" onClick={() => setFilterRoles([])}>
                    清除篩選
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-sm border-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="min-w-[200px]">電郵</TableHead>
                  <TableHead className="min-w-[100px]">姓名</TableHead>
                  <TableHead className="min-w-[140px]">角色</TableHead>
                  <TableHead className="min-w-[100px]">建立日期</TableHead>
                  <TableHead className="min-w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <TableRow key={u.id} className="border-b hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{u.full_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">{getRoleBadges(u)}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                        {u.created_date ? new Date(u.created_date).toLocaleDateString('zh-HK') : '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="text-xs h-7 whitespace-nowrap" onClick={() => openEditRolesDialog(u)}>
                          <Shield className="w-3 h-3 mr-1" />角色
                        </Button>
                      </TableCell>
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

        {/* Edit Roles Dialog */}
        <Dialog open={editRolesDialogOpen} onOpenChange={setEditRolesDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>編輯角色</DialogTitle></DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  用戶：<span className="font-semibold">{editingUser.full_name || editingUser.email}</span>
                </div>
                <div>
                  <Label className="text-sm font-medium">角色（可多選）</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ROLES.map(r => (
                      <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={editRoles.includes(r.value)}
                          onCheckedChange={() => toggleEditRole(r.value)}
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setEditRolesDialogOpen(false)}>取消</Button>
                  <Button onClick={handleSaveRoles} disabled={savingRoles} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                    {savingRoles ? '儲存中...' : '儲存'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
