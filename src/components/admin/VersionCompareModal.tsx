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

  const changedFields = FIELDS.filter(f => (version[f.key] || '') !== (profile?.[f.key] || ''));
  const descriptionChanged = (version.description || '') !== (profile?.description || '');
  const mediaChanged = JSON.stringify(version.product_media || []) !== JSON.stringify(profile?.product_media || []);
  const tagsChanged = JSON.stringify([...(version.selected_tags || [])].sort()) !== JSON.stringify([...(profile?.selected_tags || [])].sort());
  const highlightChanged = JSON.stringify([...(version.highlight_tags || [])].sort()) !== JSON.stringify([...(profile?.highlight_tags || [])].sort());

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
                  const changed = orig !== upd;
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
                </div>
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <p className="text-sm text-slate-400 mb-2">現有 ({profile?.product_media?.length || 0})</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(profile?.product_media || []).map((url: string, i: number) => <img key={i} src={url} alt="" className="w-14 h-14 object-cover rounded-lg" />)}
                    </div>
                  </div>
                  <div className={`p-3 ${mediaChanged ? 'bg-amber-50/30' : ''}`}>
                    <p className="text-sm text-slate-400 mb-2">申請更新 ({version.product_media?.length || 0})</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(version.product_media || []).map((url: string, i: number) => <img key={i} src={url} alt="" className="w-14 h-14 object-cover rounded-lg" />)}
                    </div>
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
