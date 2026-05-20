'use client';

import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';

interface SalonProfile {
  id: string;
  salon_name: string;
  district?: string;
  address?: string;
  storefront_photo?: string;
}

interface Props {
  profiles: SalonProfile[];
}

export default function SalonProfileActions({ profiles }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-rose-100/60"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251,207,232,0.3)',
            boxShadow: '0 2px 12px rgba(244,114,182,0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}
            >
              {profile.storefront_photo ? (
                <img src={profile.storefront_photo} alt={profile.salon_name} className="w-14 h-14 object-cover" />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center">
                  <Store className="w-7 h-7 text-rose-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{profile.salon_name}</p>
              <p className="text-sm text-slate-400 truncate mt-0.5">{profile.district || profile.address || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rose-50/80">
            <button
              onClick={() => router.push(`/salon-edit?id=${profile.id}`)}
              className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              編輯資料
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
