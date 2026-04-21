'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const REGION_GROUPS = [
  { region: '香港島', emoji: '🏙️', districts: ['中環', '上環', '灣仔', '銅鑼灣', '北角', '鰂魚涌', '天后', '炮台山', '柴灣', '西灣河', '西營盤', '香港仔', '堅尼地城', '半山區', '跑馬地'] },
  { region: '九龍', emoji: '🌆', districts: ['尖沙咀', '觀塘', '旺角', '油麻地', '佐敦', '太子', '深水埗', '長沙灣', '荔枝角', '美孚', '九龍城', '九龍塘', '何文田', '紅磡', '九龍灣', '牛頭角', '藍田', '黃大仙', '鑽石山', '新蒲崗', '慈雲山', '大角咀', '彩虹', '樂富'] },
  { region: '新界', emoji: '🌿', districts: ['元朗', '荃灣', '屯門', '大埔', '沙田', '火炭', '馬鞍山', '將軍澳', '天水圍', '葵芳', '葵涌', '青衣', '上水', '粉嶺', '西貢', '大圍', '大窩口', '東涌'] },
  { region: '離島區', emoji: '🏝️', districts: ['離島區'] },
];

interface District { id?: string; name: string; }

interface DistrictSelectProps {
  districts?: District[];
  value?: string;
  onChange: (name: string) => void;
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  loading?: boolean;
}

export default function DistrictSelect({
  districts = [],
  value,
  onChange,
  className = '',
  triggerClassName = '',
  placeholder = '請選擇地區',
  loading = false,
}: DistrictSelectProps) {
  const [open, setOpen] = useState(false);

  const grouped = REGION_GROUPS.map((group) => {
    const matched = districts.filter((d) =>
      group.districts.some((gd) => d.name?.includes(gd) || gd.includes(d.name))
    );
    return { ...group, items: matched };
  });

  const allGroupedNames = REGION_GROUPS.flatMap((g) => g.districts);
  const ungrouped = districts.filter(
    (d) => !allGroupedNames.some((gd) => d.name?.includes(gd) || gd.includes(d.name))
  );

  if (loading) {
    return (
      <div className={`h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center px-3 text-slate-400 text-sm ${className}`}>
        載入中...
      </div>
    );
  }

  if (districts.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between h-11 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all ${
          value
            ? 'border-rose-200 bg-white text-slate-800'
            : 'border-slate-200 bg-white text-slate-400'
        } ${triggerClassName}`}
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-slate-100">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 transition-colors"
            >
              {placeholder}
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {grouped.map((group) =>
              group.items.length === 0 ? null : (
                <div key={group.region}>
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
                    <span className="text-sm">{group.emoji}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.region}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-0.5 p-2">
                    {group.items.map((d) => (
                      <button
                        key={d.id || d.name}
                        type="button"
                        onClick={() => { onChange(d.name); setOpen(false); }}
                        className={`text-sm px-2 py-2 rounded-lg text-center transition-colors ${
                          value === d.name
                            ? 'bg-rose-500 text-white font-medium'
                            : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
            {ungrouped.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">其他</span>
                </div>
                <div className="grid grid-cols-3 gap-0.5 p-2">
                  {ungrouped.map((d) => (
                    <button
                      key={d.id || d.name}
                      type="button"
                      onClick={() => { onChange(d.name); setOpen(false); }}
                      className={`text-sm px-2 py-2 rounded-lg text-center transition-colors ${
                        value === d.name
                          ? 'bg-rose-500 text-white font-medium'
                          : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
