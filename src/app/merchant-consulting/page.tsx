"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  TrendingUp,
  Globe,
  Link2,
  ChevronDown,
  ChevronUp,
  Instagram,
  Youtube,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchantCTABanner from "@/components/MerchantCTABanner";

export default function MerchantConsultingPage() {
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
      q: "如何開展品牌設計？",
      a: "登入後提交需求，團隊將基於您的業務定位提供客製方案，並提供知識產權保護、商標保護相關建議。",
    },
    {
      q: "牌照申請需準備什麼？",
      a: "顧問在了解場地、規劃和施工等信息後會給予指導程序，確保合規快速通過。",
    },
    {
      q: "儀器提供如何選擇？",
      a: "根據店鋪需求推薦型號，包含性能比較及供應商連結，助您決策。",
    },
    {
      q: "系統定制費用如何？",
      a: "具體可直接資訊客服，我們有月費制/定制開發等多種系統可供選擇。",
    },
    {
      q: "你們能做什麼活動？",
      a: "開張儀式、客戶邀約、聯賣、市場營銷等活動均可策劃執行，整合KOL資源，提升曝光效果。",
    },
  ];

  const testimonials = [
    {
      title: "專業品牌設計",
      quote:
        "Beauty100 的品牌設計服務助我精準品牌定位整體輸出，特別是市場定位格外準確，讓新店開業策略能吸引到非常精準的客戶。",
      name: "Angela Li",
      role: "Regional Beauty Manager",
    },
    {
      title: "讓創業高效",
      quote:
        "牌照申請顧問讓我細節常見關鍵選，偏排推薦遠距省成本，香港店面順利運營，團隊用心負責，值得信賴。",
      name: "Nicole Huang",
      role: "Beauty Service Manager",
    },
    {
      title: "空間規劃很強",
      quote:
        "門店裝修按照結合商業設計，空間利用率升30%，內地分訊線路無障礙，過程專業可靠。",
      name: "Tiffany Wu",
      role: "Beauty & Skincare Manager",
    },
    {
      title: "資源整合便捷",
      quote:
        "網頁開發同系統定制一站式，客戶登測試營組織得體，幫我快速建立會員制，創業起步超順暢。",
      name: "Rachel Yang",
      role: "Beauty Outlet Manager",
    },
    {
      title: "市場優勢強化",
      quote:
        "市場營銷顧問提供深洲趨勢分析，開張儀式吸引媒體，品牌知名度即時提升。",
      name: "Alice Zhou",
      role: "Beauty Brand Manager",
    },
    {
      title: "成功率顯著增長",
      quote:
        "使用 Beauty100 創業服務後，店面從規劃到開業僅三個月，銷售額超出預期，值得信賴。",
      name: "Fiona Xu",
      role: "Premium Beauty Manager",
    },
  ];

  const services = [
    {
      title: "品牌設計",
      desc: "定制品牌定位同視覺識別，包含logo同包裝方案。團隊分析市場趨勢，提升品牌辨識度。",
      img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80",
    },
    {
      title: "門店設計與裝修",
      desc: "提供商業空間規劃同裝修指導，函蓋室內美學同工程執行，助您優化客戶體驗，符合行業標準。",
      img: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&q=80",
    },
    {
      title: "牌照申請與儀器提供",
      desc: "引導牌照申請程序同推薦美容儀器，包含性能比較同供應連結。確保合規運營，提升服務品質。",
      img: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80",
    },
    {
      title: "營銷與系統定制",
      desc: "制定市場營銷策略同網頁/系統開發，整合開張儀式同客戶event。助您吸引初期客戶，分析數據優化。",
      img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&q=80",
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
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
            >
              宣傳營銷
            </a>
            <a
              href="/merchant-consulting"
              className="text-pink-500 font-medium text-sm"
            >
              創業顧問
            </a>
            <a
              href="/merchant-cooperation"
              className="text-gray-700 font-medium text-sm hover:text-pink-500"
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
          src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1400&q=80"
          alt="Consulting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              美容院 | 診所 | 美妝零售店
            </span>
            <span className="inline-flex items-center gap-1 bg-pink-500 text-white text-xs px-3 py-1 rounded-full">
              超過1500+成功創業案例
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            從品牌到開業
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold">
            專業顧問團隊全程支援
          </h2>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-xs text-gray-400 mb-6">● beauty100-magazine.com</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-8">
          美容創業 17年經驗 100%跟進交付
        </h2>
        <div className="text-gray-600 text-sm leading-relaxed space-y-3">
          <p>
            Beauty100 不止是美業公開資訊平台，團隊提供專業創業咨詢服務，
          </p>
          <p>
            涵蓋品牌設計、門店商業設計、門店裝修、牌照申請顧問服務、美容儀器提供、
          </p>
          <p>
            市場營銷、網頁開發、系統定制、開張儀式、客戶活動等。
          </p>
          <p className="mt-6">
            平台助您從零起步，面向香港、大灣區乃至亞洲市場擴大業務。
          </p>
          <p>
            我哋透過數據分析同行業洞察，確保每步創業決策可靠。
          </p>
          <p>
            無論新手開店定現有業務轉型，Beauty100 均能助您降低風險，實現穩定發展。
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <div key={i} className="group">
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-base mb-2">{service.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-8 border-amber-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-amber-700">17年</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">商業團隊運作經驗</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-8 border-amber-200 flex items-center justify-center">
                  <span className="text-3xl font-bold text-amber-700">1500+</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">創業陪跑成功案例</p>
              </div>
            </div>
            <div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                Beauty100 商業顧問團隊有超過1500+案例成功落地經驗，包括美容院、髮型屋、按摩店、美妝護膚品零售店等。從市場定位到項目落地執行，專業團隊用多年經驗為你保駕護航，有效避免創業必經的&quot;坑&quot;。
              </p>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                海量專業資源對接，提升創業項目成功率。立即聯繫，團隊提供量身定制方案。
              </p>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">專業指導</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">市場洞察</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">資源連結</span>
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
            { title: "創業顧問", desc: "專業開業策略指導", href: "/merchant-consulting", active: true },
            { title: "商務合作", desc: "探索多元合作機會", href: "/merchant-cooperation" },
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

      {/* Start Your Business Section */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">馬上開始創業</h2>
            <h3 className="text-2xl md:text-3xl font-bold mb-8">
              有Beauty100更容易
            </h3>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-base mb-2">專業指導加速起步</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Beauty100 提供一站式創業咨詢，從品牌設計到牌照申請，全程專家指導。助您避開常見陷阱，快速制定計劃，面向香港及大灣區市場啟動業務。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                  B
                </div>
                <div>
                  <h4 className="font-bold text-base mb-2">資源整合降低風險</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    透過平台連結美容儀器供應商及裝修夥伴，獲取比價及推薦服務，減少市場價格的不確定性。
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold">
                  C
                </div>
                <div>
                  <h4 className="font-bold text-base mb-2">市場洞察提升競爭</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    利用數據分析及營銷策略，涵蓋網頁開發同客戶event，助您抓緊大灣區6700萬人口的機會，打造品牌優勢，實現可持續業務增長。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80"
              alt="Business consulting"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            合作商戶評價
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            市場據點加速
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <h4 className="font-bold text-sm mb-3">{item.title}</h4>
                <p className="text-gray-600 text-xs leading-relaxed mb-6 italic">
                  &quot;{item.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-amber-100" />
                  <div>
                    <p className="text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
