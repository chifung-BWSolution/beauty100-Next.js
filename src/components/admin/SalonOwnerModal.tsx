'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Phone, Mail, MessageCircle, User, MapPin, Globe } from 'lucide-react';

interface SalonOwnerModalProps {
  salon: any;
  onClose: () => void;
}

export default function SalonOwnerModal({ salon, onClose }: SalonOwnerModalProps) {
  if (!salon) return null;

  const profile = salon.profile;
  const ownerName = salon.ownerName || salon.ownerEmail || '-';

  return (
    <Dialog open={!!salon} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-pink-500" />
            {salon.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {salon.claimStatus === 'claimed' && <Badge className="bg-emerald-100 text-emerald-700 border-0">已認領</Badge>}
            {salon.claimStatus === 'pending' && <Badge className="bg-amber-100 text-amber-700 border-0">待審核</Badge>}
            {salon.claimStatus === 'unclaimed' && <Badge className="bg-slate-100 text-slate-500 border-0">未認領</Badge>}
            {salon.vendor && <span className="text-sm text-slate-500">{salon.vendor}</span>}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">負責人資料</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{ownerName}</p>
                {salon.ownerEmail && ownerName !== salon.ownerEmail && (
                  <p className="text-xs text-slate-400">{salon.ownerEmail}</p>
                )}
              </div>
            </div>

            {profile?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${profile.email}`} className="text-sm text-pink-600 hover:underline">{profile.email}</a>
              </div>
            )}

            {profile?.contact_number && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{profile.contact_number}</span>
              </div>
            )}

            {profile?.district && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{profile.district}</span>
              </div>
            )}

            {profile?.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline truncate">{profile.website}</a>
              </div>
            )}
          </div>

          {(profile?.whatsapp_number || profile?.contact_number) && (
            <a
              href={`https://wa.me/852${(profile.whatsapp_number || profile.contact_number).replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp 聯絡負責人
              </Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
