'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Store, ExternalLink, Eye } from 'lucide-react';
import ShopifyAPI from '@/api/shopify';
import { supabase } from '@/lib/supabase';

interface SalonProfile {
  id: string;
  salon_name: string;
  district?: string;
  address?: string;
  storefront_photo?: string;
  shopify_product_id?: string;
  shopify_sync_pending?: boolean;
  shopify_synced?: boolean;
}

interface Props {
  profiles: SalonProfile[];
}

export default function SalonProfileActions({ profiles }: Props) {
  const router = useRouter();
  const [previewUrls, setPreviewUrls] = useState<Record<string, any>>({});
  const [shopDomain, setShopDomain] = useState<string | null>(null);

  // Fetch shop domain from shopify_configs as a fallback for constructing admin URLs
  useEffect(() => {
    const fetchShopDomain = async () => {
      try {
        const { data } = await supabase
          .from('shopify_configs')
          .select('shop_domain')
          .eq('key', 'shopify_token')
          .single();
        if (data?.shop_domain) {
          const clean = data.shop_domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
          setShopDomain(clean);
        }
      } catch (err) {
        console.warn('[SalonProfileActions] Could not fetch shop domain:', err);
      }
    };
    fetchShopDomain();
  }, []);

  useEffect(() => {
    profiles.forEach((profile) => {
      if (profile.shopify_product_id) {
        fetchPreviewUrl(profile.id, profile.shopify_product_id);
      }
    });
  }, [profiles]);

  const fetchPreviewUrl = async (profileId: string, shopifyProductId: string) => {
    setPreviewUrls((prev) => ({ ...prev, [profileId]: { loadingUrl: true } }));
    try {
      const result = await ShopifyAPI.getProductPreviewUrl(shopifyProductId);
      console.log(`[SalonProfileActions] Preview URL result for ${profileId}:`, result);
      setPreviewUrls((prev) => ({
        ...prev,
        [profileId]: {
          loadingUrl: false,
          previewUrl: (result as any).previewUrl,
          liveUrl: (result as any).liveUrl,
          adminUrl: (result as any).adminUrl,
          shopDomain: (result as any).shopDomain,
          status: (result as any).status,
        },
      }));
    } catch (err) {
      console.error(`[SalonProfileActions] Failed to fetch preview URL for ${profileId} (product: ${shopifyProductId}):`, err);
      // Even on error, set a fallback so we can still show admin link
      setPreviewUrls((prev) => ({ ...prev, [profileId]: { loadingUrl: false, error: true } }));
    }
  };

  return (
    <div className="space-y-3">
      {profiles.map((profile) => {
        const urlInfo = previewUrls[profile.id] || {};
        const isLive = urlInfo.status === 'active' && urlInfo.liveUrl;
        const hasPreview = urlInfo.previewUrl;
        const hasShopifyProduct = !!profile.shopify_product_id;

        return (
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
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {profile.shopify_sync_pending && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-sm rounded-full px-2.5">等待審核</Badge>
                  )}
                  {!profile.shopify_sync_pending && profile.shopify_synced && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-sm rounded-full px-2.5">已同步</Badge>
                  )}
                  {urlInfo.status === 'active' && (
                    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm rounded-full px-2.5">上架中</Badge>
                  )}
                  {urlInfo.status === 'draft' && (
                    <Badge className="bg-slate-50 text-slate-500 border border-slate-200 text-sm rounded-full px-2.5">草稿</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rose-50/80">
              <button
                onClick={() => router.push(`/salon-edit?id=${profile.id}`)}
                className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                編輯資料
              </button>
              {hasShopifyProduct && (() => {
                const numericId = String(profile.shopify_product_id).replace(/.*\//, '');
                
                if (urlInfo.loadingUrl) {
                  return (
                    <div className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-slate-400 bg-slate-50 flex items-center justify-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                      <span>載入中...</span>
                    </div>
                  );
                }
                
                if (isLive) {
                  return (
                    <a
                      href={urlInfo.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />查看上架頁面
                    </a>
                  );
                }
                
                // For draft products: prefer the real preview URL (onlineStorePreviewUrl from Shopify)
                // Fallback to admin URL if no preview URL available
                const effectiveDomain = urlInfo.shopDomain || shopDomain;
                const fallbackAdminUrl = effectiveDomain && numericId
                  ? `https://${effectiveDomain}/admin/products/${numericId}`
                  : null;
                
                // Priority: previewUrl (real Shopify preview) > adminUrl > fallback admin URL
                const draftLink = hasPreview ? urlInfo.previewUrl : (urlInfo.adminUrl || fallbackAdminUrl);
                const isDraftPreview = !!hasPreview;
                
                if (draftLink) {
                  return (
                    <a
                      href={draftLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
                        isDraftPreview 
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                          : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />{isDraftPreview ? '預覽草稿' : '查看草稿（Shopify Admin）'}
                    </a>
                  );
                }
                
                return null;
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
