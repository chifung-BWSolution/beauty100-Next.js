'use client';

import React, { useState } from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Mail, Phone, Clock, Send,
  MessageSquare, Building2, Users, Sparkles,
  ArrowRight, CheckCircle2, HelpCircle,
} from 'lucide-react';

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: '電郵聯繫',
    detail: 'info@beauty100-magazine.com',
    description: '一般查詢同合作聯繫',
    color: 'bg-rose-100 text-rose-600',
    gradient: 'from-rose-50 to-pink-50',
  },
  {
    icon: Phone,
    title: 'WhatsApp',
    detail: '+852 1234 5678',
    description: '即時對話，快速回覆',
    color: 'bg-emerald-100 text-emerald-600',
    gradient: 'from-emerald-50 to-teal-50',
  },
  {
    icon: Clock,
    title: '服務時間',
    detail: '週一至週五 10:00-18:00',
    description: '公眾假期除外',
    color: 'bg-blue-100 text-blue-600',
    gradient: 'from-blue-50 to-indigo-50',
  },
];

const FAQ = [
  { q: '點樣註冊成為商戶？', a: '你可以點擊「商戶登入」，然後選擇「免費註冊」，填寫你嘅美容院資料就可以。' },
  { q: '刊登美容院資料需要收費嗎？', a: '基本刊登係免費嘅，我哋亦提供付費推廣服務幫你提升曝光率。' },
  { q: '點樣修改已刊登嘅資料？', a: '登入你嘅商戶帳號後，可以喺「編輯資料」頁面修改你嘅美容院資訊。' },
  { q: '可以投稿文章嗎？', a: '歡迎投稿！請將文章內容發送到 info@beauty100-magazine.com，我哋嘅編輯團隊會儘快回覆。' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PublicLayout>
      {/* ═══════════ 1. PAGE HEADER ═══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 30%, #fdf2f8 70%, #fff1f2 100%)' }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span className="text-[12px] font-semibold tracking-[0.15em] text-rose-400 uppercase">Contact Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
            聯絡我們
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
            有任何查詢、合作建議或意見，歡迎隨時聯繫我哋團隊，我哋會盡快回覆你。
          </p>
        </div>
      </section>

      {/* ═══════════ 2. CONTENT AREA ═══════════ */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>

        {/* Contact Methods Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {CONTACT_METHODS.map((method, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 bg-gradient-to-br ${method.gradient} border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${method.color}`}>
                <method.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">{method.title}</h3>
              <p className="text-sm font-semibold text-rose-600 mb-1">{method.detail}</p>
              <p className="text-[12px] text-slate-400">{method.description}</p>
            </div>
          ))}
        </div>

        {/* Main 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Left Column: Contact Form ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
                <h2 className="text-lg font-bold text-slate-800">傳送訊息</h2>
              </div>
              <p className="text-[12px] text-slate-400 mb-6 pl-4">填寫以下表格，我哋會盡快回覆你。</p>

              {submitted && (
                <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  訊息已發送！我哋會盡快回覆你。
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-slate-600 mb-1.5 block">姓名</label>
                    <Input
                      required
                      placeholder="你嘅姓名"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-rose-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-slate-600 mb-1.5 block">電郵</label>
                    <Input
                      required
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-rose-300 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-600 mb-1.5 block">主題</label>
                  <Input
                    required
                    placeholder="查詢主題"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-rose-300 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-slate-600 mb-1.5 block">訊息內容</label>
                  <Textarea
                    required
                    placeholder="請輸入你嘅訊息..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-rose-300 resize-none transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 px-6 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  傳送訊息
                </Button>
              </form>
            </div>
          </div>

          {/* ── Right Column: FAQ + CTA ── */}
          <div className="w-full lg:w-[380px] space-y-5">

            {/* FAQ Section */}
            <div className="bg-white rounded-xl border border-slate-100/80 shadow-sm p-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3.5">
                <span className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f472b6, #e11d48)' }} />
                <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                常見問題
              </h3>
              <div className="space-y-2.5">
                {FAQ.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 bg-slate-50/80 hover:bg-rose-50/50 transition-colors"
                  >
                    <h4 className="text-[12px] font-semibold text-slate-700 mb-1.5 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                      {item.q}
                    </h4>
                    <p className="text-[12px] text-slate-500 leading-relaxed pl-[22px]">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Inquiries CTA */}
            <div className="rounded-xl p-5 border border-rose-100/80 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.08), rgba(225,29,72,0.08))' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">商戶合作</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mb-3">
                    如果你係美容院老闆，想喺我哋平台刊登你嘅美容院資料或者進行推廣合作，歡迎聯繫我哋。
                  </p>
                  <a
                    href="/merchant-signup"
                    className="inline-flex items-center gap-1 text-[14px] font-semibold text-rose-500 hover:text-rose-600 hover:gap-2 transition-all"
                  >
                    立即註冊商戶 <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Community CTA */}
            <div className="rounded-xl p-5 border border-emerald-100/80 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(20,184,166,0.06))' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">加入社群</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mb-3">
                    加入我哋嘅美容愛好者社群，同其他用家分享護膚心得同美容資訊。
                  </p>
                  <a
                    href="/explore-salons"
                    className="inline-flex items-center gap-1 text-[14px] font-semibold text-emerald-500 hover:text-emerald-600 hover:gap-2 transition-all"
                  >
                    探索更多 <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
