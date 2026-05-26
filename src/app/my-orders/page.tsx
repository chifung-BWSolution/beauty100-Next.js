"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import NoIndexMeta from "@/components/NoIndexMeta";
import PublicLayout from "@/components/public/PublicLayout";
import {
  ShoppingBag,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Store,
  Receipt,
  AlertCircle,
  QrCode,
  Camera,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItemRow {
  id: string;
  order_id: string;
  treatment_id: string;
  salon_profile_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  image_url: string | null;
  salon_name: string | null;
  redeem_start_date: string | null;
  redeem_end_date: string | null;
  status: string;
  redeemed_at: string | null;
  created_at: string;
  // joined fields
  treatment_image_url?: string | null;
  salon_address?: string | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  currency: string;
  items: any[];
  paid_at: string | null;
  created_at: string;
}

interface OrderWithItems extends Order {
  order_items: OrderItemRow[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItemRow | null>(null);
  const [scanning, setScanning] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{
    success: boolean;
    message: string;
    salon_name?: string;
  } | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const scannerRef = useRef<any>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      router.replace("/member-login");
      return;
    }
    fetchOrders();
  }, [user, isLoadingAuth, router]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Trigger auto-expire check
      supabase.functions.invoke("supabase-functions-expire-order-items", { body: {} }).catch(() => {});

      // Use auth session UID directly to ensure consistency with RLS
      const { data: sessionData } = await supabase.auth.getSession();
      const authUid = sessionData?.session?.user?.id;
      const queryUid = authUid || user.id;
      const isAdmin = user.role === "admin";
      console.log("[my-orders] auth UID:", authUid, "context user.id:", user.id, "role:", user.role, "using:", queryUid);

      // Fetch paid + pending orders
      let ordersData: any[] | null = null;
      let ordersError: any = null;

      // First try with member_id filter
      const { data: myOrders, error: myErr } = await supabase
        .from("orders")
        .select("*")
        .eq("member_id", queryUid)
        .in("status", ["paid", "pending"])
        .order("created_at", { ascending: false });

      console.log("[my-orders] myOrders:", myOrders, "myErr:", myErr);

      if (myOrders && myOrders.length > 0) {
        ordersData = myOrders;
        ordersError = myErr;
      } else if (isAdmin) {
        // Admin fallback: fetch all orders (admin RLS policy allows this)
        console.log("[my-orders] Admin fallback: fetching all orders");
        const { data: allOrders, error: allErr } = await supabase
          .from("orders")
          .select("*")
          .in("status", ["paid", "pending"])
          .order("created_at", { ascending: false });
        ordersData = allOrders;
        ordersError = allErr;
        console.log("[my-orders] allOrders:", allOrders, "allErr:", allErr);
      } else {
        ordersData = myOrders;
        ordersError = myErr;
      }

      if (ordersError || !ordersData) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: true });

      console.log("[my-orders] itemsData:", itemsData, "itemsErr:", itemsErr);

      // Fetch salon info (name + address) from salon_profiles for items that have salon_profile_id
      const salonProfileIds = [...new Set((itemsData || []).map((i: any) => i.salon_profile_id).filter(Boolean))];
      let salonInfoMap: Record<string, { name: string; address: string }> = {};
      if (salonProfileIds.length > 0) {
        const { data: salonsData, error: salonsErr } = await supabase
          .from("salon_profiles")
          .select("id, address, salon_name")
          .in("id", salonProfileIds);
        console.log("[my-orders] salonsData:", salonsData, "salonsErr:", salonsErr, "salonProfileIds:", salonProfileIds);
        if (salonsData) {
          salonsData.forEach((s: any) => {
            salonInfoMap[s.id] = { name: s.salon_name || "", address: s.address || "" };
          });
        }
      }

      // Fetch treatment data for items missing image_url, redeem dates, or salon_profile_id
      const treatmentIds = [...new Set((itemsData || []).map((i: any) => i.treatment_id).filter(Boolean))];
      let treatmentInfoMap: Record<string, { image_url: string | null; redeem_start_date: string | null; redeem_end_date: string | null; salon_profile_id: string | null }> = {};
      if (treatmentIds.length > 0) {
        const { data: treatmentsData } = await supabase
          .from("treatments")
          .select("id, image_url, redeem_start_date, redeem_end_date, salon_profile_id")
          .in("id", treatmentIds);
        if (treatmentsData) {
          treatmentsData.forEach((t: any) => {
            treatmentInfoMap[t.id] = {
              image_url: t.image_url || null,
              redeem_start_date: t.redeem_start_date || null,
              redeem_end_date: t.redeem_end_date || null,
              salon_profile_id: t.salon_profile_id || null,
            };
          });
        }
      }

      // Also fetch salon info for salon_profile_ids found in treatments (fallback when order_items.salon_profile_id is null)
      const treatmentSalonIds = [...new Set(
        Object.values(treatmentInfoMap)
          .map(t => t.salon_profile_id)
          .filter(Boolean)
          .filter(id => !salonInfoMap[id!])
      )] as string[];
      if (treatmentSalonIds.length > 0) {
        const { data: extraSalonsData } = await supabase
          .from("salon_profiles")
          .select("id, address, salon_name")
          .in("id", treatmentSalonIds);
        if (extraSalonsData) {
          extraSalonsData.forEach((s: any) => {
            salonInfoMap[s.id] = { name: s.salon_name || "", address: s.address || "" };
          });
        }
      }

      console.log("[my-orders] salonInfoMap:", salonInfoMap);
      console.log("[my-orders] treatmentInfoMap:", treatmentInfoMap);

      const itemsByOrder: Record<string, OrderItemRow[]> = {};
      (itemsData || []).forEach((rawItem: any) => {
        const treatmentInfo = rawItem.treatment_id ? treatmentInfoMap[rawItem.treatment_id] : null;
        // Use order_items.salon_profile_id first, fallback to treatment's salon_profile_id
        const effectiveSalonId = rawItem.salon_profile_id || treatmentInfo?.salon_profile_id || null;
        const salonInfo = effectiveSalonId ? salonInfoMap[effectiveSalonId] : null;
        console.log("[my-orders] item debug:", { 
          name: rawItem.name, 
          orderItemSalonId: rawItem.salon_profile_id, 
          treatmentSalonId: treatmentInfo?.salon_profile_id, 
          effectiveSalonId, 
          salonInfo,
          address: salonInfo?.address 
        });
        const item: OrderItemRow = {
          ...rawItem,
          // Use order_items values first, fallback to treatment data
          salon_name: rawItem.salon_name || (salonInfo?.name || null),
          image_url: rawItem.image_url || (treatmentInfo?.image_url || null),
          redeem_start_date: rawItem.redeem_start_date || (treatmentInfo?.redeem_start_date || null),
          redeem_end_date: rawItem.redeem_end_date || (treatmentInfo?.redeem_end_date || null),
          treatment_image_url: rawItem.image_url || (treatmentInfo?.image_url || null),
          salon_address: salonInfo?.address || null,
        };
        if (!itemsByOrder[item.order_id]) {
          itemsByOrder[item.order_id] = [];
        }
        itemsByOrder[item.order_id].push(item);
      });

      const ordersWithItems: OrderWithItems[] = ordersData.map((order) => ({
        ...order,
        order_items: itemsByOrder[order.id] || [],
      }));

      setOrders(ordersWithItems);
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

  const formatPrice = (amount: number) => {
    return `HK$${(amount / 100).toFixed(0)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_use":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
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

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    return end > now && end <= oneMonthFromNow;
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const getDaysUntilExpiry = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Filter orders based on search and status
  const filteredOrders = orders.map((order) => {
    const filteredItems = order.order_items.filter((item) => {
      const matchesSearch = searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.salon_name && item.salon_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return { ...order, order_items: filteredItems };
  }).filter((order) => order.order_items.length > 0);

  const openScanner = (item: OrderItemRow) => {
    setSelectedItem(item);
    setRedeemResult(null);
    setScannerOpen(true);
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setSelectedItem(null);
    setRedeemResult(null);
    setScanning(false);
    stopCamera();
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
  };

  const startScanning = async () => {
    setScanning(true);
    setRedeemResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText: string) => {
          await html5QrCode.stop();
          html5QrCodeRef.current = null;
          setScanning(false);
          handleRedeem(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error("Camera error:", err);
      setScanning(false);
      setRedeemResult({
        success: false,
        message: "無法開啟相機，請確認已授權相機權限",
      });
    }
  };

  const handleRedeem = async (qrSecret: string) => {
    if (!selectedItem) return;
    setRedeeming(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-redeem-treatment",
        {
          body: {
            order_item_id: selectedItem.id,
            qr_secret: qrSecret,
          },
        }
      );

      if (error) {
        setRedeemResult({
          success: false,
          message: error.message || "兌換失敗",
        });
      } else if (data?.error) {
        setRedeemResult({ success: false, message: data.error });
      } else {
        setRedeemResult({
          success: true,
          message: data.message || "兌換成功！",
          salon_name: data.salon_name,
        });
        fetchOrders();
      }
    } catch (e: any) {
      setRedeemResult({
        success: false,
        message: e.message || "兌換失敗，請稍後再試",
      });
    }
    setRedeeming(false);
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PublicLayout>
      <NoIndexMeta />
      <div className="p-6 md:p-8 max-w-3xl mx-auto min-h-[60vh]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f472b6, #e11d48)" }}
          >
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              我的訂單
            </h1>
            <p className="text-slate-400 text-sm">查看您的購買紀錄及兌換狀態</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜尋療程名稱或美容院..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="篩選狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="pending_use">待使用</SelectItem>
              <SelectItem value="redeemed">已使用</SelectItem>
              <SelectItem value="expired">已過期</SelectItem>
              <SelectItem value="refunded">已退款</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {orders.length === 0 ? "尚未有訂單" : "沒有符合條件的結果"}
            </h3>
            <p className="text-slate-400 text-sm">
              {orders.length === 0
                ? "完成購買後，您的訂單會顯示在這裡"
                : "嘗試更改搜尋或篩選條件"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id
                    )
                  }
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${order.status === "paid" ? "bg-green-50" : "bg-amber-50"}`}>
                      {order.status === "paid" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Treatment names */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {order.order_items.length > 0
                            ? order.order_items.map(i => i.name).filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 2).join("、") + (order.order_items.length > 2 ? ` 等${order.order_items.length}項` : "")
                            : `${order.order_items?.length || order.items?.length || 0} 項療程`
                          }
                        </span>
                        <Badge className={`text-xs flex-shrink-0 ${order.status === "paid" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}`}>
                          {order.status === "paid" ? "已付款" : "待付款"}
                        </Badge>
                      </div>
                      {/* Salon name */}
                      {order.order_items.length > 0 && order.order_items[0]?.salon_name && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500 truncate">
                            {[...new Set(order.order_items.map(i => i.salon_name).filter(Boolean))].join("、")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs font-medium text-pink-600">
                          {formatPrice(order.total_amount)}
                        </span>
                        <span className="text-xs text-slate-300">|</span>
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {formatDate(order.paid_at || order.created_at)}
                        </span>
                        {/* Expiry date in collapsed view */}
                        {order.order_items.length > 0 && order.order_items[0]?.redeem_end_date && (
                          <>
                            <span className="text-xs text-slate-300">|</span>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className={`text-xs ${
                              order.order_items.some(i => i.status === "pending_use" && i.redeem_end_date && isExpiringSoon(i.redeem_end_date))
                                ? "text-amber-600 font-medium"
                                : "text-slate-400"
                            }`}>
                              到期：{formatDate(order.order_items[0].redeem_end_date)}
                            </span>
                          </>
                        )}
                        {order.order_items.some(i => i.status === "pending_use" && i.redeem_end_date && isExpiringSoon(i.redeem_end_date)) && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px] px-1.5 py-0 h-4 ml-1 flex-shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            即將到期
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 flex-shrink-0 ml-2">
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Items */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {order.order_items.length > 0
                      ? order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-4 bg-slate-50/30"
                          >
                            <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {(item.image_url || item.treatment_image_url) ? (
                                <img
                                  src={item.image_url || item.treatment_image_url || ""}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-800 truncate">
                                  {item.name}
                                </h4>
                                {getStatusBadge(item.status)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {item.salon_name && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Store className="w-3 h-3" />
                                    {item.salon_name}
                                  </span>
                                )}
                              </div>
                              {/* Salon Address */}
                              {item.salon_address && (
                                <div className="flex items-start gap-1 mt-1">
                                  <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-slate-400">{item.salon_address}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-slate-500">
                                  x{item.quantity}
                                </span>
                                <span className="text-xs text-slate-300">|</span>
                                <span className="text-xs font-medium text-pink-600">
                                  HK${item.unit_price}
                                </span>
                              </div>
                              {(item.redeem_start_date || item.redeem_end_date) && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs text-slate-500">
                                      兌換期：{item.redeem_start_date ? formatDate(item.redeem_start_date) : "—"} ~ {item.redeem_end_date ? formatDate(item.redeem_end_date) : "—"}
                                    </span>
                                  </div>
                                  {item.status === "pending_use" && item.redeem_end_date && isExpiringSoon(item.redeem_end_date) && (
                                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                      <span className="text-xs font-medium text-amber-700">
                                        ⚠️ 將於 {getDaysUntilExpiry(item.redeem_end_date)} 日後到期，請盡快使用！
                                      </span>
                                    </div>
                                  )}
                                  {item.status === "pending_use" && item.redeem_end_date && isExpired(item.redeem_end_date) && (
                                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-md px-2 py-1">
                                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                      <span className="text-xs font-medium text-red-600">
                                        已過期
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {item.redeemed_at && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs text-blue-600">
                                    已於 {formatDate(item.redeemed_at)} 兌換
                                  </span>
                                </div>
                              )}
                              {item.status === "pending_use" && (
                                <Button
                                  size="sm"
                                  className="mt-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 text-xs h-8 gap-1.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openScanner(item);
                                  }}
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                  兌換療程
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      : order.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-4 bg-slate-50/30"
                          >
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
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-800 truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">
                                  x{item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={(open) => !open && closeScanner()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-pink-500" />
              兌換療程
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedItem && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-800">
                  {selectedItem.name}
                </p>
                {selectedItem.salon_name && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {selectedItem.salon_name}
                  </p>
                )}
              </div>
            )}

            {redeemResult && (
              <div
                className={`rounded-lg p-4 text-center ${
                  redeemResult.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {redeemResult.success ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-semibold">
                      {redeemResult.message}
                    </p>
                    {redeemResult.salon_name && (
                      <p className="text-green-600 text-sm mt-1">
                        美容院：{redeemResult.salon_name}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                    <p className="text-red-600 font-medium">
                      {redeemResult.message}
                    </p>
                  </>
                )}
              </div>
            )}

            {!redeemResult && (
              <>
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full rounded-lg overflow-hidden bg-black min-h-[280px]"
                />

                {!scanning && (
                  <Button
                    onClick={startScanning}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    開啟相機掃描
                  </Button>
                )}

                {scanning && (
                  <p className="text-center text-sm text-slate-500">
                    請將相機對準商戶的 QR Code...
                  </p>
                )}
              </>
            )}

            {redeeming && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 text-pink-500 animate-spin" />
                <span className="ml-2 text-sm text-slate-600">兌換中...</span>
              </div>
            )}

            {redeemResult && (
              <Button
                variant="outline"
                onClick={closeScanner}
                className="w-full"
              >
                關閉
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
