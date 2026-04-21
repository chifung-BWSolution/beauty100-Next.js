'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '2025年必入嘅護膚品清單',
    description: '美容編輯精選2025年最值得入手嘅護膚品，唔同價位都有推薦。',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '推薦',
    date: '2025年3月28日',
  },
  {
    title: '底妝教學：打造零毛孔無瑕妝容',
    description: '專業化妝師教你用最簡單嘅方法打造零毛孔底妝，持久唔脫妝。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tag: '化妝技巧',
    date: '2025年3月25日',
  },
  {
    title: '防曬全攻略：唔同場合嘅防曬選擇',
    description: '防曬係護膚最重要一步！教你揀啱唔同場合嘅防曬產品。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '防曬',
    date: '2025年3月22日',
  },
  {
    title: '敏感肌護膚品推薦：溫和又有效嘅選擇',
    description: '敏感肌選護膚品好頭痛？呢幾款溫和又有效嘅產品啱晒你。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '敏感肌',
    date: '2025年3月19日',
  },
  {
    title: '卸妝正確步驟：你可能一直做錯咗',
    description: '卸妝係護膚嘅第一步，但好多人嘅卸妝方法其實係錯嘅！',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
    tag: '清潔',
    date: '2025年3月16日',
  },
  {
    title: '韓系化妝教學：自然裸妝步驟分享',
    description: '韓系自然裸妝一直都好受歡迎，跟住呢個教學就可以輕鬆做到。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '韓妝',
    date: '2025年3月13日',
  },
];

export default function SkincarePage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="化妝護膚"
        subtitle="SKINCARE & MAKEUP"
        heroImage="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80"
        heroDescription="最新化妝護膚技巧同產品推薦，幫你揀啱最適合嘅護膚品同學識化妝技巧。"
        articles={ARTICLES}
        accentColor="fuchsia"
      />
    </PublicLayout>
  );
}
