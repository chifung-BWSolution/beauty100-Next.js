"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import MerchantOrdersClient from "./MerchantOrdersClient";

export default function MerchantOrdersPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [memberMap, setMemberMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace("/login?returnTo=/merchant-orders");
      return;
    }

    const fetchData = async () => {
      try {
        // Get salon profiles owned by this user
        let { data: profilesData } = await supabase
          .from("salon_profiles")
          .select("id, salon_name, salon_status")
          .eq("created_by", user.id);

        // Fallback: if no profiles found via created_by, check salon_applications
        if (!profilesData || profilesData.length === 0) {
          const { data: apps } = await supabase
            .from("salon_applications")
            .select("salon_profile_id")
            .eq("created_by", user.id)
            .eq("status", "approved")
            .not("salon_profile_id", "is", null);

          if (apps && apps.length > 0) {
            const profileIds = apps
              .map((a) => a.salon_profile_id)
              .filter(Boolean) as string[];
            if (profileIds.length > 0) {
              const { data: appProfiles } = await supabase
                .from("salon_profiles")
                .select("id, salon_name, salon_status")
                .in("id", profileIds);
              profilesData = appProfiles || [];
            }
          }
        }

        if (!profilesData || profilesData.length === 0) {
          setProfiles([]);
          setLoading(false);
          return;
        }

        setProfiles(profilesData);

        const profileIds = profilesData.map((p) => p.id);

        // Fetch order items for these salons
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .in("salon_profile_id", profileIds)
          .order("created_at", { ascending: false });

        const fetchedItems = items || [];
        setOrderItems(fetchedItems);

        // Fetch member info for the unique member_ids
        const memberIds = [...new Set(fetchedItems.map((i: any) => i.member_id))];
        if (memberIds.length > 0) {
          const { data: members } = await supabase
            .from("members")
            .select("id, email, full_name, nickname")
            .in("id", memberIds);

          if (members) {
            const map: Record<string, any> = {};
            members.forEach((m) => {
              map[m.id] = m;
            });
            setMemberMap(map);
          }
        }
      } catch (err) {
        console.error("Error fetching merchant orders data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isLoadingAuth, router]);

  if (isLoadingAuth || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-sm text-slate-400">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">暫無美容院資料</h2>
          <p className="text-sm text-slate-400">請先完成商戶註冊</p>
        </div>
      </div>
    );
  }

  const profileIds = profiles.map((p) => p.id);
  const salonProfiles = profiles.map((p) => ({ id: p.id, salon_name: p.salon_name || "" }));
  const salonName = profiles[0]?.salon_name || "";

  return (
    <MerchantOrdersClient
      initialOrderItems={orderItems}
      initialMemberMap={memberMap}
      initialSalonProfileIds={profileIds}
      initialSalonProfiles={salonProfiles}
      initialSalonName={salonName}
    />
  );
}
