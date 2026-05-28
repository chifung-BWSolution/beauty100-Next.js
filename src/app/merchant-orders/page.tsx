import { redirect } from "next/navigation";
import { createSupabaseServerClient, getServerUser } from "@/lib/supabase-server";
import MerchantOrdersClient from "./MerchantOrdersClient";


export default async function MerchantOrdersPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = createSupabaseServerClient();

  // Get salon profiles owned by this user
  let { data: profiles } = await supabase
    .from("salon_profiles")
    .select("id, salon_name, salon_status")
    .eq("created_by", user.id);

  // Fallback: if no profiles found via created_by, check salon_applications
  if (!profiles || profiles.length === 0) {
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
        profiles = appProfiles || [];
      }
    }
  }

  if (!profiles || profiles.length === 0) {
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

  // Fetch order items for these salons
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .in("salon_profile_id", profileIds)
    .order("created_at", { ascending: false });

  const orderItems = items || [];

  // Fetch member info for the unique member_ids
  let memberMap: Record<string, { id: string; email?: string; full_name?: string; nickname?: string }> = {};
  const memberIds = [...new Set(orderItems.map((i: any) => i.member_id))];
  if (memberIds.length > 0) {
    const { data: members } = await supabase
      .from("members")
      .select("id, email, full_name, nickname")
      .in("id", memberIds);

    if (members) {
      members.forEach((m) => {
        memberMap[m.id] = m;
      });
    }
  }

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
