'use client';

import React, { useState } from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Phone, MapPin, Clock, Send,
  MessageSquare, Building2, Users,
} from 'lucide-react';

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: '電郵聯繫',
    detail: 'info@beauty.com',
    description: '一般查詢同合作聯繫',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Phone,
    title: 'WhatsApp',
    detail: '+852 1234 5678',
    description: '即時對話，快速回覆',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Clock,
    title: '服務時間',
    detail: '週一至週五 10:00-18:00',
    description: '公眾假期除外',
    color: 'bg-blue-100 text-blue-600',
  },
];

const FAQ = [
  { q: '點樣註冊成為商戶？', a: '你可以點擊「商戶登入」，然後選擇「免費註冊」，填寫你嘅美容院資料就可以。' },
  { q: '刊登美容院資料需要收費嗎？', a: '基本刊登係免費嘅，我哋亦提供付費推廣服務幫你提升曝光率。' },
  { q: '點樣修改已刊登嘅資料？', a: '登入你嘅商戶帳號後，可以喺「編輯資料」頁面修改你嘅美容院資訊。' },
  { q: '可以投稿文章嗎？', a: '歡迎投稿！請將文章內容發送到 info@beauty.com，我哋嘅編輯團隊會儘快回覆。' },
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
    // Placeholder - would integrate with a backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80"
          alt="Contact"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <Badge className="bg-rose-500 text-white border-0 mb-3">CONTACT US</Badge>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">聯絡我們</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {CONTACT_METHODS.map((method, i) => (
            <div
              key={i}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${method.color}`}>
                <method.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{method.title}</h3>
              <p className="text-sm font-medium text-rose-600 mb-1">{method.detail}</p>
              <p className="text-xs text-slate-400">{method.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">傳送訊息</h2>
            <p className="text-sm text-slate-400 mb-6">填寫以下表格，我哋會盡快回覆你。</p>

            {submitted && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                ✅ 訊息已發送！我哋會盡快回覆你。
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">姓名</label>
                  <Input
                    required
                    placeholder="你嘅姓名"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 rounded-xl border-rose-100 bg-white/80"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">電郵</label>
                  <Input
                    required
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 rounded-xl border-rose-100 bg-white/80"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">主題</label>
                <Input
                  required
                  placeholder="查詢主題"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="h-11 rounded-xl border-rose-100 bg-white/80"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">訊息內容</label>
                <Textarea
                  required
                  placeholder="請輸入你嘅訊息..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl border-rose-100 bg-white/80 resize-none"
                />
              </div>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl text-sm font-medium shadow-md"
                style={{ background: 'linear-gradient(135deg, #f472b6, #e11d48)' }}
              >
                <Send className="w-4 h-4 mr-2" />
                傳送訊息
              </Button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">常見問題</h2>
            <p className="text-sm text-slate-400 mb-6">以下係一啲常見問題嘅解答。</p>
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.8)' }}
                >
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    {item.q}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>

            {/* Business Inquiries */}
            <div
              className="mt-6 rounded-xl p-5"
              style={{ background: 'linear-gradient(135deg, rgba(244,114,182,0.1), rgba(225,29,72,0.1))' }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">商戶合作</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    如果你係美容院老闆，想喺我哋平台刊登你嘅美容院資料或者進行推廣合作，歡迎聯繫我哋。
                  </p>
                  <a href="/merchant-signup" className="text-xs font-medium text-rose-500 hover:text-rose-600">
                    立即註冊商戶 →
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
