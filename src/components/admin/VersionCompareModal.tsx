'use client';

import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FIELDS = [
  { key: 'salon_name', label: '美容院名稱' },
  { key: 'contact_person', label: '聯絡人' },
  { key: 'contact_number', label: '聯絡電話' },
  { key: 'whatsapp_number', label: 'WhatsApp' },
  { key: 'email', label: '電郵' },
  { key: 'address', label: '地址' },
  { key: 'district', label: '地區' },
  { key: 'website', label: '網站' },
  { key: 'tags', label: '標籤' },
  { key: 'handle', label: 'URL Handle' },
  { key: 'seo_title', label: 'SEO 標題' },
  { key: 'seo_description', label: 'SEO 描述' },
  { key: 'office_hr_mon', label: '週一' },
  { key: 'office_hr_tue', label: '週二' },
  { key: 'office_hr_wed', label: '週三' },
  { key: 'office_hr_thu', label: '週四' },
  { key: 'office_hr_fri', label: '週五' },
  { key: 'office_hr_sat', label: '週六' },
  { key: 'office_hr_sun', label: '週日' },
];

function DiffCell({ original, updated, changed }: { original: string; updated: string; changed: boolean }) {
  return (
    <div className={`rounded-lg p-2 text-sm ${changed ? 'bg-amber-50 border border-amber-200' : ''}`}>
      {changed ? (
        <div className="space-y-1">
          <div className="line-through text-slate-400 text-sm">{original || <span className="italic">（空白）</span>}</div>
          <div className="text-amber-800 font-medium">{updated || <span className="italic">（已刪除）</span>}</div>
        </div>
      ) : (
        <span className="text-slate-700">{updated || <span className="text-slate-300 italic text-sm">空白</span>}</span>
      )}
    </div>
  );
}

/**
 * For public suggestions, determine if a field was actually changed.
 * A field is only considered "changed" if:
 * 1. The new value is non-empty (the submitter actually provided a value), AND
 * 2. The new value differs from the original.
 * This prevents empty/missing fields in public forms from being shown as "deleted".
 */
function isFieldActuallyChanged(version: any, profile: any, fieldKey: string, isPublicSuggestion: boolean): boolean {
  const orig = profile?.[fieldKey] || '';
  const upd = version[fieldKey] || '';
  
  if (isPublicSuggestion) {
    // For public suggestions: only count as changed if the submitter provided a non-empty value
    // that differs from the original. Empty/missing fields are NOT deletions.
    if (!upd) return false;
    return orig !== upd;
  }
  
  // For merchant submissions: any difference counts (including clearing a field)
  return orig !== upd;
}

interface VersionCompareModalProps {
  version: any;
  open: boolean;
  onClose: () => void;
  onApprove: (status: string) => void;
  onReject: () => void;
  processing: boolean;
}

