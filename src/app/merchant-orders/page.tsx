"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import NoIndexMeta from "@/components/NoIndexMeta";
import {
  Receipt,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  QrCode,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface OrderItemRecord {
  id: string;
  order_id: string;
  treatment_id: string;
  salon_profile_id: string | null;
  member_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  salon_name: string | null;
  redeem_start_date: string | null;
  redeem_end_date: string | null;
  status: string;
  redeemed_at: string | null;
  settled_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberInfo {
  id: string;
  email?: string;
  full_name?: string;
  nickname?: string;
}

export default function MerchantOrdersPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [orderItems, setOrderItems] = useState<OrderItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [salonProfileIds, setSalonProfileIds] = useState<string[]>([]);
  const [hasApprovedProfile, setHasApprovedProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrSecret, setQrSecret] = useState<string>("");
  const [salonName, setSalonName] = useState<string>("");
  const [generatingQr, setGeneratingQr] = useState(false);
  const [settlingItemId, setSettlingItemId] = useState<string | null>(null);
  const [memberMap, setMemberMap] = useState<Record<string, MemberInfo>>({});
  const [detailItem, setDetailItem] = useState<OrderItemRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchData();
  }, [user, isLoadingAuth, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Trigger auto-expire check
      supabase.functions.invoke("supabase-functions-expire-order-items", { body: {} }).catch(() => {});

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
        setLoading(false);
        return;
      }

      const approvedProfiles = profiles.filter(
        (p) => p.salon_status === "active" || !p.salon_status
      );
      setHasApprovedProfile(approvedProfiles.length > 0 || profiles.length > 0);

      const profileIds = profiles.map((p) => p.id);
      setSalonProfileIds(profileIds);
      setSalonName(profiles[0]?.salon_name || "");

      // Fetch order items for these salons
      const { data: items, error } = await supabase
        .from("order_items")
        .select("*")
        .in("salon_profile_id", profileIds)
        .order("created_at", { ascending: false });

      if (!error && items) {
        setOrderItems(items);

        // Fetch member info for the unique member_ids
        const memberIds = [...new Set(items.map((i) => i.member_id))];
        if (memberIds.length > 0) {
          const { data: members } = await supabase
            .from("members")
            .select("id, email, full_name, nickname")
            .in("id", memberIds);

          if (members) {
            const map: Record<string, MemberInfo> = {};
            members.forEach((m) => {
              map[m.id] = m;
            });
            setMemberMap(map);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("zh-HK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("zh-HK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_use":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
            待使用
          </Badge>
        );
      case "redeemed":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
            已使用
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 text-xs">
            已過期
          </Badge>
        );
      case "settled":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
            已結算
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-red-100 text-red-600 hover:bg-red-100 text-xs">
            已退款
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 text-xs">
            {status}
          </Badge>
        );
    }
  };

  const filteredItems = orderItems.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  const handleSettleItem = async (itemId: string) => {
    setSettlingItemId(itemId);
    try {
      const { error } = await supabase
        .from("order_items")
        .update({
          status: "settled",
          settled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (!error) {
        setOrderItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: "settled",
                  settled_at: new Date().toISOString(),
                }
              : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
    setSettlingItemId(null);
  };

  const handleShowDetail = (item: OrderItemRecord) => {
    setDetailItem(item);
    setDetailDialogOpen(true);
  };

  const handleShowQR = async () => {
    if (salonProfileIds.length === 0) {
      alert("未找到美容院資料，請稍後再試");
      return;
    }
    setQrDialogOpen(true);
    setGeneratingQr(true);
    setQrSecret("");

    try {
      // Generate or get existing QR secret
      const { data, error } = await supabase.rpc("generate_salon_qr_secret", {
        p_salon_profile_id: salonProfileIds[0],
      });

      if (error) {
        console.error("QR generation error:", error);
      } else if (data) {
        setQrSecret(data);
      }
    } catch (e) {
      console.error("QR generation exception:", e);
    }
    setGeneratingQr(false);
  };

  const getMemberDisplay = (memberId: string) => {
    const member = memberMap[memberId];
    if (!member) return "客戶";
    return member.nickname || member.full_name || member.email || "客戶";
  };

  // Stats
  const stats = {
    total: orderItems.length,
    pendingUse: orderItems.filter((i) => i.status === "pending_use").length,
    redeemed: orderItems.filter((i) => i.status === "redeemed").length,
    expired: orderItems.filter((i) => i.status === "expired").length,
    settled: orderItems.filter((i) => i.status === "settled").length,
    refunded: orderItems.filter((i) => i.status === "refunded").length,
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NoIndexMeta />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                }}
              >
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  訂單紀錄
                </h1>
                <p className="text-slate-400 text-sm">
                  管理客戶的療程訂單及兌換狀態
                </p>
              </div>
            </div>
            <Button
              onClick={handleShowQR}
              className="bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 gap-2 hidden sm:flex"
            >
              <QrCode className="w-4 h-4" />
              我的 QR Code
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400">全部</p>
              <p className="text-xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-amber-100 shadow-sm">
              <p className="text-xs text-amber-600">待使用</p>
              <p className="text-xl font-bold text-amber-700">
                {stats.pendingUse}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-100 shadow-sm">
              <p className="text-xs text-blue-600">已使用</p>
              <p className="text-xl font-bold text-blue-700">
                {stats.redeemed}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500">已過期</p>
              <p className="text-xl font-bold text-slate-600">
                {stats.expired}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-green-100 shadow-sm">
              <p className="text-xs text-green-600">已結算</p>
              <p className="text-xl font-bold text-green-700">
                {stats.settled}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-red-100 shadow-sm">
              <p className="text-xs text-red-600">已退款</p>
              <p className="text-xl font-bold text-red-600">
                {stats.refunded}
              </p>
            </div>
          </div>

          {/* Mobile QR Button */}
          <div className="sm:hidden mb-4">
            <Button
              onClick={handleShowQR}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 gap-2"
            >
              <QrCode className="w-4 h-4" />
              我的 QR Code
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white border border-slate-100 shadow-sm overflow-x-auto">
              <TabsTrigger value="all" className="text-xs">
                全部
              </TabsTrigger>
              <TabsTrigger value="pending_use" className="text-xs">
                待使用
              </TabsTrigger>
              <TabsTrigger value="redeemed" className="text-xs">
                已使用
              </TabsTrigger>
              <TabsTrigger value="expired" className="text-xs">
                已過期
              </TabsTrigger>
              <TabsTrigger value="settled" className="text-xs">
                已結算
              </TabsTrigger>
              <TabsTrigger value="refunded" className="text-xs">
                已退款
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Order Items List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                暫無訂單
              </h3>
              <p className="text-slate-400 text-sm">
                當客戶購買您的療程後，訂單會顯示在這裡
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 cursor-pointer hover:border-purple-200 hover:shadow-md transition-all"
                  onClick={() => handleShowDetail(item)}
                >
                  <div className="flex items-start gap-3">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                          {item.name}
                        </h4>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          HK${item.unit_price} × {item.quantity}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          購買：{formatDate(item.created_at)}
                        </span>
                      </div>

                      {/* Expiry date */}
                      {item.redeem_end_date && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3 h-3 text-orange-400" />
                          <span className={`text-xs ${
                            new Date(item.redeem_end_date) < new Date()
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}>
                            到期日：{formatDate(item.redeem_end_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {(item.status === "redeemed" ||
                        item.status === "expired") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSettleItem(item.id);
                          }}
                          disabled={settlingItemId === item.id}
                        >
                          {settlingItemId === item.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <DollarSign className="w-3 h-3" />
                          )}
                          結算
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 text-slate-400 hover:text-purple-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetail(item);
                        }}
                      >
                        <Info className="w-3 h-3" />
                        詳情
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-500" />
              商戶 QR Code
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center">
              客戶掃描此 QR Code 即可兌換療程
            </p>

            {generatingQr ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : qrSecret ? (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG
                    value={qrSecret}
                    size={220}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {salonName}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    此 QR Code 長期有效，請妥善保管
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-red-500">
                生成 QR Code 失敗，請稍後再試
              </p>
            )}

            <Button
              variant="outline"
              onClick={() => setQrDialogOpen(false)}
              className="w-full"
            >
              關閉
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-500" />
              訂單詳情
            </DialogTitle>
          </DialogHeader>

          {detailItem && (
            <div className="space-y-4">
              {/* Item info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {detailItem.image_url ? (
                    <img
                      src={detailItem.image_url}
                      alt={detailItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-800">
                    {detailItem.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    HK${detailItem.unit_price} × {detailItem.quantity}
                  </p>
                </div>
                {getStatusBadge(detailItem.status)}
              </div>

              {/* Customer */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">客戶</p>
                <p className="text-sm text-slate-700 font-medium">
                  {getMemberDisplay(detailItem.member_id)}
                </p>
              </div>

              {/* Timeline / Log */}
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-600">訂單時間線</p>
                </div>
                <div className="p-3 space-y-3">
                  {/* Purchase */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">客戶購買</p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(detailItem.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Redeem period */}
                  {(detailItem.redeem_start_date || detailItem.redeem_end_date) && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-3 h-3 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">兌換有效期</p>
                        <p className="text-xs text-slate-400">
                          {detailItem.redeem_start_date
                            ? formatDate(detailItem.redeem_start_date)
                            : "—"}{" "}
                          至{" "}
                          {detailItem.redeem_end_date
                            ? formatDate(detailItem.redeem_end_date)
                            : "—"}
                        </p>
                        {detailItem.redeem_end_date &&
                          new Date(detailItem.redeem_end_date) < new Date() &&
                          detailItem.status !== "redeemed" &&
                          detailItem.status !== "settled" && (
                            <p className="text-xs text-red-500 mt-0.5">已過期</p>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Redeemed */}
                  {detailItem.redeemed_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">客戶兌換</p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(detailItem.redeemed_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Settled */}
                  {detailItem.settled_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <DollarSign className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">已結算</p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(detailItem.settled_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Refunded */}
                  {detailItem.refunded_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">已退款</p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(detailItem.refunded_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pending - no action yet */}
                  {detailItem.status === "pending_use" &&
                    !detailItem.redeemed_at &&
                    !detailItem.settled_at &&
                    !detailItem.refunded_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">等待客戶使用</p>
                          <p className="text-xs text-slate-400">
                            客戶尚未兌換此療程
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setDetailDialogOpen(false)}
                className="w-full"
              >
                關閉
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
