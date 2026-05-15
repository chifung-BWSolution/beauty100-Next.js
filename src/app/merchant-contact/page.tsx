"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Paperclip,
  Instagram,
  Youtube,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchantCTABanner from "@/components/MerchantCTABanner";

export default function MerchantContactPage() {
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
            <a href="/merchant" className="text-gray-700 font-medium text-sm hover:text-pink-500">
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
            <a href="/merchant-contact" className="text-pink-500 font-medium text-sm">
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
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1400&q=80"
          alt="Beauty Products"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <span className="inline-block bg-pink-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Beauty100 美麗人生雜誌
          </span>
          <h1 className="text-3xl md:text-4xl font-bold">
            關於Beauty100 & 聯絡我們
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-pink-500 text-sm font-medium mb-2">—— Beauty100國際寄語</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">攜手共創美容業新紀元</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                Beauty100 團隊致力於為香港及大灣區美容業提供全面支援，我們深信美業不僅是服務產業，更是創新與成長的平台。作為一群擁有豐富行業經驗的專業人士，我們從市場洞察到技術整合，均以商戶需求為核心，助力從創業到營運的全過程。
              </p>
              <p>
                無論是新入行者或資深業者，我們的服務涵蓋品牌設計、營銷宣傳及商務合作，旨在降低風險並提升效率。在這個快速變化的美業環境中，我們邀請您加入Beauty100生態，共同探索機會。
              </p>
              <p>
                透過數據驅動的工具及跨區域資源，我們不僅連接商戶與消費者，還連結網紅及供應商，打造互惠網絡。團隊相信，每位商戶的成功便是我們的成就。讓我們一起推動美業蓬勃發展，創造更美好的未來。
              </p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1614859324967-bae297794b8a?w=600&q=80"
              alt="Beauty professional"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Market Insights Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80"
                alt="Market insights"
                className="w-full h-[350px] object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">美業市場洞察：把握趨勢，引領變革</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                香港及大灣區美業市場正急速轉型，人口超過8700萬帶來無限商機，但競爭激烈。美容服務需求年增長15%，以激光療程及儀器應用為主。消費者偏好O2O模式，KOL推薦成關鍵。Beauty100提供簡潔報動態及行業報告，助搶到大灣區機會。挑戰包括成本上升，我們強調科技整合，提升轉化率達30%。美業向智能化移轉，數字工具助領先。
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">我們的願景：構建可持續美業生態系統</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Beauty100願景是建立連接香港、大灣區及亞洲的美業生態，讓商戶、消費者及供應商互惠。我們推動可持續發展，透過環保儀器及數字轉型減少浪費。未來擴大覆蓋，整合2400家供應商，實現採買比價。透過KOL及數據，將競爭轉聯合作，成為首選平台。促進創新如AI方案，讓行業包容繁榮。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white">17年</p>
              <p className="text-sm text-gray-400 mt-2">成功商業經驗</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white">1500+</p>
              <p className="text-sm text-gray-400 mt-2">店鋪項目落地</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white">2400+</p>
              <p className="text-sm text-gray-400 mt-2">優質供應商</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-white">98%</p>
              <p className="text-sm text-gray-400 mt-2">用戶好評率</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left: Title */}
          <div>
            <p className="text-sm text-gray-500 mb-2">❤ Contact Us</p>
            <h2 className="text-4xl font-bold text-gray-900">聯絡我們</h2>
          </div>

          {/* Right: Contact Cards */}
          <div className="space-y-6">
            {/* Media Inquiry */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">合作/廣告媒體查詢</h3>
                  <a
                    href="mailto:media@beauty100-magazine.com"
                    className="text-gray-600 text-sm hover:text-pink-500 transition-colors"
                  >
                    media@beauty100-magazine.com
                  </a>
                </div>
              </div>
            </div>

            {/* Technical Support */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">技術支援</h3>
                  <a
                    href="mailto:support@beauty100-magazine.com"
                    className="text-gray-600 text-sm hover:text-pink-500 transition-colors"
                  >
                    support@beauty100-magazine.com
                  </a>
                </div>
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
