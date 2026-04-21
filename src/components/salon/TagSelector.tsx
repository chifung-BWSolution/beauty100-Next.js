'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const MAX_HIGHLIGHTS = 4;

const HIGHLIGHT_CATEGORIES = new Set([
  '面部基礎護理', '儀器醫美療程', '身體護理', '脫毛服務',
  '半永久紋繡', '眼睫服務', '特殊專科護理',
]);

const CATEGORY_ORDER = [
  '面部基礎護理', '儀器醫美療程', '身體護理', '脫毛服務',
  '半永久紋繡', '眼睫服務', '特殊專科護理', '消費透明度',
  '品質認證', '客群特色', '專業服務', '便利設施', '語言及預約',
];

export const CATEGORY_PREFIX: Record<string, string> = {
  '面部基礎護理': 'face_', '儀器醫美療程': 'machine_', '身體護理': 'body_',
  '脫毛服務': 'hair_', '半永久紋繡': 'semi-perm_', '眼睫服務': 'eyes_',
  '特殊專科護理': 'med_', '消費透明度': 'pay_', '品質認證': 'quali_',
  '客群特色': 'seg_', '專業服務': 'service_', '便利設施': 'amenities_',
  '語言及預約': 'booking_',
};

export function getTagWithPrefix(label: string, category: string): string {
  const prefix = CATEGORY_PREFIX[category] || '';
  return prefix + label;
}

interface TagSelectorProps {
  selectedTags?: string[];
  highlightTags?: string[];
  onChange: (value: { selectedTags: string[]; highlightTags: string[] }) => void;
}

export default function TagSelector({ selectedTags = [], highlightTags = [], onChange }: TagSelectorProps) {
  const [tagsByCategory, setTagsByCategory] = useState<[string, any[]][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from('salon_tags')
        .select('*')
        .order('sort_order');
      if (!error && data) {
        const grouped: Record<string, any[]> = {};
        data.forEach((t: any) => {
          if (!grouped[t.category]) grouped[t.category] = [];
          grouped[t.category].push(t);
        });
        const sorted: [string, any[]][] = CATEGORY_ORDER
          .filter(cat => grouped[cat])
          .map(cat => [cat, grouped[cat]]);
        Object.keys(grouped).forEach(cat => {
          if (!CATEGORY_ORDER.includes(cat)) sorted.push([cat, grouped[cat]]);
        });
        setTagsByCategory(sorted);
      }
      setLoading(false);
    };
    fetchTags();
  }, []);

  const toggleTag = (label: string) => {
    const next = selectedTags.includes(label)
      ? selectedTags.filter(t => t !== label)
      : [...selectedTags, label];
    const nextHighlights = highlightTags.filter(t => next.includes(t));
    onChange({ selectedTags: next, highlightTags: nextHighlights });
  };

  const toggleHighlight = (label: string) => {
    if (highlightTags.includes(label)) {
      onChange({ selectedTags, highlightTags: highlightTags.filter(t => t !== label) });
    } else {
      if (highlightTags.length >= MAX_HIGHLIGHTS) return;
      onChange({ selectedTags, highlightTags: [...highlightTags, label] });
    }
  };

  if (loading) {
    return <div className="h-12 flex items-center text-sm text-slate-400">載入標籤中...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        <Star className="w-3.5 h-3.5 mt-0.5 shrink-0 fill-amber-400 text-amber-400" />
        <div>
          <p className="font-medium mb-0.5">服務類型 Highlight 標籤（最多選 {MAX_HIGHLIGHTS} 個）</p>
          <p className="text-amber-600">服務類別標籤可設為 Highlight，會顯示於美容院列表及 Profile 頂部。最多 {MAX_HIGHLIGHTS} 個。</p>
        </div>
      </div>

      {tagsByCategory.map(([category, tags]) => {
        const isHighlightCategory = HIGHLIGHT_CATEGORIES.has(category);
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-sm font-semibold text-slate-700">{category}</span>
              {isHighlightCategory && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />可設 Highlight
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: any) => {
                const selected = selectedTags.includes(tag.label);
                const highlighted = highlightTags.includes(tag.label);
                const canHighlight = isHighlightCategory && selected;
                const highlightDisabled = isHighlightCategory && !highlighted && highlightTags.length >= MAX_HIGHLIGHTS;

                return (
                  <div key={tag.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                        selected
                          ? 'bg-rose-500 text-white border-rose-500 font-medium'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      {tag.label}
                    </button>

                    {canHighlight && (
                      <button
                        type="button"
                        onClick={() => toggleHighlight(tag.label)}
                        disabled={highlightDisabled}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          highlighted
                            ? 'bg-amber-400 text-white'
                            : highlightDisabled
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${highlighted ? 'fill-white' : ''}`} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedTags.length > 0 && (
        <div className="pt-3 border-t space-y-2">
          {highlightTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-700 mb-1.5 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Highlight 標籤：{highlightTags.length} / {MAX_HIGHLIGHTS}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {highlightTags.map(t => (
                  <Badge key={t} className="bg-amber-100 text-amber-700 border-0 text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">所有已選標籤：{selectedTags.length} 個</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map(t => (
                <Badge key={t} className={`border-0 text-xs ${highlightTags.includes(t) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
