"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle,
  FileText,
  ShieldCheck,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Store,
  ClipboardList,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchantCTABanner from "@/components/MerchantCTABanner";

export default function MerchantRegistrationPage() {
  const [whatsappLink, setWhatsappLink] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchWhatsApp = async () => {
      try {
        const { data } = await supabase
          .from("whatsapp_settings")
          .select("phone_number")
          .limit(1)
          .single();
        if (data?.phone_number) {
          const phone = data.phone_number.replace(/\D/g, "");
          setWhatsappLink(`https://wa.me/${phone}`);
        }
      } catch (e) {}
    };
    fetchWhatsApp();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-white text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center">
            <img
              src="/images/beauty-100_logo.png"
              alt="Beauty 100 Magazine"
              className="h-[30px] w-auto object-contain"
            />
          </a>
          <div className="flex items-center gap-12">
            <a href="/merchant" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              主頁
            </a>
            <a href="/merchant-registration" className="text-pink-500 font-medium text-sm">
              商戶註冊
            </a>
            <a href="#" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              宣傳營銷
            </a>
            <a href="#" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              創業顧問
            </a>
            <a href="#" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              商務合作
            </a>
            <a href="#" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              聯絡我們
            </a>
          </div>
          <a
            href="/login"
            className="bg-pink-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            商戶登入
          </a>
        </div>
      </nav>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-pink-100 to-purple-100 py-4 text-center">
        <p className="text-pink-500 font-bold text-lg">
          推廣期間限時免商戶註冊費，享專屬宣傳優惠
        </p>
      </section>

      {/* Hero Section - 加入 Beauty100 生態 */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-400 text-sm mb-4">● beauty100-magazine.com</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          加入 Beauty100 生態，用流量驅動生意
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Beauty100 已匯聚全香港超過 3000 家美容院數據，為您提供便捷的註冊途徑。
        </p>
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          無論您是計劃新開美容院、認領平台現有店鋪資訊，還是上架全新店鋪，我們的註冊流程均能滿足您的需求。
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          註冊後，您可輕鬆管理店鋪資料，提升曝光率，並連接龐大用戶群，助力業務成長。
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          平台支援多種商家場景，包括新店開業資訊錄入與宣傳、認領既有店鋪，或新增未錄入店鋪。
        </p>
      </section>

      {/* 3 Feature Cards with Images */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="relative rounded-2xl overflow-hidden h-[320px] group">
            <img
              src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80"
              alt="商戶登記"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <Sparkles className="w-6 h-6 mb-2 text-pink-300" />
              <h3 className="font-bold text-base">商戶登記 快速註冊</h3>
              <p className="text-sm text-white/80">立即開通Beauty100平台功能</p>
            </div>
          </div>

          {/* Card 2 - with stat */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center h-[150px]">
              <ClipboardList className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-4xl font-bold text-gray-800">85%</p>
              <p className="text-sm text-gray-500 text-center mt-1">超過85%註冊商戶</p>
              <p className="text-sm text-gray-500 text-center">獲得訂單查詢</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[150px]">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"
                alt="完善店鋪"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <CheckCircle className="w-5 h-5 mb-1 text-pink-300" />
                <h3 className="font-bold text-sm">登記完善店鋪信息</h3>
                <p className="text-xs text-white/80">已有門店信息認領</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-2xl overflow-hidden h-[320px] group">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80"
              alt="錄入門店"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <ShoppingBag className="w-6 h-6 mb-2 text-pink-300" />
              <h3 className="font-bold text-base">錄入門店/產品信息</h3>
              <p className="text-sm text-white/80">連結電郵立即查詢</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4步快速註冊 */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">4步快速註冊</h2>
        <p className="text-center text-gray-500 text-sm mb-2">
          Beauty100 商戶註冊設計簡便高效，
        </p>
        <p className="text-center text-gray-500 text-sm mb-2">
          只需基本資訊（如商戶名稱、電子郵件及聯絡電話）即可完成。
        </p>
        <p className="text-center text-gray-500 text-sm mb-12">
          整個步驟數分鐘內搞定。請按步驟準備資料：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-bold text-base mb-2">電子郵件及設定密碼</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              輸入有效電子郵件地址並設定安全密碼，以建立帳戶基礎。
            </p>
          </div>

          {/* Image card */}
          <div className="rounded-2xl overflow-hidden h-[250px]">
            <img
              src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80"
              alt="美容院"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-bold text-base mb-2">認領/新建店鋪資料</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              選擇認領平台既有3000家店鋪數據庫中的資訊，或新建全新店鋪，輸入地址、服務項目及聯絡方式。
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-bold text-base mb-2">上傳商戶登記證</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              提供商戶登記證明文件上傳，以驗證業務合法性。
            </p>
          </div>

          {/* Middle image */}
          <div className="rounded-2xl overflow-hidden h-[250px]">
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80"
              alt="美容服務"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-bold text-base mb-2">人工審核上架</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              提交後由專業團隊人工審核，確保資料準確無誤。通常在24小時內完成上架。
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - 3000+ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-800">3000+</p>
                <p className="text-sm text-gray-500 mt-1">已收錄店鋪信息</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-800">98%</p>
                <p className="text-sm text-gray-500 mt-1">信息準確率</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                若您的美容院已在 Beauty100 的 3000 家香港店鋪數據庫中，您可透過認領功能驗證所有權，接管並更新店鋪細節（如服務項目、地址及聯絡方式）。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                此適合平台已有您店資訊的商家，避免重複建立，立即優化曝光及客戶互動，提升業務效率。
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">真實信息</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">合作聯繫</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">曝光優化</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 立即獲客 Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">立即獲客</h2>
            <h3 className="text-xl font-bold mb-6">讓你的店鋪更容易被看見</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              您可輕鬆設置電子郵件表單（Email Form）收集客戶查詢及預約的需求，並整合 WhatsApp 功能，直接連接客戶進行即時預約及諮詢。此工具提升回應速度、追蹤互動記錄，優化服務流程並提高轉化率，適用於所有註冊商家場景。
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "24小時自動預約。",
                "精準客戶來源。",
                "網紅KOL推廣。",
                "店鋪信息持續更新。",
                "商業優化建議。",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&q=80"
              alt="美容專業"
              className="w-full h-[400px] object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* 合作商戶評價 */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">合作商戶評價</h2>
          <p className="text-center text-gray-500 text-sm mb-2">
            Beauty100 平台已收到眾多正面反饋，我們致力於持續優化服務，提供更好的體驗給每位商戶。
          </p>
          <p className="text-center text-gray-500 text-sm mb-12">
            您的意見至關重要，讓我們共同打造更卓越的美容業生態。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "流量增長驚喜",
                quote: "Beauty100 平台可以一鍵輕鬆認領店鋪，推廣後門店瀏覽約增長30%。KOL 合作機會豐富，強烈推薦新開業者。",
                name: "Alice Wong",
                role: "Beauty Salon Owner",
              },
              {
                title: "運營優化高效",
                quote: "後台數據分析助我優化管理，客戶預約的轉化率提升。同時在平台上可以看到客戶的真實評價，有了明確的服務優化方向。不僅有香港客戶，還有大灣區的客戶組來查詢。",
                name: "Yvonne Li",
                role: "Aesthetic Clinic Manager",
              },
              {
                title: "業務擴張順利",
                quote: "透過 Beauty100 連接大灣區市場，曝光率翻倍，免費推廣期間為我多位網紅紅店，業務穩健盈利。",
                name: "Catherine Ng",
                role: "Spa Entrepreneur",
              },
              {
                title: "互動即時便捷",
                quote: "認領功能簡單高效，可以整合EMAIL Form同WhatsApp 讓客戶互動更即時，值得每位商戶加入。線上服的管理真係好方便。",
                name: "Mirana Chan",
                role: "Cosmetics Retailer",
              },
              {
                title: "競爭優勢提升",
                quote: "平台提供全球獨競資訊，助我更新服務項目，註冊免費且審核迅速，競爭優勢明顯提升。",
                name: "Emily Tan",
                role: "Beauty Consultant",
              },
              {
                title: "銷售額上升明顯",
                quote: "一直煩心線上宣傳流量，自註冊Beauty100更新門店信息後，合作後銷售額上升20%。強烈建議美容業主利用此生態系統。",
                name: "Doris Yang",
                role: "Wellness Center Director",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <h4 className="font-bold text-base mb-3">{testimonial.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-200" />
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 常見問題解答 */}
      <section className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">常見問題解答</h2>
        <p className="text-center text-gray-500 text-sm mb-12">
          以下為註冊相關常見疑問及解答，助您順利加入平台
        </p>

        <div className="space-y-4">
          {[
            {
              question: "如何認領既有店鋪？",
              answer: "1.註冊後選擇認領選項，上傳登記證驗證所有權，審核通過即可管理並更新資料。",
            },
            {
              question: "新建店鋪需要哪些資料？",
              answer: "提供店名、地址、服務項目、營業時間及聯絡方式，系統將助您即時上架並推薦曝光。",
            },
            {
              question: "註冊費用如何？",
              answer: "推廣期內免費註冊、認證及登記，至6月30日止，後續公佈將說明收費細節。",
            },
            {
              question: "審核需時多久？",
              answer: "人工審核通常在24小時內完成，確保資料準確後即上架，讓您快速參與推廣。",
            },
            {
              question: "如何整合 WhatsApp？",
              answer: "註冊後在設置區啟用 WhatsApp 連接，直接接收客戶預約，提升互動效率及轉化率。",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-bold text-base">{faq.question}</h4>
                <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center flex-shrink-0">
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <MerchantCTABanner />

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-white py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between gap-8">
            {/* Logo & Contact */}
            <div className="max-w-[480px] flex-shrink-0">
              <a href="/">
                <img
                  src="/images/beauty-100_logo.png"
                  alt="Beauty 100 Magazine"
                  className="h-[30px] w-auto object-contain brightness-0 invert mb-4"
                />
              </a>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                香港最全面的美容資訊平台，為你搜羅全港優質美容院及最新美容資訊。
              </p>

              <div className="grid grid-cols-2 gap-6 text-sm text-gray-400">
                <div className="whitespace-nowrap">
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-1">廣告熱線</p>
                  <p>
                    Whatsapp{" "}
                    <a href="https://wa.me/85268589265" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                      +852 6858 9265
                    </a>
                  </p>
                  <p>
                    <a href="mailto:media@beauty100-magazine.com" className="hover:text-pink-400 transition-colors whitespace-nowrap">
                      media@beauty100-magazine.com
                    </a>
                  </p>
                </div>
                <div className="whitespace-nowrap">
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-1">意見及查詢</p>
                  <p>
                    Hotline{" "}
                    <a href="tel:+85221857377" className="hover:text-pink-400 transition-colors">
                      +852 2185 7377
                    </a>
                  </p>
                  <p>
                    Whatsapp{" "}
                    <a href="https://wa.me/85268589265" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                      +852 6858 9265
                    </a>
                  </p>
                  <p>
                    <a href="mailto:info@beauty100-magazine.com" className="hover:text-pink-400 transition-colors whitespace-nowrap">
                      info@beauty100-magazine.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* 美容院創業 */}
            <div>
              <h4 className="font-bold text-sm mb-4">美容院創業</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>品牌服務</li>
                <li>設計服務</li>
                <li>網站設計</li>
                <li>美容院系統</li>
                <li>商業設計</li>
                <li>室內裝修</li>
              </ul>
            </div>

            {/* 運營推廣 */}
            <div>
              <h4 className="font-bold text-sm mb-4">運營推廣</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>KOL探店</li>
                <li>產品推廣</li>
                <li>商務合作</li>
                <li>品牌聯名</li>
                <li>產品共創</li>
                <li>代言人合作</li>
              </ul>
            </div>

            {/* 商業資訊 */}
            <div>
              <h4 className="font-bold text-sm mb-4">商業資訊</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>美容儀器</li>
                <li>美容師招聘</li>
                <li>院線產品</li>
                <li>美容展覽</li>
                <li>美容沙龍</li>
                <li>公關活動</li>
              </ul>
            </div>

            {/* 更多 */}
            <div>
              <h4 className="font-bold text-sm mb-4">更多</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>聯絡我們</li>
                <li>成功案例</li>
                <li>Q&A</li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-center gap-3">
            <p className="text-sm text-gray-500">
              All rights reserved – Beauty100 | Hotline: (+852) 2185 7377
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
