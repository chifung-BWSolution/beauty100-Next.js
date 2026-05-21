"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import NoIndexMeta from "@/components/NoIndexMeta";
import {
  Plus,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Calendar,
  Package,
  DollarSign,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Treatment {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  original_price: number;
  promo_price: number | null;
  promo_expiry: string | null;
  limited_quantity: number | null;
  status: string;
  salon_profile_id: string | null;
  created_at: string;
}

interface SalonProfile {
  id: string;
  salon_name: string;
}

export default function MyTreatmentsPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [salons, setSalons] = useState<SalonProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formPromoPrice, setFormPromoPrice] = useState("");
  const [formPromoExpiry, setFormPromoExpiry] = useState("");
  const [formLimitedQty, setFormLimitedQty] = useState("");
  const [formSalonId, setFormSalonId] = useState("");

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
      const [treatmentsRes, salonsRes] = await Promise.all([
        supabase
          .from("treatments")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("salon_profiles")
          .select("id, salon_name")
          .eq("created_by", user.id),
      ]);
      setTreatments(treatmentsRes.data || []);
      setSalons(salonsRes.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleStatus = async (treatment: Treatment) => {
    const newStatus = treatment.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("treatments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", treatment.id);
    if (!error) {
      setTreatments((prev) =>
        prev.map((t) =>
          t.id === treatment.id ? { ...t, status: newStatus } : t
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formName || !formOriginalPrice) return;
    setSaving(true);

    const payload = {
      created_by: user.id,
      name: formName,
      description: formDesc || null,
      image_url: formImage || null,
      original_price: parseFloat(formOriginalPrice),
      promo_price: formPromoPrice ? parseFloat(formPromoPrice) : null,
      promo_expiry: formPromoExpiry || null,
      limited_quantity: formLimitedQty ? parseInt(formLimitedQty) : null,
      salon_profile_id: formSalonId || null,
      status: "active",
    };

    const { data, error } = await supabase
      .from("treatments")
      .insert(payload)
      .select()
      .single();

    if (!error && data) {
      setTreatments((prev) => [data, ...prev]);
      resetForm();
      setShowForm(false);
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormImage("");
    setFormOriginalPrice("");
    setFormPromoPrice("");
    setFormPromoExpiry("");
    setFormLimitedQty("");
    setFormSalonId("");
  };

  const getSalonName = (salonId: string | null) => {
    if (!salonId) return "未指定";
    const salon = salons.find((s) => s.id === salonId);
    return salon?.salon_name || "未知美容院";
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NoIndexMeta />
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f472b6, #e11d48)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                我的療程
              </h1>
              <p className="text-slate-400 text-sm">管理您的療程項目</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-5"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增療程
          </Button>
        </div>

        {/* Add Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                新增療程
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 療程名 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    療程名稱 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="例如：深層清潔面部護理"
                    required
                  />
                </div>

                {/* 療程簡介 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    療程簡介
                  </label>
                  <Textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="簡單介紹療程內容..."
                    rows={3}
                  />
                </div>

                {/* 參考圖片 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    參考圖片 (URL)
                  </label>
                  <Input
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    type="url"
                  />
                </div>

                {/* 價錢 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      原價 (HKD) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      placeholder="例如：1280"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      優惠價 (HKD)
                    </label>
                    <Input
                      value={formPromoPrice}
                      onChange={(e) => setFormPromoPrice(e.target.value)}
                      placeholder="可選"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* 優惠有效期 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    優惠有效期
                  </label>
                  <Input
                    value={formPromoExpiry}
                    onChange={(e) => setFormPromoExpiry(e.target.value)}
                    type="date"
                  />
                </div>

                {/* 限量數量 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    限量數量
                  </label>
                  <Input
                    value={formLimitedQty}
                    onChange={(e) => setFormLimitedQty(e.target.value)}
                    placeholder="可選，例如：50"
                    type="number"
                    min="0"
                  />
                </div>

                {/* 適用美容院 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    適用美容院
                  </label>
                  {salons.length > 0 ? (
                    <Select value={formSalonId} onValueChange={setFormSalonId}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇美容院" />
                      </SelectTrigger>
                      <SelectContent>
                        {salons.map((salon) => (
                          <SelectItem key={salon.id} value={salon.id}>
                            {salon.salon_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-slate-400">
                      尚未有美容院資料，請先建立美容院
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1 rounded-full"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !formName || !formOriginalPrice}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                  >
                    {saving ? "儲存中..." : "確認新增"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Treatment List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : treatments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              尚未有療程
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              點擊「新增療程」開始建立您的療程項目
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增療程
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Collapsed Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {treatment.image_url ? (
                      <img
                        src={treatment.image_url}
                        alt={treatment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm truncate">
                      {treatment.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {treatment.promo_price ? (
                        <>
                          <span className="text-pink-600 font-bold text-sm">
                            HK${treatment.promo_price}
                          </span>
                          <span className="text-slate-400 line-through text-xs">
                            HK${treatment.original_price}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-700 font-bold text-sm">
                          HK${treatment.original_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleStatus(treatment)}
                    className="flex items-center gap-1.5"
                    title={
                      treatment.status === "active" ? "停用療程" : "啟用療程"
                    }
                  >
                    {treatment.status === "active" ? (
                      <ToggleRight className="w-7 h-7 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-300" />
                    )}
                    <Badge
                      variant={
                        treatment.status === "active" ? "default" : "secondary"
                      }
                      className={
                        treatment.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-100 text-xs"
                      }
                    >
                      {treatment.status === "active" ? "上架" : "下架"}
                    </Badge>
                  </button>

                  {/* Expand */}
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === treatment.id ? null : treatment.id
                      )
                    }
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {expandedId === treatment.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedId === treatment.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3 text-sm">
                    {treatment.description && (
                      <div>
                        <span className="text-slate-500 font-medium">
                          簡介：
                        </span>
                        <span className="text-slate-700">
                          {treatment.description}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">原價：</span>
                        <span className="text-slate-700">
                          HK${treatment.original_price}
                        </span>
                      </div>
                      {treatment.promo_price && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-pink-400" />
                          <span className="text-slate-500">優惠價：</span>
                          <span className="text-pink-600 font-semibold">
                            HK${treatment.promo_price}
                          </span>
                        </div>
                      )}
                      {treatment.promo_expiry && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">優惠有效期：</span>
                          <span className="text-slate-700">
                            {treatment.promo_expiry}
                          </span>
                        </div>
                      )}
                      {treatment.limited_quantity && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-500">限量：</span>
                          <span className="text-slate-700">
                            {treatment.limited_quantity} 個
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">
                        適用美容院：
                      </span>
                      <span className="text-slate-700">
                        {getSalonName(treatment.salon_profile_id)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
