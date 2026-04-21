'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: 'KOL親測：10款熱賣精華液真實評價',
    description: '美容KOL用咗一個月，為你試用10款市面最熱賣嘅精華液，邊款最值得買？',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '精華液',
    date: '2025年3月28日',
  },
  {
    title: 'Vlogger試做HIFU全過程實錄',
    description: '跟住美容Vlogger去做HIFU，全程紀錄療程過程同效果，真實無濾鏡！',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '療程體驗',
    date: '2025年3月25日',
  },
  {
    title: 'KOL護膚Routine大公開：日常護膚步驟',
    description: '人氣美容KOL分享佢嘅早晚護膚Routine，原來靚皮膚係咁養出嚟。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '日常護膚',
    date: '2025年3月22日',
  },
  {
    title: '開箱！美容訂閱盒真係值得買？',
    description: 'KOL為你開箱3個熱門美容訂閱盒，睇吓CP值高唔高。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '開箱',
    date: '2025年3月19日',
  },
  {
    title: 'KOL推薦：平價好用嘅護膚品',
    description: '唔使買貴嘢！呢幾款平價護膚品效果媲美大牌，KOL親身推薦。',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    tag: '平價好物',
    date: '2025年3月16日',
  },
  {
    title: '真人實測30日護膚挑戰結果公開',
    description: '30日只用一套護膚品，皮膚真係會變好？KOL親身實測俾你睇。',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    tag: '挑戰',
    date: '2025年3月13日',
  },
];

export default function KolPage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="KOL實錄"
        subtitle="KOL REVIEWS"
        heroImage="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
        heroDescription="真實用家同KOL嘅美容體驗分享，第一手嘅療程試做報告同產品評價。"
        articles={ARTICLES}
      />
    </PublicLayout>
  );
}
