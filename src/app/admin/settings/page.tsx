'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Save, CheckCircle, Tag, Plus, Pencil, Trash2, Check, X, Send, ShoppingBag, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import SettingsSidebar from '@/components/admin/SettingsSidebar';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TAG_CATEGORIES = [
  { key: 'face_',      emoji: '🧖', label: '面部基礎護理',   category: '面部基礎護理' },
  { key: 'machine_',   emoji: '💡', label: '儀器醫美療程',   category: '儀器醫美療程' },
  { key: 'body_',      emoji: '💆', label: '身體護理',       category: '身體護理' },
  { key: 'hair_',      emoji: '🪒', label: '脫毛服務',       category: '脫毛服務' },
  { key: 'semi-perm_', emoji: '✏️', label: '半永久紋繡',     category: '半永久紋繡' },
  { key: 'eyes_',      emoji: '👁️', label: '眼睫服務',       category: '眼睫服務' },
  { key: 'med_',       emoji: '🌿', label: '特殊專科護理',   category: '特殊專科護理' },
  { key: 'pay_',       emoji: '💰', label: '消費透明度',     category: '消費透明度' },
  { key: 'quali_',     emoji: '✅', label: '品質認證',       category: '品質認證' },
  { key: 'seg_',       emoji: '👥', label: '客群特色',       category: '客群特色' },
  { key: 'service_',   emoji: '🏥', label: '專業服務',       category: '專業服務' },
  { key: 'amenities_', emoji: '📍', label: '便利設施',       category: '便利設施' },
  { key: 'booking_',   emoji: '🌐', label: '語言及預約',     category: '語言及預約' },
];

