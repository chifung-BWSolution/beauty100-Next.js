'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '全身按摩指南：邊種按摩最適合你？',
    description: '瑞典式、泰式、深層組織按摩⋯⋯唔同類型嘅按摩各有功效，邊種最啱你？',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
    tag: '按摩',
    date: '2025年3月28日',
  },
  {
    title: '脫毛方法大比拼：激光 vs IPL vs 蜜蠟',
    description: '想脫毛但唔知揀邊種方法？全面分析各種脫毛方法嘅優劣。',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '脫毛',
    date: '2025年3月24日',
  },
  {
    title: '身體磨砂正確方法：去除角質唔傷膚',
    description: '身體磨砂可以令肌膚更加光滑，但做錯方法可能會傷害皮膚。',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    tag: '去角質',
    date: '2025年3月21日',
  },
  {
    title: '手部護理：養出嫩滑纖纖玉手',
    description: '手部係第二塊面，但好多人都忽略咗手部護理，教你養出靚手。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '手部護理',
    date: '2025年3月18日',
  },
  {
    title: '足部護理全攻略：同粗糙腳皮講bye bye',
    description: '足部護理經常被忽略，但其實好重要！教你點樣護理雙腳。',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    tag: '足部護理',
    date: '2025年3月15日',
  },
  {
    title: '香薰治療：用精油改善身心狀態',
    description: '香薰治療唔止係好味咁簡單，適當使用精油可以改善多種身心問題。',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '香薰',
    date: '2025年3月12日',
  },
];

export default function BodyCarePage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="身體保養"
        subtitle="BODY CARE"
        heroImage="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80"
        heroDescription="全身保養貼士，從按摩到脫毛，教你由頭到腳全面護理身體。"
        articles={ARTICLES}
        accentColor="blue"
      />
    </PublicLayout>
  );
}
