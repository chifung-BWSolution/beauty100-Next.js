"use client";

import { useState, useEffect } from "react";
import {
  Handshake,
  Users,
  BarChart3,
  Globe,
  ChevronDown,
  ChevronUp,
  Instagram,
  Youtube,
  Star,
  Package,
  Megaphone,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchantCTABanner from "@/components/MerchantCTABanner";

export default function MerchantCooperationPage() {
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
      q: "如何連結供應商？",
      a: "提交需求後，平台基於您的店鋪類型推薦匹配夥伴，通常一周內提供比較清單。",
    },
    {
      q: "網紅合作需準備什麼？",
      a: "提供品牌資訊，系統將匹配香港及大灣區KOL，確保推廣精準。",
    },
    {
      q: "消費者互動如何啟動？",
      a: "設計聯盟計劃，平台助您整合event及會員共享，提升參與度。",
    },
    {
      q: "平台聯盟費用如何？",
      a: "後續依規模公告細節，涵蓋戰略合作。",
    },
    {
      q: "合作數據如何監測？",
      a: "系統提供進度追蹤及效果分析，助您優化商業方案。",
    },
  ];

  const services = [
    {
      title: "供應商連結",
      desc: "配對上游美容儀器及產品供應商，包含價格比較同合約協助。助您優化採購，提升成本效率。",
      icon: Package,
    },
    {
      title: "創業支持",
      desc: "資深商業團隊從0到1全程支援，強大供應鏈提升商業價值。",
      icon: Building2,
    },
    {
      title: "網紅合作",
      desc: "連結香港及大灣區KOL資源，提供推廣配對同活動策劃。確保曝光精準，監測合作效果。",
      icon: Star,
    },
    {
      title: "商業資源",
      desc: "提供跨平台，跨地區商業資源對接服務，另有品牌合作、品牌聯名、商戶加盟等多方合作。",
      icon: Globe,
    },
  ];

  const tags = [
    "美容院設計。",
    "美妝零售店鋪設計。",
    "KOL 合作曝光。",
    "美容儀器供應商。",
    "美容管理系統。",
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
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              宣傳營銷
            </a>
            <a
              href="/merchant-consulting"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              創業顧問
            </a>
            <a
              href="/merchant-cooperation"
              className="text-pink-500 font-medium text-sm"
            >
              商務合作
            </a>
            <a
              href="/merchant-contact"
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
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=80"
          alt="Business Cooperation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-pink-500 text-white text-xs px-4 py-1.5 rounded-full mb-4">
            商務合作
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            美業全鏈路商務合作
          </h1>
          <p className="text-sm text-white/80">
            上下遊供應商一應俱全 快速匹配商貿資源
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              連接美業資源，開啟合作新篇章
            </h2>
            <div className="text-gray-600 text-sm leading-relaxed space-y-3">
              <p>
                Beauty100 作為專業平台，鏈接商戶、消費者、網紅資源以及上游供應商，為您提供多種商務合作機會。面向香港、大灣區乃至亞洲市場擴大網絡。
              </p>
              <p>
                平台助您接觸配合適夥伴，涵蓋供應鏈整合、網紅聯盟同消費者互動。透過數據匹配同推薦系統，確保合作高效可靠。無論尋求供應商或網紅推廣，Beauty100 均能助您降低搜尋成本，實現互惠發展。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-xs border border-gray-300 rounded-full px-4 py-2 text-gray-600"
                >
                  • {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80"
              alt="Business Link"
              className="w-full h-[400px] object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-gray-100 py-6">
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          <p className="text-pink-500 font-bold text-lg">
            推廣期間限時免商戶註冊費，立刻鏈接商務資源
          </p>
        </div>
      </section>

      {/* Platform Description */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs text-gray-400 mb-6">● beauty100-magazine.com</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          香港及大灣區美業聯盟合作平台
        </h2>
        <div className="text-gray-600 text-sm leading-relaxed space-y-2">
          <p>
            Beauty100 為商戶開放品牌、網紅、供應商連結，並對新開美容院/美容零售店鋪提供創業顧問支持。
          </p>
          <p>
            在Beauty100平台，商家能輕鬆找到合適的供應商和宣傳推廣資源，
          </p>
          <p>為生意快速起航提供新路徑。</p>
        </div>
      </section>

      {/* Services Grid - Images */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large left image */}
          <div className="md:row-span-2 relative rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&q=80"
              alt="美容門店建立"
              className="w-full h-full min-h-[300px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <Star className="w-5 h-5 mb-1" />
              <p className="font-bold text-sm">美容門店建立</p>
              <p className="text-xs text-white/80">設計/裝修/牌照/通風</p>
            </div>
          </div>

          {/* Top right */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80"
              alt="產品供應"
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="font-bold text-sm">產品供應</p>
              <p className="text-xs text-white/80">專業配方定制</p>
            </div>
          </div>

          {/* Center */}
          <div className="relative rounded-2xl overflow-hidden bg-pink-50 flex flex-col items-center justify-center p-8">
            <Megaphone className="w-8 h-8 text-pink-400 mb-3" />
            <p className="font-bold text-lg">宣傳</p>
            <p className="text-gray-500 text-xs mt-1">直接與網紅KOL合作</p>
          </div>

          {/* Bottom middle */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80"
              alt="店鋪排名"
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="font-bold text-sm">店鋪排名</p>
              <p className="text-xs text-white/80">連結廣告投放業客</p>
            </div>
          </div>

          {/* Bottom right - delivery */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1612015670817-0127d21628d4?w=400&q=80"
              alt="物流配送"
              className="w-full h-[200px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white z-10">
              <p className="font-bold text-sm">儀器供應</p>
              <p className="text-xs text-white/80">高效物流配送</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-pink-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-pink-500">2400+</p>
                    <p className="text-xs text-gray-500 mt-1">美容儀器供應商</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full border-4 border-amber-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">3.5</p>
                    <p className="text-xs text-gray-500 mt-1">倍效率提升</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                <p>
                  Beauty100平台連接超2400家專業儀器供應商，為商戶提供高效採購及租賃解決方案。通過平台可輕鬆進行多供應商比價，涵蓋激光設備等最新美容儀器，能選最適合店鋪需求的產品，平均提升採購效率3.5倍以上，既降低成本又保障品質合規，支持香港及大灣區供應鏈物流。
                </p>
                <p>
                  針對新開美容院，可配對本地供應商，提供安裝培訓和售后支持；對於擴張業務的商戶，推薦亞洲進口渠道，確保儀器多樣化。Beauty100簡化供應鏈管理，讓商戶專注核心業務，實現可持續發展，助力小型沙龍或連鎖機構在美業市場脫穎而出。
                </p>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Package className="w-4 h-4 text-pink-500" />
                  <span className="font-medium">儀器供應</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <BarChart3 className="w-4 h-4 text-pink-500" />
                  <span className="font-medium">採買比價</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Globe className="w-4 h-4 text-pink-500" />
                  <span className="font-medium">供應鏈優化</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "商戶註冊", desc: "即時解鎖專屬優勢", href: "/merchant-registration" },
            { title: "宣傳營銷", desc: "提升品牌曝光效能", href: "/merchant-marketing" },
            { title: "創業顧問", desc: "專業開業策略指導", href: "/merchant-consulting" },
            { title: "商務合作", desc: "探索多元合作機會", href: "/merchant-cooperation", active: true },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={`text-center cursor-pointer rounded-lg p-4 transition-colors ${
                item.active
                  ? "bg-pink-50 border border-pink-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <h3 className={`font-bold text-base mb-1 ${item.active ? "text-pink-500" : ""}`}>
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* One-Stop Services */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
          一站式商務合作陣地
        </h2>
        <p className="text-center text-gray-500 text-sm mb-12">
          站內高效營銷工具，提升營業額更有效
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-8 hover:shadow-md transition-shadow"
            >
              <service.icon className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-bold text-lg mb-3">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[700px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          常見問題解答
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-bold text-sm">{faq.q}</span>
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
      </section>

      {/* CTA Banner */}
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
