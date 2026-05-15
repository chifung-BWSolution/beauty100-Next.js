'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Store, Loader2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 50;

interface Props {
  initialDistricts: string[];
}

export default function ClaimSalonClient({ initialDistricts }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [salons, setSalons] = useState<any[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [filtering, setFiltering] = useState(false);
  const [districts, setDistricts] = useState<string[]>(initialDistricts);
  const [districtFilter, setDistrictFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState('');

  useEffect(() => {
    fetchAvailableSalons();
  }, []);

  const fetchAvailableSalons = async () => {
    setFiltering(true);
    try {
      setLoadingProgress('從資料庫載入美容院...');

      // Fetch salons from salon_profiles that have no owner (created_by is null)
      // These are unclaimed salons available for claiming
      const FETCH_LIMIT = 1000;
      let allSalons: any[] = [];
      let from = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('salon_profiles')
          .select('id, salon_name, district_name, image_src, address, product_media')
          .is('created_by', null)
          .or('is_active.eq.true,is_active.is.null')
          .order('salon_name')
          .range(from, from + FETCH_LIMIT - 1);

        if (error) {
          console.error('Error fetching salons:', error);
          break;
        }

        if (data) {
          allSalons = [...allSalons, ...data];
          if (data.length < FETCH_LIMIT) {
            hasMore = false;
          } else {
            from += FETCH_LIMIT;
          }
        } else {
          hasMore = false;
        }
      }

      // Also exclude salons that have pending claim applications
      const { data: pendingClaims } = await supabase
        .from('salon_applications')
        .select('salon_profile_id, shopify_product_id, status')
        .eq('application_type', 'claim')
        .neq('status', 'rejected');

      const claimedSalonIds = new Set(
        (pendingClaims || [])
          .map((a: any) => a.salon_profile_id)
          .filter(Boolean)
      );

      const available = allSalons.filter((s: any) => !claimedSalonIds.has(s.id));

      // Build districts if not already provided
      if (initialDistricts.length === 0) {
        const uniqueDistricts = Array.from(
          new Set(available.map((s: any) => s.district_name).filter(Boolean))
        ) as string[];
        setDistricts(uniqueDistricts.sort());
      }

      setSalons(available);
    } catch {
      toast.error('無法取得美容院列表');
    } finally {
      setFiltering(false);
      setLoadingProgress('');
      setLoading(false);
    }
  };

  const filteredSalons = salons.filter((s) => {
    const matchSearch =
      (s.salon_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = districtFilter === 'all' || s.district_name === districtFilter;
    return matchSearch && matchDistrict;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSalons.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filteredSalons.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleClaim = () => {
    if (!selectedSalon) return;
    const salonData = encodeURIComponent(
      JSON.stringify({
        salon_name: selectedSalon.salon_name,
        salon_profile_id: selectedSalon.id,
        district: selectedSalon.district_name || '',
      })
    );
    router.push(`/merchant-signup?type=claim&salon=${salonData}`);
  };

  // Get the first image from product_media or use image_src
  const getSalonImage = (salon: any): string | null => {
    if (salon.image_src) return salon.image_src;
    if (salon.product_media) {
      try {
        const media = typeof salon.product_media === 'string' ? JSON.parse(salon.product_media) : salon.product_media;
        if (Array.isArray(media) && media.length > 0) {
          return media[0]?.src || media[0]?.url || null;
        }
      } catch {}
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
        <div className="w-7 h-7 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        {loadingProgress && <p className="text-sm text-slate-500">{loadingProgress}</p>}
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜尋美容院名稱..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          value={districtFilter}
          onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
          className="h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 sm:w-48"
        >
          <option value="all">所有地區</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {filtering ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          <p className="text-slate-500">{loadingProgress || '載入中...'}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">共 {filteredSalons.length} 間可認領</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginated.map((salon) => {
              const image = getSalonImage(salon);
              return (
                <div
                  key={salon.id}
                  onClick={() => setSelectedSalon(salon)}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 hover:shadow-lg ${
                    selectedSalon?.id === salon.id
                      ? 'border-rose-400 bg-rose-50/50 shadow-md'
                      : 'border-slate-100 bg-white hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shrink-0">
                      {image ? (
                        <img src={image} alt="" className="w-12 h-12 object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-pink-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{salon.salon_name}</p>
                      {salon.district_name && (
                        <p className="text-sm text-purple-500 mt-0.5">{salon.district_name}</p>
                      )}
                    </div>
                    {selectedSalon?.id === salon.id && (
                      <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {paginated.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Store className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">找不到符合條件的美容院</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-500">第 {safePage} / {totalPages} 頁</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {selectedSalon && (
            <div className="sticky bottom-4 flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl border border-rose-100 px-6 py-4 flex items-center gap-4 max-w-md w-full">
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-0.5">已選擇</p>
                  <p className="font-semibold text-slate-800 truncate">{selectedSalon.salon_name}</p>
                </div>
                <Button
                  onClick={handleClaim}
                  className="text-white border-0 gap-2 whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
                >
                  認領此美容院<ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
