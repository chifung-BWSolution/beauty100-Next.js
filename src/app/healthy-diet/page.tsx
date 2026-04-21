'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '美白食物排行榜：食出白滑肌膚',
    description: '想皮膚白滑？呢幾款食物含豐富維他命C同抗氧化成分，幫你由內靚到外。',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    tag: '美白',
    date: '2025年3月28日',
  },
  {
    title: '抗衰老超級食物：延緩衰老嘅飲食秘訣',
    description: '藍莓、三文魚、牛油果⋯⋯呢啲超級食物可以幫你有效延緩衰老。',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    tag: '抗氧化',
    date: '2025年3月24日',
  },
  {
    title: '膠原蛋白飲品真嘅有用？科學拆解',
    description: '膠原蛋白飲品大熱，但真係飲咗就有效？聽吓專家點講。',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    tag: '科學解讀',
    date: '2025年3月21日',
  },
  {
    title: '排毒飲食計劃：7日肌膚煥然一新',
    description: '7日排毒飲食計劃幫你清除體內毒素，肌膚自然會變好。',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
    tag: '排毒',
    date: '2025年3月18日',
  },
  {
    title: '養顏湯水推薦：靚湯養出好皮膚',
    description: '中式養顏湯水一直都好受歡迎，呢幾款靚湯簡單易煲又有效。',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    tag: '湯水',
    date: '2025年3月15日',
  },
  {
    title: '飲食禁忌：呢啲食物會令皮膚變差',
    description: '有啲食物其實會令皮膚變差，睇吓你有冇食錯嘢。',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    tag: '注意事項',
    date: '2025年3月12日',
  },
];

export default function HealthyDietPage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="飲食健康"
        subtitle="HEALTHY DIET"
        heroImage="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80"
        heroDescription="食出健康美麗！專業營養師教你點樣透過飲食改善膚質同身體狀態。"
        articles={ARTICLES}
        accentColor="green"
      />
    </PublicLayout>
  );
}
