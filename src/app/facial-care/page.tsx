'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '深層清潔面部護理：你真係做啱咗嗎？',
    description: '深層清潔係面部護理嘅基本，但好多人其實做錯咗！專家教你正確方法。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '基礎護理',
    date: '2025年3月28日',
  },
  {
    title: 'HIFU緊膚療程全攻略：效果、價錢、注意事項',
    description: 'HIFU係近年最受歡迎嘅面部緊膚療程，一文睇晒你想知嘅所有資訊。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '醫美',
    date: '2025年3月25日',
  },
  {
    title: '水光針入門指南：邊種水光針最啱你？',
    description: '水光針種類繁多，唔同品牌效果各異，呢篇文章幫你揀最適合嘅。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '注射',
    date: '2025年3月22日',
  },
  {
    title: '暗瘡肌面部護理方案：專家推薦嘅正確步驟',
    description: '暗瘡肌嘅面部護理有好多要注意嘅地方，跟住專家建議做就啱。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '暗瘡',
    date: '2025年3月19日',
  },
  {
    title: '面部按摩手法教學：提升護膚品吸收',
    description: '正確嘅面部按摩手法可以大大提升護膚品嘅吸收效果，即刻學起嚟！',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    tag: '按摩',
    date: '2025年3月16日',
  },
  {
    title: '面膜使用指南：唔同膚質點揀面膜？',
    description: '面膜種類繁多，乾性肌、油性肌、混合肌各有唔同嘅最佳選擇。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '面膜',
    date: '2025年3月13日',
  },
];

export default function FacialCarePage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="面部護理"
        subtitle="FACIAL CARE"
        heroImage="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80"
        heroDescription="專業面部護理知識，從日常清潔到醫美療程，為你嘅肌膚提供最全面嘅護理方案。"
        articles={ARTICLES}
      />
    </PublicLayout>
  );
}
