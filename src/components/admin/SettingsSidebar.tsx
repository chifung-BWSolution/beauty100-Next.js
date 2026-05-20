'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag, MessageCircle, Settings, Code } from 'lucide-react';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const settingsTabs = [
  { key: 'tags', label: '美容院標籤', icon: Tag },
  { key: 'whatsapp', label: 'WhatsApp 客服', icon: null, customIcon: WhatsAppIcon },
  { key: 'tracking', label: '追蹤代碼', icon: Code },
];

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="w-56 flex-shrink-0 border-r border-rose-50 bg-white/95 min-h-full flex flex-col" style={{ backdropFilter: 'blur(20px)' }}>
      {/* Back button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-rose-50 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium">返回上一頁</span>
        </button>
      </div>

      {/* Settings header */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-rose-200/50"
            style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}>
            <Settings className="text-white w-[18px] h-[18px]" />
          </div>
          <div>
            <h2 className="text-slate-800 font-bold text-base leading-tight tracking-tight">系統設定</h2>
            <p className="text-rose-300 text-[14px] leading-none mt-0.5 font-medium">Settings</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="text-rose-300 text-[14px] font-bold uppercase tracking-widest px-3 mb-2">設定項目</p>
        {settingsTabs.map(tab => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left group ${
                active ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'
              }`}
              style={active ? {
                background: 'linear-gradient(135deg, rgba(254,205,211,0.5), rgba(251,207,232,0.4))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(253,164,175,0.3)'
              } : {}}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                active ? 'shadow-sm' : 'group-hover:bg-slate-50'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #f472b6, #e11d48)', boxShadow: '0 2px 8px rgba(225,29,72,0.25)' } : {}}>
                {Icon ? (
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                ) : tab.customIcon ? (
                  <tab.customIcon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                ) : null}
              </div>
              <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
