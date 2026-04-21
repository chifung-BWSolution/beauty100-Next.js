'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, Pencil } from 'lucide-react';

interface Props {
  displayName: string;
  email: string;
  role: string;
}

const roleLabel = (role: string) => {
  if (role === 'admin') return '管理員';
  if (role === 'marketing') return '市場推廣';
  if (role === 'kol') return 'KOL';
  return '商戶';
};

const roleBg = (role: string) =>
  role === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-500';

const Feedback = ({ msg }: { msg: { type: string; text: string } | null }) => {
  if (!msg) return null;
  const isOk = msg.type === 'success';
  return (
    <div className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${isOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      {isOk ? (
        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      )}
      <span>{msg.text}</span>
    </div>
  );
};

export default function UserSettingsClient({ displayName: initialName, email, role }: Props) {
  const initials = initialName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(initialName);
  const [currentDisplayName, setCurrentDisplayName] = useState(initialName);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: string; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: string; text: string } | null>(null);

  const handleEditName = () => {
    setNameValue(currentDisplayName);
    setNameMessage(null);
    setEditingName(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) {
      setNameMessage({ type: 'error', text: '名稱不能為空。' });
      return;
    }
    setNameLoading(true);
    setNameMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } });
      if (error) throw error;
      setCurrentDisplayName(nameValue.trim());
      setNameMessage({ type: 'success', text: '名稱已成功更新！' });
      setEditingName(false);
    } catch (err: any) {
      setNameMessage({ type: 'error', text: err.message || '更新失敗，請稍後再試。' });
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: '新密碼至少需要 6 個字元。' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: '新密碼與確認密碼不一致。' });
      return;
    }
    setPwLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (signInError) {
        setPwMessage({ type: 'error', text: '目前密碼不正確，請重新輸入。' });
        setPwLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwMessage({ type: 'success', text: '密碼已成功更新！' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err.message || '密碼更新失敗，請稍後再試。' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-rose-100 via-pink-50 to-rose-50" />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-md border-4 border-white">
              {initials}
            </div>
            {role && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBg(role)}`}>
                {roleLabel(role)}
              </span>
            )}
          </div>
          <div className="space-y-0.5 mb-5">
            <p className="text-lg font-bold text-slate-800">{currentDisplayName}</p>
            <p className="text-sm text-stone-400">{email}</p>
          </div>
          <div className="border-t border-stone-100 pt-4">
            {!editingName ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">顯示名稱</p>
                  <p className="text-sm font-medium text-slate-700">{currentDisplayName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleEditName}
                  className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg"
                >
                  <Pencil className="w-3 h-3" />更改名稱
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveName} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name" className="text-xs text-stone-500 font-medium">顯示名稱</Label>
                  <Input
                    id="display-name"
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="輸入您的名稱"
                    className="h-10 rounded-xl border-stone-200 text-sm"
                    autoFocus
                  />
                </div>
                <Feedback msg={nameMessage} />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={nameLoading}
                    className="bg-rose-500 hover:bg-rose-600 text-white flex-1 h-9 rounded-xl text-sm font-medium shadow-none"
                  >
                    {nameLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        儲存中...
                      </span>
                    ) : '儲存'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-9 rounded-xl text-sm font-medium border-stone-200 text-stone-500 hover:bg-stone-50 shadow-none"
                    onClick={() => { setEditingName(false); setNameMessage(null); }}
                  >
                    取消
                  </Button>
                </div>
              </form>
            )}
            {nameMessage && !editingName && (
              <div className="mt-3"><Feedback msg={nameMessage} /></div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
        <div className="px-6 pt-5 pb-4 border-b border-stone-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">更改密碼</p>
            <p className="text-xs text-stone-400">為帳號設定新的安全密碼</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { id: 'current-password', label: '目前密碼', value: currentPassword, onChange: setCurrentPassword, show: showCurrentPw, toggleShow: () => setShowCurrentPw(!showCurrentPw), autoComplete: 'current-password' },
              { id: 'new-password', label: '新密碼', value: newPassword, onChange: setNewPassword, show: showNewPw, toggleShow: () => setShowNewPw(!showNewPw), autoComplete: 'new-password', placeholder: '至少 6 個字元' },
              { id: 'confirm-password', label: '確認新密碼', value: confirmPassword, onChange: setConfirmPassword, show: showConfirmPw, toggleShow: () => setShowConfirmPw(!showConfirmPw), autoComplete: 'new-password', placeholder: '再次輸入新密碼' },
            ].map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={field.id} className="text-xs text-stone-500 font-medium">{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.id}
                    type={field.show ? 'text' : 'password'}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder={(field as any).placeholder || '輸入密碼'}
                    className="h-10 rounded-xl border-stone-200 pr-10 text-sm"
                    required
                    autoComplete={field.autoComplete}
                  />
                  <button
                    type="button"
                    onClick={field.toggleShow}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
                  >
                    {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <Feedback msg={pwMessage} />
            <Button
              type="submit"
              disabled={pwLoading}
              className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium shadow-none"
            >
              {pwLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  更新中...
                </span>
              ) : '更新密碼'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
