"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import NoIndexMeta from "@/components/NoIndexMeta";
import RichTextEditor from "@/components/salon/RichTextEditor";
import {
  Sparkles,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Upload,
  GripVertical,
  Image as ImageIcon,
  DollarSign,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Treatment {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  images?: string[] | null;
  original_price: number;
  promo_price?: number | null;
  promo_expiry?: string | null;
  purchase_start_date?: string | null;
  purchase_end_date?: string | null;
  redeem_start_date?: string | null;
  redeem_end_date?: string | null;
  limited_quantity?: number | null;
  limit_one_per_customer?: boolean;
  salon_profile_id?: string | null;
  salon_profile_ids?: string[] | null;
  terms?: string | null;
  status: string;
  created_at: string;
}

interface Salon {
  id: string;
  salon_name: string;
}

export default function MyTreatmentsPage() {
  const router = useRouter();
  const { user, isLoadingAuth } = useAuth();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasApprovedProfile, setHasApprovedProfile] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formPromoPrice, setFormPromoPrice] = useState("");
  const [formPurchaseStartDate, setFormPurchaseStartDate] = useState("");
  const [formPurchaseEndDate, setFormPurchaseEndDate] = useState("");
  const [formRedeemStartDate, setFormRedeemStartDate] = useState("");
  const [formRedeemEndDate, setFormRedeemEndDate] = useState("");
  const [formLimitedQty, setFormLimitedQty] = useState("");
  const [formLimitOnePerCustomer, setFormLimitOnePerCustomer] = useState(false);
  const [formSalonIds, setFormSalonIds] = useState<string[]>([]);
  const [formTerms, setFormTerms] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fixedTerms, setFixedTerms] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
      // Check approved profile
      const { data: profiles } = await supabase
        .from("salon_profiles")
        .select("id, salon_name")
        .eq("created_by", user.id);

      if (profiles && profiles.length > 0) {
        // Check if any are approved
        const { data: approvedProfiles } = await supabase
          .from("salon_profiles")
          .select("id")
          .eq("created_by", user.id)
          .eq("status", "approved")
          .limit(1);

        if (approvedProfiles && approvedProfiles.length > 0) {
          setHasApprovedProfile(true);
        }
        setSalons(profiles);
      }

      // Fetch treatments
      const { data: treatmentData } = await supabase
        .from("treatments")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (treatmentData) {
        setTreatments(treatmentData);
      }

      // Fetch fixed terms from system settings
      const { data: settings } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "treatment_fixed_terms")
        .single();

      if (settings?.value) {
        setFixedTerms(settings.value);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `treatments/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, { upsert: false, contentType: file.type });
      
      if (!error) {
        newImages.push(`${supabaseUrl}/storage/v1/object/public/uploads/${fileName}`);
      }
    }
    
    setFormImages(prev => [...prev, ...newImages]);
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFormImages(prev => {
      const newImages = [...prev];
      const [dragged] = newImages.splice(dragIndex, 1);
      newImages.splice(index, 0, dragged);
      return newImages;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formName || !formOriginalPrice || !formPurchaseStartDate || !formPurchaseEndDate || !formRedeemStartDate || !formRedeemEndDate || !formDesc) return;
    setSaving(true);

    const payload = {
      created_by: user.id,
      name: formName,
      description: formDesc || null,
      image_url: formImages.length > 0 ? formImages[0] : null,
      images: formImages.length > 0 ? formImages : null,
      original_price: parseFloat(formOriginalPrice),
      promo_price: formPromoPrice ? parseFloat(formPromoPrice) : null,
      promo_expiry: formPurchaseEndDate || null,
      purchase_start_date: formPurchaseStartDate || null,
      purchase_end_date: formPurchaseEndDate || null,
      redeem_start_date: formRedeemStartDate || null,
      redeem_end_date: formRedeemEndDate || null,
      limited_quantity: formLimitedQty ? parseInt(formLimitedQty) : null,
      limit_one_per_customer: formLimitOnePerCustomer,
      salon_profile_id: formSalonIds.length > 0 ? formSalonIds[0] : null,
      salon_profile_ids: formSalonIds.length > 0 ? formSalonIds : null,
      terms: formTerms || null,
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
    setFormImages([]);
    setFormOriginalPrice("");
    setFormPromoPrice("");
    setFormPurchaseStartDate("");
    setFormPurchaseEndDate("");
    setFormRedeemStartDate("");
    setFormRedeemEndDate("");
    setFormLimitedQty("");
    setFormLimitOnePerCustomer(false);
    setFormSalonIds([]);
    setFormTerms("");
  };

  const openEditForm = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setFormName(treatment.name);
    setFormDesc(treatment.description || "");
    setFormImages(treatment.images || (treatment.image_url ? [treatment.image_url] : []));
    setFormOriginalPrice(String(treatment.original_price));
    setFormPromoPrice(treatment.promo_price ? String(treatment.promo_price) : "");
    setFormPurchaseStartDate(treatment.purchase_start_date || "");
    setFormPurchaseEndDate(treatment.purchase_end_date || "");
    setFormRedeemStartDate(treatment.redeem_start_date || "");
    setFormRedeemEndDate(treatment.redeem_end_date || "");
    setFormLimitedQty(treatment.limited_quantity ? String(treatment.limited_quantity) : "");
    setFormLimitOnePerCustomer(treatment.limit_one_per_customer || false);
    setFormSalonIds(treatment.salon_profile_ids || (treatment.salon_profile_id ? [treatment.salon_profile_id] : []));
    setFormTerms(treatment.terms || "");
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingTreatment || !formName || !formOriginalPrice || !formPurchaseStartDate || !formPurchaseEndDate || !formRedeemStartDate || !formRedeemEndDate || !formDesc) return;
    setSaving(true);

    const payload = {
      name: formName,
      description: formDesc || null,
      image_url: formImages.length > 0 ? formImages[0] : null,
      images: formImages.length > 0 ? formImages : null,
      original_price: parseFloat(formOriginalPrice),
      promo_price: formPromoPrice ? parseFloat(formPromoPrice) : null,
      promo_expiry: formPurchaseEndDate || null,
      purchase_start_date: formPurchaseStartDate || null,
      purchase_end_date: formPurchaseEndDate || null,
      redeem_start_date: formRedeemStartDate || null,
      redeem_end_date: formRedeemEndDate || null,
      limited_quantity: formLimitedQty ? parseInt(formLimitedQty) : null,
      limit_one_per_customer: formLimitOnePerCustomer,
      salon_profile_id: formSalonIds.length > 0 ? formSalonIds[0] : null,
      salon_profile_ids: formSalonIds.length > 0 ? formSalonIds : null,
      terms: formTerms || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("treatments")
      .update(payload)
      .eq("id", editingTreatment.id)
      .select()
      .single();

    if (!error && data) {
      setTreatments((prev) =>
        prev.map((t) => (t.id === editingTreatment.id ? data : t))
      );
      resetForm();
      setEditingTreatment(null);
      setShowForm(false);
    }
    setSaving(false);
  };

  const toggleStatus = async (treatment: Treatment) => {
    const newStatus = treatment.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("treatments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", treatment.id);

    if (!error) {
      setTreatments((prev) =>
        prev.map((t) => (t.id === treatment.id ? { ...t, status: newStatus } : t))
      );
    }
  };

  const getSalonNames = (treatment: Treatment) => {
    const ids = treatment.salon_profile_ids;
    if (ids && ids.length > 0) {
      return ids.map((id) => {
        const salon = salons.find((s) => s.id === id);
        return salon?.salon_name || "未知美容院";
      }).join("、");
    }
    if (treatment.salon_profile_id) {
      const salon = salons.find((s) => s.id === treatment.salon_profile_id);
      return salon?.salon_name || "未知美容院";
    }
    return "未指定";
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
      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto">

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
              onClick={() => { setEditingTreatment(null); resetForm(); setShowForm(true); }}
              className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-5"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增療程
            </Button>
          </div>

          {/* Add/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                    setEditingTreatment(null);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-6">
                  {editingTreatment ? "編輯療程" : "新增療程"}
                </h2>
                <form onSubmit={editingTreatment ? handleUpdate : handleSubmit} className="space-y-4">
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
                      療程簡介 <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={formDesc}
                      onChange={setFormDesc}
                      placeholder="簡單介紹療程內容..."
                    />
                  </div>

                  {/* 參考圖片 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      參考圖片
                    </label>
                    <div className="space-y-3">
                      {formImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {formImages.map((img, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={() => handleDragStart(idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={() => handleDrop(idx)}
                              onDragEnd={handleDragEnd}
                              className={`relative group rounded-lg overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${
                                dragOverIndex === idx
                                  ? "border-pink-400 ring-2 ring-pink-200"
                                  : dragIndex === idx
                                  ? "opacity-50 border-slate-300"
                                  : "border-slate-200"
                              }`}
                            >
                              <div className="absolute top-1 left-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs z-10">
                                {idx + 1}
                              </div>
                              <div className="absolute top-1 left-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-4 h-4 text-white drop-shadow" />
                              </div>
                              <img src={img} alt="" className="w-full h-24 object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {formImages.length > 1 && (
                        <p className="text-xs text-slate-400">拖拽圖片可重新排序，順序會儲存到資料庫</p>
                      )}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/30 transition-colors"
                      >
                        {uploadingImage ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                            <span className="text-sm text-slate-500">上傳中...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-500">點擊上傳圖片（可多選）</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
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
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* 購買日期 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      購買日期 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">開始日期</label>
                        <Input
                          value={formPurchaseStartDate}
                          onChange={(e) => {
                            setFormPurchaseStartDate(e.target.value);
                            if (formRedeemStartDate && e.target.value && formRedeemStartDate < e.target.value) {
                              setFormRedeemStartDate(e.target.value);
                            }
                          }}
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">結束日期</label>
                        <Input
                          value={formPurchaseEndDate}
                          onChange={(e) => setFormPurchaseEndDate(e.target.value)}
                          type="date"
                          min={formPurchaseStartDate || undefined}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 兌換日期 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      兌換日期 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">開始日期</label>
                        <Input
                          value={formRedeemStartDate}
                          onChange={(e) => setFormRedeemStartDate(e.target.value)}
                          type="date"
                          min={formPurchaseStartDate || undefined}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">結束日期</label>
                        <Input
                          value={formRedeemEndDate}
                          onChange={(e) => setFormRedeemEndDate(e.target.value)}
                          type="date"
                          min={formRedeemStartDate || undefined}
                          required
                        />
                      </div>
                    </div>
                    {formRedeemStartDate && formPurchaseStartDate && formRedeemStartDate < formPurchaseStartDate && (
                      <p className="text-xs text-red-500 mt-1">兌換開始日期不可早於購買開始日期</p>
                    )}
                  </div>

                  {/* 限量數量 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      限購數量
                    </label>
                    <Input
                      value={formLimitedQty}
                      onChange={(e) => setFormLimitedQty(e.target.value)}
                      placeholder="例如：50"
                      type="number"
                      min="0"
                    />
                  </div>

                  {/* 每位客戶限購一次 */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="limitOnePerCustomer"
                      checked={formLimitOnePerCustomer}
                      onChange={(e) => setFormLimitOnePerCustomer(e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-slate-300 rounded focus:ring-pink-500"
                    />
                    <label htmlFor="limitOnePerCustomer" className="text-sm font-medium text-slate-700">
                      每位客戶限購一次
                    </label>
                  </div>

                  {/* 固定條款 + 條款及細則 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      條款及細則
                    </label>
                    {fixedTerms && (
                      <div className="mb-3">
                        <div className="bg-amber-50/60 rounded-lg p-3 border border-amber-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">🔒 固定條款（不可修改）</span>
                          </div>
                          <div className="text-sm text-slate-600 whitespace-pre-line">
                            {fixedTerms.split('\n').map((line: string, i: number) => (
                              <p key={i} className="mb-0.5">
                                {line.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
                                  const labels: Record<string, string> = {
                                    redeem_end_date: '兌換截止日期',
                                    redeem_start_date: '兌換開始日期',
                                    purchase_end_date: '購買截止日期',
                                    purchase_start_date: '購買開始日期',
                                    treatment_name: '療程名稱',
                                    salon_name: '美容院名稱',
                                  };
                                  return `【${labels[key] || key}】`;
                                })}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      額外條款（可選，會顯示在固定條款之後）
                    </label>
                    <RichTextEditor
                      value={formTerms}
                      onChange={setFormTerms}
                      placeholder="輸入額外條款及細則..."
                    />
                  </div>

                  {/* 適用美容院 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      適用美容院（可多選）
                    </label>
                    {salons.length > 0 ? (
                      <div className="border border-slate-200 rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {salons.map((salon) => (
                          <label
                            key={salon.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formSalonIds.includes(salon.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormSalonIds((prev) => [...prev, salon.id]);
                                } else {
                                  setFormSalonIds((prev) =>
                                    prev.filter((id) => id !== salon.id)
                                  );
                                }
                              }}
                              className="rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                            />
                            <span className="text-sm text-slate-700">
                              {salon.salon_name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        尚未有美容院資料，請先建立美容院
                      </p>
                    )}
                    {formSalonIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formSalonIds.map((id) => {
                          const salon = salons.find((s) => s.id === id);
                          return (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {salon?.salon_name || id}
                              <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() =>
                                  setFormSalonIds((prev) =>
                                    prev.filter((sid) => sid !== id)
                                  )
                                }
                              />
                            </Badge>
                          );
                        })}
                      </div>
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
                        setEditingTreatment(null);
                      }}
                      className="flex-1 rounded-full"
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving || !formName || !formOriginalPrice || !formPurchaseStartDate || !formPurchaseEndDate || !formRedeemStartDate || !formRedeemEndDate || !formDesc}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                    >
                      {saving ? "儲存中..." : editingTreatment ? "確認修改" : "確認新增"}
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
                onClick={() => { setEditingTreatment(null); resetForm(); setShowForm(true); }}
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

                    {/* Edit */}
                    <button
                      onClick={() => openEditForm(treatment)}
                      className="text-slate-400 hover:text-pink-500 transition-colors"
                      title="編輯療程"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
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
                    <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4 text-sm">
                      {/* Description */}
                      {treatment.description && (
                        <div>
                          <span className="text-slate-500 font-medium">
                            簡介：
                          </span>
                          <div
                            className="text-slate-700 mt-1 prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded"
                            dangerouslySetInnerHTML={{ __html: treatment.description }}
                          />
                        </div>
                      )}

                      {/* Images */}
                      {treatment.images && treatment.images.length > 0 && (
                        <div>
                          <span className="text-slate-500 font-medium">圖片：</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {treatment.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${treatment.name} ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prices */}
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
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3">
                        {treatment.purchase_start_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-500">購買開始日期：</span>
                            <span className="text-slate-700">
                              {treatment.purchase_start_date}
                            </span>
                          </div>
                        )}
                        {treatment.purchase_end_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-500">購買截止日期：</span>
                            <span className="text-slate-700">
                              {treatment.purchase_end_date}
                            </span>
                          </div>
                        )}
                        {treatment.redeem_start_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-400" />
                            <span className="text-slate-500">兌換開始日期：</span>
                            <span className="text-slate-700">
                              {treatment.redeem_start_date}
                            </span>
                          </div>
                        )}
                        {treatment.redeem_end_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-400" />
                            <span className="text-slate-500">兌換截止日期：</span>
                            <span className="text-slate-700">
                              {treatment.redeem_end_date}
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
                        {treatment.limit_one_per_customer && (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-700 font-medium">每位客戶限購一次</span>
                          </div>
                        )}
                      </div>

                      {/* Salon */}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">
                          適用美容院：
                        </span>
                        <span className="text-slate-700">
                          {getSalonNames(treatment)}
                        </span>
                      </div>

                      {/* Terms */}
                      {(fixedTerms || treatment.terms) && (
                        <div>
                          <span className="text-slate-500 font-medium">
                            條款及細則：
                          </span>
                          {fixedTerms && (
                            <div className="bg-amber-50/60 rounded-lg p-2 border border-amber-100 mt-1 mb-1">
                              <span className="text-xs font-semibold text-amber-700">🔒 固定條款</span>
                              <div className="text-slate-600 text-sm whitespace-pre-line mt-1">
                                {fixedTerms.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
                                  const valueMap: Record<string, string | null | undefined> = {
                                    redeem_end_date: treatment.redeem_end_date,
                                    redeem_start_date: treatment.redeem_start_date,
                                    purchase_end_date: treatment.purchase_end_date,
                                    purchase_start_date: treatment.purchase_start_date,
                                    treatment_name: treatment.name,
                                    salon_name: getSalonNames(treatment),
                                  };
                                  const val = valueMap[key];
                                  if (val && (key.includes('date'))) {
                                    return new Date(val).toLocaleDateString('zh-HK');
                                  }
                                  return val || '（未設定）';
                                })}
                              </div>
                            </div>
                          )}
                          {treatment.terms && (
                            <div
                              className="text-slate-600 mt-1 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: treatment.terms }}
                            />
                          )}
                        </div>
                      )}
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
