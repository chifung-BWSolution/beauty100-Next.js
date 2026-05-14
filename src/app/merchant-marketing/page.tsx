"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Share2,
  Store,
  Package,
  Calendar,
  Users,
  Globe,
  TrendingUp,
  Zap,
  Instagram,
  Youtube,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchantCTABanner from "@/components/MerchantCTABanner";

export default function MerchantMarketingPage() {
  const [whatsappLink, setWhatsappLink] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  const faqs = [
    {
      q: "如何在Beauty100獲得曝光機會？",
      a: "商戶登入後選擇投放資源，平台將基於上百萬瀏覽量推薦您的店舖給香港及大灣區客戶。",
    },
    {
      q: "廣告投放涵蓋哪些平台？",
      a: "主要在Beauty100站內，支援 FB、IG、YTB、小紅書 等渠道，輻射亞洲客戶群，確保跨平台曝光。",
    },
    {
      q: "上傳產品/服務需時多久？",
      a: "上傳信息後經快速審核真實性即刻顯示，系統助您優化顯示，讓客戶直覽了解。",
    },
    {
      q: "客戶可以在平台直接預約嗎？",
      a: "支持開通此功能，客戶透過網站直接預約，實時發送至您的通訊工具，提升轉化效率。",
    },
    {
      q: "營銷費用如何？",
      a: "專人跟進專案，根據您的預算和效果預期給出營銷方案。",
    },
  ];

  const testimonials = [
    {
      title: "曝光率飆升",
      quote:
        "用 Beauty100 的門店推廣後，我的中環美容院流量從每日20人增至60人，尤其是大灣區客戶增加明顯，真的幫大忙。",
      name: "Micheal Pan",
      role: "Beauty Salon Manager",
    },
    {
      title: "營銷效率提升",
      quote:
        "產品推廣功能讓我針對激光療程投放 IG 廣告，轉化率從15%升到35%，數據報表還幫我調整了管理時間表。",
      name: "Chloe Lin",
      role: "Senior Beauty Manager",
    },
    {
      title: "業務擴張順利",
      quote:
        "透過活動行銷推出限時國際護理套餐，FB 曝光吸引了廣州客戶前來，業務從香港擴到大灣區，過程順暢無阻。",
      name: "Vivian Chen",
      role: "Beauty Store Director",
    },
    {
      title: "客戶互動加強",
      quote:
        "會員方案結合 KOL 推薦，讓忠實客戶每月回訪率升20%，預約系統還能即時給提反饋，管理起來超方便。",
      name: "Jessica Wang",
      role: "Beauty Center Supervisor",
    },
    {
      title: "品牌優勢強化",
      quote:
        "平台 YTB 廣告投放幫我宣傳新進口美容儀器，客戶詢量多50%，營格快速跟上亞洲國際美容競爭。",
      name: "Emily Zhang",
      role: "Head of Beauty Operations",
    },
    {
      title: "銷售業績增長",
      quote:
        "使用 Beauty100 營銷工具後，上個月銷售額從10萬港幣升到15萬，外地客戶增多，我們建議其他業主試用擴大亞洲市場。",
      name: "Beauty Retail Manager",
      role: "Wellness Center Director",
    },
  ];

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
            <a
              href="/merchant"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              主頁
            </a>
            <a
              href="/merchant-registration"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              商戶註冊
            </a>
            <a
              href="/merchant-marketing"
              className="text-pink-500 font-medium text-sm"
            >
              宣傳營銷
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              創業顧問
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              商務合作
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
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

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80"
          alt="Marketing"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <span className="inline-block bg-pink-500 text-white text-xs px-4 py-1 rounded-full mb-4">
            營銷宣傳
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            以數據支撐營銷 締造無限商機
          </h1>
          <p className="text-base md:text-lg text-white/80">
            連接百萬流量，加速您的美容業務崛起
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block border border-gray-200 text-gray-500 text-xs px-4 py-1 rounded-full mb-4">
              Who We Are
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">面對精準用戶</h2>
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              用營銷驅動生意
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Beauty100
              作為領先的美容業平台，為商戶提供全面營銷宣傳機會。幫助您面向香港、大灣區乃至亞洲客戶擴大影響力。
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              無論是新店推廣或既有業務優化，Beauty100
              均能助您提升品牌知名度，實現業務增長。
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-4xl font-bold">
                  2000<sup className="text-2xl">+</sup>
                </p>
                <p className="text-xs text-gray-500 mt-1">已登記商戶</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  35000<sup className="text-2xl">+</sup>
                </p>
                <p className="text-xs text-gray-500 mt-1">不重複訪客</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  10M<sup className="text-2xl">+</sup>
                </p>
                <p className="text-xs text-gray-500 mt-1">美容資訊</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  98<sup className="text-2xl">%</sup>
                </p>
                <p className="text-xs text-gray-500 mt-1">好評滿意度</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80"
              alt="Business Team"
              className="w-full h-[450px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* 月均百萬瀏覽 & 多渠道曝光 */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-gray-100 rounded-2xl p-8">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Eye className="w-5 h-5 text-gray-700" />
            </div>
            <h4 className="font-bold text-lg mb-3">月均百萬瀏覽</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              平台每月匯聚上百萬瀏覽量，讓您的店舖獲得優質曝光。我們不僅在網站內部優化推薦，還透過
              FB、IG、YTB、小紅書等渠道進行廣告投放，確保跨平台觸及目標受眾。
            </p>
          </div>
          <div className="border border-gray-100 rounded-2xl p-8">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Share2 className="w-5 h-5 text-gray-700" />
            </div>
            <h4 className="font-bold text-lg mb-3">多渠道曝光</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Beauty100
              讓商戶獲取流量、提升曝光、通過客戶查詢、實現銷售轉化及預訂功能，並連結商戶、網紅及消費者，提供高效推薦方式，如KOL合作、精準廣告及O2O生態整合。無論是新店推廣或既有業務優化，Beauty100
              均能助您提升品牌知名度，實現業務增長。
            </p>
          </div>
        </div>
      </section>

      {/* 8700萬 Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex items-center justify-center gap-8">
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-8 border-pink-200 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-pink-500">8700萬</p>
                    <p className="text-xs text-gray-500 mt-1">大灣區消費者</p>
                  </div>
                </div>
              </div>
              <div className="bg-pink-500 text-white rounded-2xl px-6 py-4 text-center">
                <p className="text-3xl font-bold">94%</p>
                <p className="text-xs mt-1">有效廣告</p>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Beauty100
                作為大灣區人口超過8700萬的美容資訊樞紐，為商戶提供跨區域展示機會，輻射香港、大灣區及亞洲客戶。平台每月上百萬瀏覽量，讓您的店舖成為資訊來源。我們在
                FB、IG、YTB
                等渠道投放廣告，助您連接觸大客戶群，避免地域限制，立即優化品牌互動，提升業務效率。
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-pink-500" />
                  <span>受眾廣大</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Globe className="w-4 h-4 text-pink-500" />
                  <span>大灣區合作</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span>百萬流量</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-4 gap-4 border-b border-gray-200 pb-6">
          {[
            {
              title: "商戶註冊",
              desc: "即時解鎖專屬優勢",
              href: "/merchant-registration",
            },
            {
              title: "宣傳營銷",
              desc: "提升品牌曝光效能",
              href: "/merchant-marketing",
              active: true,
            },
            { title: "創業顧問", desc: "專業開業策略指導", href: "#" },
            { title: "商務合作", desc: "探索多方合作機會", href: "#" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={`text-center cursor-pointer hover:bg-pink-50 rounded-lg p-4 transition-colors ${
                item.active ? "border-b-2 border-pink-500" : ""
              }`}
            >
              <h3
                className={`font-bold text-base mb-1 ${
                  item.active ? "text-pink-500" : ""
                }`}
              >
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Beauty100 營銷工具 */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Beauty100 營銷工具
          </h2>
          <p className="text-gray-500 text-sm">
            站內高效營銷工具，提升營業額更有效
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <Store className="w-6 h-6 text-pink-500" />,
              title: "門店推廣",
              desc: "建立專屬店舖頁面及資訊系列，針對香港及大灣區客戶投放，系統自動優化，提升區域知名度。",
              img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
            },
            {
              icon: <Package className="w-6 h-6 text-pink-500" />,
              title: "產品推廣",
              desc: "上傳產品詳情及圖片，透過 IG、FB 渠道精準投放，助您吸引亞洲消費者，監測點擊率轉化。",
              img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
            },
            {
              icon: <Calendar className="w-6 h-6 text-pink-500" />,
              title: "活動行銷",
              desc: "設計並推送各季節美容活動，利用 YTB 先體驗推廣光，結合於部優惠或合作事件，增加互動參與。",
              img: null,
            },
            {
              icon: <Users className="w-6 h-6 text-pink-500" />,
              title: "會員方案",
              desc: "制定忠誠計劃並針對目標群組派，結合 KOL 推薦，挽留客戶回訪，分析會員數據優化。",
              img: null,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="p-6 flex-1">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
              {item.img && (
                <div className="w-full md:w-[200px] h-[160px] md:h-auto flex-shrink-0">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 馬上開始為店鋪做推廣 */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              馬上開始為店鋪做推廣
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-6">
              讓您的店鋪更容易被看見
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              您可在門店主頁上傳產品及服務資訊，讓客戶直觀了解細節，並透過網站直接預約下單。此功能提升客戶體驗，追蹤訂單記錄，優化營銷流程並提高轉化率，適用於所有商戶面向香港、大灣區及亞洲客戶的宣傳。
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "多渠道廣告投放",
                "精準目標營銷",
                "KOL 合作曝光",
                "活動推廣工具",
                "數據分析優化",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="bg-pink-50 text-pink-600 border border-pink-200 px-4 py-2 rounded-full text-xs font-medium"
                >
                  • {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80"
              alt="推廣服務"
              className="w-full h-[350px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* 合作商戶評價 */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">合作商戶評價</h2>
          <p className="text-gray-500 text-sm">市場擴張加速</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <h4 className="font-bold text-base mb-3">{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">
                    {item.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">常見問題解答</h2>
            <p className="text-gray-500 text-sm">
              以下為註冊相關常見疑問及解答，助您順利加入平台
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <h4 className="font-bold text-sm">{faq.q}</h4>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <MerchantCTABanner
        ctaHref="/merchant-registration"
        ctaLabel="立即體驗"
      />

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
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-1">
                    廣告熱線
                  </p>
                  <p>
                    Whatsapp{" "}
                    <a
                      href="https://wa.me/85268589265"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-400 transition-colors"
                    >
                      +852 6858 9265
                    </a>
                  </p>
                  <p>
                    <a
                      href="mailto:media@beauty100-magazine.com"
                      className="hover:text-pink-400 transition-colors whitespace-nowrap"
                    >
                      media@beauty100-magazine.com
                    </a>
                  </p>
                </div>
                <div className="whitespace-nowrap">
                  <p className="font-semibold text-white text-xs uppercase tracking-wider mb-1">
                    意見及查詢
                  </p>
                  <p>
                    Hotline{" "}
                    <a
                      href="tel:+85221857377"
                      className="hover:text-pink-400 transition-colors"
                    >
                      +852 2185 7377
                    </a>
                  </p>
                  <p>
                    Whatsapp{" "}
                    <a
                      href="https://wa.me/85268589265"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-pink-400 transition-colors"
                    >
                      +852 6858 9265
                    </a>
                  </p>
                  <p>
                    <a
                      href="mailto:info@beauty100-magazine.com"
                      className="hover:text-pink-400 transition-colors whitespace-nowrap"
                    >
                      info@beauty100-magazine.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://www.instagram.com/beauty100.magazine/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-pink-500/30 flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@beauty100magazine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-pink-500/30 flex items-center justify-center text-gray-400 hover:text-pink-400 transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
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
