'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '逆齡秘訣：膠原蛋白流失點樣補返？',
    description: '25歲開始膠原蛋白就會流失，點樣有效補充膠原蛋白？專家為你解答。',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    tag: '膠原蛋白',
    date: '2025年3月28日',
  },
  {
    title: '抗衰老療程大比拼：Thermage vs Ultherapy',
    description: '兩大抗衰老療程各有優劣，邊個更適合你嘅膚質同需要？',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    tag: '療程比較',
    date: '2025年3月24日',
  },
  {
    title: '抗皺護膚品成分大解構：邊啲真係有效？',
    description: '視黃醇、勝肽、玻尿酸⋯⋯邊啲抗皺成分真係有科學證據支持？',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    tag: '成分',
    date: '2025年3月20日',
  },
  {
    title: '眼部抗衰老全攻略：同眼紋講bye bye',
    description: '眼周肌膚最容易顯老，學識正確嘅眼部護理方法，同眼紋講再見。',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    tag: '眼部護理',
    date: '2025年3月17日',
  },
  {
    title: '日常抗衰老習慣：唔使花錢也可以逆齡',
    description: '抗衰老唔一定要做療程，呢幾個日常習慣就可以幫你有效延緩衰老。',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    tag: '日常習慣',
    date: '2025年3月14日',
  },
  {
    title: '頸紋點算好？頸部抗衰老護理方法',
    description: '頸紋係最容易暴露年齡嘅部位，但好多人都忽略咗頸部護理。',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    tag: '頸部護理',
    date: '2025年3月11日',
  },
];

export default function AntiAgingPage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="回復青春"
        subtitle="ANTI-AGING"
        heroImage="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80"
        heroDescription="探索最新逆齡抗衰老秘訣，從日常護理到專業療程，為你留住青春。"
        articles={ARTICLES}
        accentColor="purple"
      />
    </PublicLayout>
  );
}
