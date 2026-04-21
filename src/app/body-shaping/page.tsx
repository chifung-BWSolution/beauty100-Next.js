'use client';

import React from 'react';
import PublicLayout from '@/components/public/PublicLayout';
import ContentPageTemplate from '@/components/public/ContentPageTemplate';

const ARTICLES = [
  {
    title: '纖體療程大比拼：冷凍溶脂 vs 射頻溶脂',
    description: '兩大熱門纖體療程各有千秋，邊個先至最適合你嘅需要？',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    tag: '纖體',
    date: '2025年3月27日',
  },
  {
    title: '產後修身攻略：安全有效嘅塑形方案',
    description: '產後媽媽想修身但又擔心安全？呢幾個方案啱晒你。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '產後修身',
    date: '2025年3月23日',
  },
  {
    title: '瘦面方法大集合：V面唔再係夢',
    description: '想擁有V面？從按摩到療程，全面解構各種瘦面方法。',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    tag: '瘦面',
    date: '2025年3月19日',
  },
  {
    title: '運動配合美容療程：事半功倍嘅塑形效果',
    description: '運動同美容療程配合可以達到更好嘅塑形效果，教你點樣安排。',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    tag: '運動',
    date: '2025年3月16日',
  },
  {
    title: '消除橙皮紋：有效嘅治療方法',
    description: '橙皮紋困擾好多女士，其實有幾種有效嘅治療方法可以幫到你。',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    tag: '身體護理',
    date: '2025年3月13日',
  },
  {
    title: '局部塑形：針對性嘅纖體療程推薦',
    description: '手臂、腰間、大腿⋯⋯唔同部位有唔同嘅針對性纖體療程。',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    tag: '局部塑形',
    date: '2025年3月10日',
  },
];

export default function BodyShapingPage() {
  return (
    <PublicLayout>
      <ContentPageTemplate
        title="身材管理"
        subtitle="BODY SHAPING"
        heroImage="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80"
        heroDescription="專業身材管理方案，從纖體到塑形，幫你打造理想身材。"
        articles={ARTICLES}
        accentColor="red"
      />
    </PublicLayout>
  );
}