// ─── WhatsApp Preview Widget ────────────────────────────────────────────────
function WhatsAppPreview({ phoneNumber, presetMessage, userPresetMessage }: { phoneNumber: string; presetMessage: string; userPresetMessage: string }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <div className="text-center py-2 bg-slate-50 border-b border-slate-100">
        <p className="text-xs font-medium text-slate-500">📱 WhatsApp Widget 預覽</p>
      </div>
      <div className="p-4">
        <div className="w-full max-w-[280px] mx-auto rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' }}>
            <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center">
              <WhatsAppIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">BEAUTY 客戶服務</p>
              <p className="text-pink-100 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block"></span>
                在線中
              </p>
            </div>
            <div className="text-white/60">
              <X className="w-4 h-4" />
            </div>
          </div>

          {/* Chat area */}
          <div className="bg-[#ece5dd] px-3 py-3 space-y-2" style={{ minHeight: '160px' }}>
            <div className="flex justify-center">
              <span className="text-[9px] text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">今天</span>
            </div>
            {/* Bot message */}
            <div className="flex items-end gap-1.5">
              <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' }}>
                <WhatsAppIcon className="w-3.5 h-3.5 text-white m-[5px]" />
              </div>
              <div className="max-w-[75%]">
                <div className="bg-white rounded-2xl rounded-bl-sm px-2.5 py-1.5 shadow-sm">
                  <p className="text-gray-800 text-xs leading-relaxed">{presetMessage || '您好，請問可以如何幫助您？'}</p>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5 ml-1">客服</p>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="bg-white px-2.5 py-2 flex items-center gap-1.5 border-t border-gray-100">
            <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-[11px] text-gray-400 truncate">
              {userPresetMessage || '請輸入訊息...'}
            </div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' }}
            >
              <Send className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="bg-white pb-1.5 px-2.5 text-center">
            <p className="text-[9px] text-gray-400">點擊送出將開啟 WhatsApp</p>
          </div>
        </div>

        {phoneNumber && (
          <p className="text-center text-xs text-slate-400 mt-3">
            電話號碼：<span className="font-mono text-slate-600">{phoneNumber}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── WhatsApp Settings Tab ──────────────────────────────────────────────────
function WhatsAppSettingsTab() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [presetMessage, setPresetMessage] = useState('您好，請問可以如何幫助您？');
  const [userPresetMessage, setUserPresetMessage] = useState('我想了解更多關於美容服務的資訊');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('whatsapp_settings').select('*').limit(1).single();
        if (data) {
          setPhoneNumber(data.phone_number || '');
          setPresetMessage(data.preset_message || '您好，請問可以如何幫助您？');
          setUserPresetMessage(data.user_preset_message || '我想了解更多關於美容服務的資訊');
          setSettingsId(data.id);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { phone_number: phoneNumber, preset_message: presetMessage, user_preset_message: userPresetMessage };
      if (settingsId) {
        await supabase.from('whatsapp_settings').update(payload).eq('id', settingsId);
      } else {
        const { data: newData } = await supabase.from('whatsapp_settings').insert(payload).select().single();
        if (newData) setSettingsId(newData.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' }}>
              <WhatsAppIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">WhatsApp 客服設定</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">設定客戶點擊WhatsApp按鈕後的聯絡號碼及預設訊息</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-pink-500" />WhatsApp 電話號碼
            </Label>
            <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="例: 85291234567 (含國際區號，不含+)" className="border-slate-200 focus:border-pink-400 focus:ring-pink-400/20" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-pink-500" />客服預設訊息
            </Label>
            <Textarea value={presetMessage} onChange={e => setPresetMessage(e.target.value)} rows={3} className="border-slate-200 focus:border-pink-400 focus:ring-pink-400/20 resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-pink-500" />客人預設訊息
            </Label>
            <Textarea value={userPresetMessage} onChange={e => setUserPresetMessage(e.target.value)} rows={3} className="border-slate-200 focus:border-pink-400 focus:ring-pink-400/20 resize-none" />
          </div>

          {/* WhatsApp Preview - Issue 5 */}
          <WhatsAppPreview
            phoneNumber={phoneNumber}
            presetMessage={presetMessage}
            userPresetMessage={userPresetMessage}
          />

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2 text-white" style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)', border: 'none' }}>
              {saved ? <><CheckCircle className="w-4 h-4" />已儲存！</> : saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />儲存中...</> : <><Save className="w-4 h-4" />儲存設定</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Category Tag Panel ─────────────────────────────────────────────────────
function CategoryTagPanel({ categoryMeta }: { categoryMeta: typeof TAG_CATEGORIES[0] }) {
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    const { data } = await supabase.from('salon_tags').select('*').eq('category', categoryMeta.category).order('sort_order', { ascending: true });
    setTags(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTags(); }, [categoryMeta.category]);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    const maxOrder = tags.length ? Math.max(...tags.map(t => t.sort_order)) + 1 : 1;
    await supabase.from('salon_tags').insert({ prefix: categoryMeta.key, category: categoryMeta.category, label: newLabel.trim(), sort_order: maxOrder });
    setNewLabel('');
    setAdding(false);
    fetchTags();
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;
    await supabase.from('salon_tags').update({ label: editValue.trim(), updated_at: new Date().toISOString() }).eq('id', id);
    setEditingId(null);
    setEditValue('');
    fetchTags();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from('salon_tags').delete().eq('id', id);
    setDeletingId(null);
    fetchTags();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-50 border border-pink-100">
        <span className="text-lg">{categoryMeta.emoji}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">{categoryMeta.label}</p>
          <p className="text-xs text-slate-400">Prefix: <code className="bg-white px-1 rounded border border-slate-200 text-pink-600">{categoryMeta.key}</code></p>
        </div>
        <Badge variant="secondary" className="text-xs">{tags.length} 項</Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors group">
              {editingId === tag.id ? (
                <>
                  <Input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleEdit(tag.id); if (e.key === 'Escape') setEditingId(null); }} className="flex-1 h-7 text-sm border-pink-300 focus:border-pink-400" autoFocus />
                  <button onClick={() => handleEdit(tag.id)} className="text-green-500 hover:text-green-600 p-0.5"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-0.5"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-700">{tag.label}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingId(tag.id); setEditValue(tag.label); }} className="text-slate-400 hover:text-pink-500 p-0.5"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(tag.id)} disabled={deletingId === tag.id} className="text-slate-400 hover:text-red-500 p-0.5 disabled:opacity-40">
                      {deletingId === tag.id ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {tags.length === 0 && <p className="text-center text-sm text-slate-400 py-4">尚未有標籤，請在下方新增</p>}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }} placeholder="新增標籤（不需填 prefix）" className="flex-1 border-slate-200 focus:border-pink-400 focus:ring-pink-400/20 text-sm" />
        <Button onClick={handleAdd} disabled={adding || !newLabel.trim()} size="sm" className="gap-1.5 text-white whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)', border: 'none' }}>
          {adding ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          新增
        </Button>
      </div>
    </div>
  );
}

// ─── Salon Tags Tab ─────────────────────────────────────────────────────────
function SalonTagsTab() {
  const [activeCategory, setActiveCategory] = useState(TAG_CATEGORIES[0].key);
  const active = TAG_CATEGORIES.find(c => c.key === activeCategory);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' }}>
            <Tag className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-base text-slate-800">美容院標籤設定</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">管理各分類標籤，新增標籤時系統自動加入對應 prefix 儲存至資料庫</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="w-44 flex-shrink-0 space-y-0.5">
            {TAG_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  activeCategory === cat.key ? 'bg-pink-50 text-pink-700 font-medium border border-pink-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            {active && <CategoryTagPanel key={active.key} categoryMeta={active} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Shopify Settings Tab ────────────────────────────────────────────────────
function ShopifySettingsTab() {
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const fetchTokenInfo = async () => {
    setLoadingInfo(true);
    try {
      const { data: token } = await supabase
        .from('shopify_configs')
        .select('*')
        .eq('key', 'shopify_token')
        .limit(1)
        .single();
      setTokenInfo(token);

      const { data: recentLogs } = await supabase
        .from('shopify_token_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setLogs(recentLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInfo(false);
    }
  };

  useEffect(() => {
    fetchTokenInfo();
  }, []);

  const handleRefreshToken = async () => {
    setRefreshing(true);
    setResult(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || supabaseAnonKey;

      const response = await fetch(`${supabaseUrl}/functions/v1/supabase-functions-shopify-refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ triggered_by: 'manual' }),
      });

      const data = await response.json();
      if (data.success) {
        setResult({ success: true, message: `Token 已成功刷新！到期時間：${new Date(data.expires_at).toLocaleString('zh-HK')}` });
        fetchTokenInfo();
      } else {
        setResult({ success: false, message: data.error || '刷新失敗' });
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message || '刷新失敗' });
    } finally {
      setRefreshing(false);
    }
  };

  const isTokenExpired = tokenInfo?.expires_at ? new Date(tokenInfo.expires_at) < new Date() : true;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' }}>
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">Shopify API 連接</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                使用 Client Credentials 向 Shopify 換取 24 小時 Token，並存入資料庫。系統每小時自動刷新一次。
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {loadingInfo ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Token Status */}
              {tokenInfo && (
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${isTokenExpired ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  {isTokenExpired ? (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isTokenExpired ? 'text-red-700' : 'text-green-700'}`}>
                      {isTokenExpired ? 'Token 已過期' : 'Token 有效'}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        到期時間：{new Date(tokenInfo.expires_at).toLocaleString('zh-HK')}
                      </p>
                      <p className="text-xs text-slate-500">
                        <RefreshCw className="w-3 h-3 inline mr-1" />
                        上次刷新：{new Date(tokenInfo.refreshed_at).toLocaleString('zh-HK')}
                      </p>
                      {tokenInfo.scope && (
                        <p className="text-xs text-slate-400 truncate">
                          Scope：{tokenInfo.scope}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!tokenInfo && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-amber-50 border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700">尚未取得 Token，請點擊下方按鈕手動刷新。</p>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed">
                如需立即手動刷新，請點擊下方按鈕。系統會以 Client ID / Secret 向 Shopify 換取新 Token 並寫入資料庫。
              </p>

              {/* Result message */}
              {result && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
                </div>
              )}

              {/* Refresh button */}
              <Button
                onClick={handleRefreshToken}
                disabled={refreshing}
                className="gap-2 text-white"
                style={{ background: 'linear-gradient(135deg, #f472b6 0%, #e11d48 100%)', border: 'none' }}
              >
                {refreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    刷新中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    立即刷新 Shopify Token
                  </>
                )}
              </Button>

              {/* Recent logs */}
              {logs.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500 mb-2">最近刷新記錄</p>
                  <div className="space-y-1.5">
                    {logs.map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-slate-400 font-mono">{new Date(log.created_at).toLocaleString('zh-HK')}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${log.triggered_by === 'cron' ? 'border-blue-200 text-blue-600' : 'border-pink-200 text-pink-600'}`}>
                          {log.triggered_by === 'cron' ? '自動' : '手動'}
                        </Badge>
                        <span className="truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Settings Page ─────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('tags');

  return (
    <div className="flex h-full min-h-[calc(100vh-56px)] md:min-h-screen">
      {/* Settings Sidebar */}
      <div className="hidden md:flex">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile tab selector */}
        <div className="md:hidden p-4 pb-0">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'tags' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Tag className="w-3.5 h-3.5 inline mr-1.5" />美容院標籤
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'whatsapp' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 inline mr-1.5" />WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('shopify')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'shopify' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5 inline mr-1.5" />Shopify
            </button>
          </div>
        </div>

        <div className="p-6 max-w-4xl">
          {activeTab === 'tags' && <SalonTagsTab />}
          {activeTab === 'whatsapp' && <WhatsAppSettingsTab />}
          {activeTab === 'shopify' && <ShopifySettingsTab />}
        </div>
      </div>
    </div>
  );
}