export default function VersionCompareModal({ version, open, onClose, onApprove, onReject, processing }: VersionCompareModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [approveStatus, setApproveStatus] = useState('active');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [labelCategoryMap, setLabelCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (version?.profile_id && open) {
      setLoadingProfile(true);
      Promise.all([
        base44.entities.SalonProfile.filter({ id: version.profile_id }),
        supabase.from('salon_tags').select('label, category'),
      ])
        .then(([profileRes, tagsRes]) => {
          setProfile(profileRes[0] || null);
          if (tagsRes.data) {
            const lcMap: Record<string, string> = {};
            tagsRes.data.forEach((t: any) => { lcMap[t.label] = t.category; });
            setLabelCategoryMap(lcMap);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingProfile(false));
    }
  }, [version?.profile_id, open]);

  if (!version) return null;

  const isPublic = version.submission_type === 'public_suggestion';
  const changedFields = FIELDS.filter(f => isFieldActuallyChanged(version, profile, f.key, isPublic));
  const descriptionChanged = isPublic
    ? !!(version.description) && (version.description || '') !== (profile?.description || '')
    : (version.description || '') !== (profile?.description || '');
  
  // For public suggestions with photos, check if there are NEW photos to add
  // (public form photos are additive, not replacements)
  const versionMedia = version.product_media || [];
  const profileMedia = profile?.product_media || [];
  const mediaChanged = isPublic
    ? versionMedia.length > 0 // public suggestions: any photos means new photos to add
    : JSON.stringify(versionMedia) !== JSON.stringify(profileMedia);
  
  const tagsChanged = isPublic
    ? (version.selected_tags || []).length > 0 && JSON.stringify([...(version.selected_tags || [])].sort()) !== JSON.stringify([...(profile?.selected_tags || [])].sort())
    : JSON.stringify([...(version.selected_tags || [])].sort()) !== JSON.stringify([...(profile?.selected_tags || [])].sort());
  const highlightChanged = isPublic
    ? (version.highlight_tags || []).length > 0 && JSON.stringify([...(version.highlight_tags || [])].sort()) !== JSON.stringify([...(profile?.highlight_tags || [])].sort())
    : JSON.stringify([...(version.highlight_tags || [])].sort()) !== JSON.stringify([...(profile?.highlight_tags || [])].sort());

  function groupTagsByCategory(tags: string[]) {
    const grouped: Record<string, string[]> = {};
    (tags || []).forEach(label => {
      const cat = labelCategoryMap[label] || '其他';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(label);
    });
    return grouped;
  }

  const totalChanges = [...changedFields, descriptionChanged && 'desc', mediaChanged && 'media', tagsChanged && 'tags', highlightChanged && 'highlight'].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            資料更新審核
            {totalChanges > 0 && (
              <span className="text-sm bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-normal">
                {totalChanges} 處更改
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Public suggestion info banner */}
            {version.submission_type === 'public_suggestion' && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700 border-0">📋 公眾建議</Badge>
                    {version.change_reason && (
                      <Badge variant="outline" className="text-sm">
                        {({ new_opening: '🆕 新開張', closed: '🔒 結業', renovation: '🔧 裝修', reopened: '🔄 重開', update_info: '📝 更新資料', upload_photo: '📷 上載相片' } as Record<string, string>)[version.change_reason] || version.change_reason}
                      </Badge>
                    )}
                    {version.is_shop_owner && (
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">⭐ 自稱負責人</Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2.5">
                    <p className="text-blue-500 text-xs mb-0.5">提交者</p>
                    <p className="font-medium text-slate-700">{version.submitter_name || '-'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5">
                    <p className="text-blue-500 text-xs mb-0.5">電郵</p>
                    <p className="font-medium text-slate-700">{version.submitter_email || '-'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2.5">
                    <p className="text-blue-500 text-xs mb-0.5">電話</p>
                    <p className="font-medium text-slate-700">{version.submitter_phone || '-'}</p>
                  </div>
                </div>
                {(version.closed_date || version.renovation_date || version.reopened_date || version.new_opening_date) && (
                  <div className="bg-white rounded-lg p-2.5 text-sm">
                    <p className="text-blue-500 text-xs mb-0.5">相關日期</p>
                    <p className="font-medium text-amber-700">
                      {version.closed_date && `結業日期：${new Date(version.closed_date).toLocaleDateString('zh-HK')}`}
                      {version.renovation_date && `裝修開始日期：${new Date(version.renovation_date).toLocaleDateString('zh-HK')}`}
                      {version.reopened_date && `重開日期：${new Date(version.reopened_date).toLocaleDateString('zh-HK')}`}
                      {version.new_opening_date && `開張日期：${new Date(version.new_opening_date).toLocaleDateString('zh-HK')}`}
                    </p>
                  </div>
                )}
                {version.submitter_note && (
                  <div className="bg-white rounded-lg p-2.5 text-sm">
                    <p className="text-blue-500 text-xs mb-0.5">備註</p>
                    <p className="text-slate-700">{version.submitter_note}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 inline-block"></span>已更改欄位</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">劃線 = 原本內容，粗體 = 新內容</span>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-slate-100 text-sm font-semibold text-slate-500 px-4 py-2">
                <span>欄位</span><span>現有資料</span><span>申請更新</span>
              </div>
              <div className="divide-y">
                {FIELDS.map(f => {
                  const orig = profile?.[f.key] || '';
                  const upd = version[f.key] || '';
                  const changed = isFieldActuallyChanged(version, profile, f.key, isPublic);
                  
                  // For public suggestions, skip fields that were not submitted (empty)
                  // to avoid showing misleading "deleted" entries
                  if (isPublic && !upd && !changed) return null;
                  
                  return (
                    <div key={f.key} className={`grid grid-cols-3 px-4 py-2 items-start ${changed ? 'bg-amber-50/50' : ''}`}>
                      <span className={`text-sm font-medium pt-2 ${changed ? 'text-amber-700' : 'text-slate-500'}`}>{f.label}{changed && ' ✱'}</span>
                      <div className="pr-2"><div className="rounded-lg p-2 text-sm text-slate-600">{orig || <span className="text-slate-300 italic text-sm">空白</span>}</div></div>
                      <div><DiffCell original={orig} updated={upd} changed={changed} /></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className={`rounded-xl border overflow-hidden ${descriptionChanged ? 'border-amber-200' : ''}`}>
              <div className={`px-4 py-2 text-sm font-semibold ${descriptionChanged ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
                簡介{descriptionChanged && ' ✱ 已更改'}
              </div>
              <div className="grid grid-cols-2 divide-x">
                <div className="p-3">
                  <p className="text-sm text-slate-400 mb-1">現有</p>
                  {profile?.description
                    ? <div className="text-sm text-slate-600 max-h-32 overflow-y-auto" dangerouslySetInnerHTML={{ __html: profile.description }} />
                    : <span className="text-slate-300 italic text-sm">空白</span>}
                </div>
                <div className={`p-3 ${descriptionChanged ? 'bg-amber-50/30' : ''}`}>
                  <p className="text-sm text-slate-400 mb-1">申請更新</p>
                  {version.description
                    ? <div className="text-sm text-slate-700 max-h-32 overflow-y-auto" dangerouslySetInnerHTML={{ __html: version.description }} />
                    : <span className="text-slate-300 italic text-sm">空白</span>}
                </div>
              </div>
            </div>

            {/* Media */}
            {(version.product_media?.length > 0 || profile?.product_media?.length > 0) && (
              <div className={`rounded-xl border overflow-hidden ${mediaChanged ? 'border-amber-200' : ''}`}>
                <div className={`px-4 py-2 text-sm font-semibold ${mediaChanged ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
                  產品相片{mediaChanged && ' ✱ 已更改'}
                  {isPublic && versionMedia.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-blue-600">（公眾建議：新相片會加入現有相片列表）</span>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <p className="text-sm text-slate-400 mb-2">現有 ({profileMedia.length})</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {profileMedia.map((url: string, i: number) => <img key={i} src={url} alt="" className="w-14 h-14 object-cover rounded-lg" />)}
                    </div>
                  </div>
                  <div className={`p-3 ${mediaChanged ? 'bg-amber-50/30' : ''}`}>
                    {isPublic && versionMedia.length > 0 ? (
                      <>
                        <p className="text-sm text-slate-400 mb-2">新增相片 ({versionMedia.length})</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {versionMedia.map((url: string, i: number) => (
                            <div key={i} className="relative">
                              <img src={url} alt="" className="w-14 h-14 object-cover rounded-lg ring-2 ring-emerald-300" />
                              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">+</span>
                            </div>
                          ))}
                        </div>
                        {profileMedia.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-400 mb-1">批准後完整列表 ({profileMedia.length + versionMedia.length})</p>
                            <div className="flex gap-1 flex-wrap">
                              {profileMedia.map((url: string, i: number) => <img key={`existing-${i}`} src={url} alt="" className="w-10 h-10 object-cover rounded opacity-60" />)}
                              {versionMedia.map((url: string, i: number) => <img key={`new-${i}`} src={url} alt="" className="w-10 h-10 object-cover rounded ring-1 ring-emerald-300" />)}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-400 mb-2">申請更新 ({version.product_media?.length || 0})</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {(version.product_media || []).map((url: string, i: number) => <img key={i} src={url} alt="" className="w-14 h-14 object-cover rounded-lg" />)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3 pt-2 flex-col sm:flex-row items-center justify-between">
              <div className="flex gap-4 items-center w-full sm:w-auto mb-3 sm:mb-0 bg-slate-50 px-3 py-2 rounded-lg">
                <label className="text-sm font-medium text-slate-700">更新後狀態:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="versionStatus" value="active" checked={approveStatus === 'active'} onChange={(e) => setApproveStatus(e.target.value)} />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="versionStatus" value="draft" checked={approveStatus === 'draft'} onChange={(e) => setApproveStatus(e.target.value)} />
                  <span className="text-sm">Draft</span>
                </label>
              </div>
              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <Button variant="outline" onClick={onReject} className="border-red-200 text-red-600 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" />拒絕
                </Button>
                <Button onClick={() => onApprove(approveStatus)} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700">
                  {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />處理中...</> : <><CheckCircle className="w-4 h-4 mr-2" />批准並更新資料</>}
                </Button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
