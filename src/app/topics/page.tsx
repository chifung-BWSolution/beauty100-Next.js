'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '2025年最受歡迎嘅美容療程大盤點',
    description: '從水光針到HIFU，盤點今年最受香港女士歡迎的面部護理療程，一文睇晒。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '熱門',
    date: '2025年3月28日',
  },
  {
    title: '皮秒激光 vs 傳統激光：邊個更啱你？',
    description: '皮秒激光近年大熱，但同傳統激光有咩分別？專家為你詳細解構兩者優劣。',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '分析',
    date: '2025年3月25日',
  },
  {
    title: '醫美療程前後注意事項全攻略',
    description: '做醫美療程之前要準備啲咩？術後護理點做先啱？呢篇文章幫到你。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '指南',
    date: '2025年3月20日',
  },
  {
    title: '敏感肌專用：溫和美容療程推薦',
    description: '敏感肌膚嘅你唔使驚，以下呢幾款溫和療程專為敏感肌而設。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '推薦',
    date: '2025年3月18日',
  },
  {
    title: '美容院隱藏服務：你未必知道嘅療程',
    description: '原來好多美容院都有一啲隱藏服務，可能係你一直想搵嘅療程！',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '發現',
    date: '2025年3月15日',
  },
  {
    title: '香港醫美市場2025年趨勢分析',
    description: '專家分析2025年香港醫美市場趨勢，邊啲療程將會成為新寵？',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    tag: '趨勢',
    date: '2025年3月12日',
  },
];

export default function TopicsPage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="焦點話題"
        subtitle="TRENDING"
        heroImage="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
        heroDescription="緊貼香港美容界最新動態，為你帶來最熱門嘅美容話題同深度分析。"
        articles={ARTICLES}
      />
    </PublicLayout>
  );
}
