'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '女星逆齡秘密：鄭秀文凍齡保養法公開',
    description: '年過五十依然青春嘅鄭秀文，原來佢嘅保養秘訣係咁簡單！',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '明星',
    date: '2025年3月27日',
  },
  {
    title: '韓星護膚法：韓國女星最愛嘅護膚步驟',
    description: '韓國女星個個皮膚好好，原來佢哋嘅護膚步驟有呢啲秘密。',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80',
    tag: 'K-Beauty',
    date: '2025年3月24日',
  },
  {
    title: '紅毯造型背後：化妝師揭秘底妝技巧',
    description: '專業化妝師分享明星紅毯造型背後嘅底妝秘訣，零毛孔妝容原來係咁做。',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80',
    tag: '造型',
    date: '2025年3月21日',
  },
  {
    title: '娛樂圈最愛美容院排行榜',
    description: '明星都去邊間美容院做Facial？呢幾間係娛樂圈人氣之選！',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80',
    tag: '排行榜',
    date: '2025年3月18日',
  },
  {
    title: '男星護膚也瘋狂：陳偉霆嘅護膚心得',
    description: '男星都開始注重護膚，陳偉霆分享佢嘅日常護膚routine。',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    tag: '男士護膚',
    date: '2025年3月15日',
  },
  {
    title: '女星素顏對比：邊個真係天生麗質？',
    description: '一眾女星嘅素顏照曝光，邊個先係真正嘅天生麗質？',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    tag: '話題',
    date: '2025年3月12日',
  },
];

export default function EntertainmentPage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="娛樂圈"
        subtitle="ENTERTAINMENT"
        heroImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80"
        heroDescription="追蹤娛樂圈最新美容動態，揭開明星嘅護膚秘密同美容心得。"
        articles={ARTICLES}
        accentColor="fuchsia"
      />
    </PublicLayout>
  );
}
