"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  TrendingUp,
  PlayCircle,
  Star,
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchantCTABanner from "@/components/MerchantCTABanner";

export default function MerchantPage() {
  const [whatsappLink, setWhatsappLink] = useState("");

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
            <a href="/merchant" className="text-pink-500 font-medium text-sm">
              主頁
            </a>
            <a href="/merchant-registration" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              商戶註冊
            </a>
            <a href="/merchant-marketing" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              宣傳營銷
            </a>
            <a href="/merchant-consulting" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              創業顧問
            </a>
            <a href="/merchant-cooperation" className="text-gray-700 font-medium text-sm hover:text-pink-500">
              商務合作
            </a>
            <a href="/merchant-contact" className="text-gray-700 font-medium text-sm hover:text-pink-500">
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
          src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1400&q=80"
          alt="Beauty Salon"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            商戶專區 開啟美容業成功之路
          </h1>
          <p className="text-xl md:text-2xl font-medium">
            一站式Beauty Tech專業平台
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-4 gap-4 bg-white rounded-2xl shadow-lg p-6">
          {[
            { title: "商戶註冊", desc: "即時解鎖專屬優勢", href: "/merchant-registration" },
            { title: "宣傳營銷", desc: "提升品牌曝光效能", href: "/merchant-marketing" },
            { title: "創業顧問", desc: "專業開業策略指導", href: "/merchant-consulting" },
            { title: "商務合作", desc: "探索多方合作機會", href: "#" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="text-center cursor-pointer hover:bg-pink-50 rounded-lg p-4 transition-colors"
            >
              <h3 className="font-bold text-base mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Platform Intro Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gray-400 text-xs mb-3 bg-gray-100 inline-block px-3 py-1 rounded-full">
              BEAUTY100 · 美麗人生雜誌
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              香港領先美容業生態整合平台
            </h2>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  全面專業資源支援
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed pl-4">
                  提供全面專業資源，包括市場數據分析、創業顧問服務及商務合作機會，助您全面掌握行業動態。
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  龐大用戶與商戶網絡
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed pl-4">
                  面向香港及大灣區，匯聚超過 800 萬站前用戶及超過 1 萬間美容商戶資料，助您在競爭激烈的美容市場中脫穎而出。
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  數據驅動業務優化
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed pl-4">
                  以數據驅動策略，幫助新開美容院或優化現有業務，降低風險，提升效率，並實現可持續增長。
                </p>
              </div>
            </div>

            <a
              href="/"
              className="inline-block mt-8 bg-pink-50 text-pink-600 border border-pink-200 px-8 py-3 rounded-full text-sm font-medium hover:bg-pink-100 transition-colors"
            >
              進入Beauty100主頁
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"
              alt="Beauty100 Magazine"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 py-5 text-center">
        <p className="text-pink-500 font-bold text-lg">
          推廣期間限時免商戶註冊費，享專屬宣傳優惠
        </p>
      </section>

      {/* 限時福利 Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gray-400 text-xs mb-3 bg-gray-100 inline-block px-3 py-1 rounded-full">
              Beauty100推廣期間
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">限時福利</h2>
            <h3 className="text-xl md:text-2xl font-bold text-pink-500 mb-6">百萬流量贈送</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              現正處於推廣階段，歡迎所有美容院業主註冊 Beauty100 平台並完善店舖資料。註冊後，即可享用以下主要賣點，助力您的業務快速成長。我們強烈建議企業主立即建立賬戶，抓住機會提升競爭力。
            </p>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="/merchant-registration"
                className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                立即了解
              </a>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">4.9 合作商戶評分</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80"
              alt="美容院服務"
              className="w-full h-[380px] object-cover"
            />
          </div>
        </div>

        {/* 4 Benefit Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            {
              icon: <Smartphone className="w-8 h-8 text-pink-500" />,
              title: "百萬流量",
              desc: "跨Google、IG、FB及大灣區多平台廣告流量推薦",
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-pink-500" />,
              title: "限時免費",
              desc: "即日起至6月30日，全免註冊、認證及登記費用",
            },
            {
              icon: <PlayCircle className="w-8 h-8 text-pink-500" />,
              title: "KOL探店曝光",
              desc: "與香港、深圳、廣州美妝博主合作，獲網紅探店機會提升曝光",
            },
            {
              icon: <Star className="w-8 h-8 text-pink-500" />,
              title: "直接獲客與管理",
              desc: "開通預約功能提升轉化，更新資料及公開資質增消費者信心",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="border border-pink-100 rounded-2xl p-6 text-center bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h4 className="font-bold text-base mb-2">{item.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 專業資源 Section */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">專業資源</h4>
              <p className="text-sm text-white/90 leading-relaxed">
                享用創業顧問、牌照申請指南及管理系統，涵蓋品牌定位、室內設計及工程項目，確保業務順利開展。
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">美容儀器信息</h4>
              <p className="text-sm text-white/90 leading-relaxed">
                提供最新的美容儀器推薦及技術趨勢資報，助您維持行業領先地位並引入創新解決方案。
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">市場數據支援</h4>
              <p className="text-sm text-white/90 leading-relaxed">
                重取每月更新的開業動態、客戶趨勢及人口統計分析，助您作出明智決策。
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-gradient-to-r from-pink-400 to-pink-500 rounded-2xl p-6 text-white">
              <h4 className="font-bold text-lg mb-2">美容業生態整合</h4>
              <p className="text-sm text-white/90 leading-relaxed">
                連結 KOL 推廣、品牌設計及儀器推薦，構建完整 O2O 生態系統。
              </p>
            </div>
            {/* WhatsApp CTA */}
            <div className="md:col-span-2 flex justify-center">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 inline-flex flex-col items-center">
                <h4 className="font-bold text-lg mb-3">想了解更多？</h4>
                <a
                  href={whatsappLink || "https://wa.me/85268589265"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp查詢
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data & Stats Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
              alt="數據分析"
              className="w-full h-[400px] object-cover rounded-2xl"
            />
          </div>
          <div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Beauty100 不僅是數據平台，更涵蓋打卡大小網紅及日本美容體驗的推薦，幫助消費者為您傳播良好口碑，輕鬆引流新客源，增強社長在網路曝光，我們把握美容發展的前沿趨勢，幫助業者立即提前部署。
            </p>
            <h2 className="text-2xl font-bold mb-6">龐大數據元素驅動您的成功</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Beauty100 提供強大數據資庫，涵蓋商戶分析及行業趨勢分析，幫助您抓住市場先機，半年陪跑數據精確佔。
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-pink-500">3000+</p>
                <p className="text-xs text-gray-500 mt-1">美容商戶</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-500">500萬+</p>
                <p className="text-xs text-gray-500 mt-1">有效訪客</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-500">100萬+</p>
                <p className="text-xs text-gray-500 mt-1">廣東的文章及評價</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-500">1.2億+</p>
                <p className="text-xs text-gray-500 mt-1">月瀏覽量</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-500">80000+</p>
                <p className="text-xs text-gray-500 mt-1">登記用戶</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-500">20+</p>
                <p className="text-xs text-gray-500 mt-1">合客國家及地區</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

              {/* Address */}
              <div className="flex items-start gap-2 mt-4 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <p>荃灣青山公路459-469號華力工業中心5字樓E室</p>
              </div>

              <div className="flex items-center gap-3 mt-3">
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
