'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

const DAYS = [
  { key: 'office_hr_mon', label: '星期一' },
  { key: 'office_hr_tue', label: '星期二' },
  { key: 'office_hr_wed', label: '星期三' },
  { key: 'office_hr_thu', label: '星期四' },
  { key: 'office_hr_fri', label: '星期五' },
  { key: 'office_hr_sat', label: '星期六' },
  { key: 'office_hr_sun', label: '星期日' },
];

const FULL_REGEX = /^(([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?-\s?([0-1]?[0-9]|2[0-3]):[0-5][0-9]|休息|24小時營業)$/;

const validateTimeFormat = (value: string) => {
  if (!value || value.trim() === '') return true;
  return FULL_REGEX.test(value.trim());
};

interface OpeningHoursEditorProps {
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function OpeningHoursEditor({ formData, onChange }: OpeningHoursEditorProps) {
  return (
    <div className="space-y-3">
      {DAYS.map(({ key, label }) => {
        const value = formData[key] || '';
        const isRest = value === '休息';
        const is24h = value === '24小時營業';
        const isSpecial = isRest || is24h;
        const isValid = validateTimeFormat(value);

        return (
          <div key={key}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 w-16 shrink-0">{label}</span>

              <button
                type="button"
                onClick={() => onChange(key, isRest ? '' : '休息')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                  isRest
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                休息
              </button>

              <button
                type="button"
                onClick={() => onChange(key, is24h ? '' : '24小時營業')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
                  is24h
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                24小時
              </button>

              <Input
                value={isSpecial ? '' : value}
                onChange={(e) => onChange(key, e.target.value)}
                disabled={isSpecial}
                placeholder={isSpecial ? (isRest ? '休息' : '24小時營業') : '例：12:00 - 22:00'}
                className={`h-9 flex-1 ${
                  isSpecial ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''
                } ${!isValid && !isSpecial && value !== '' ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
            </div>
            {!isValid && !isSpecial && value !== '' && (
              <div className="flex items-center gap-2 mt-1.5 pl-[4.5rem]">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs text-red-600">
                  格式不正確，請輸入 HH:MM - HH:MM（例：12:00 - 22:00）
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
