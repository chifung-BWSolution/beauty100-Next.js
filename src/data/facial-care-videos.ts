/* ═══════════════════════════════════════════════════════════════
   FACIAL CARE VIDEO DATA — used by /facial-care/video/[id]
   ═══════════════════════════════════════════════════════════════ */

export interface FacialCareVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string[];
  tag: string;
  views: string;
  date: string;
  description: string;
}

export const ALL_VIDEOS: FacialCareVideo[] = [
  {
    id: 'deep-cleansing-guide',
    title: '深層清潔面部護理：你真係做啱咗嗎？專家教你正確步驟',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    duration: '12:30',
    category: ['基礎護理', '熱門護膚'],
    tag: '基礎護理',
    views: '22.3K',
    date: '2025年4月2日',
    description: '深層清潔係面部護理嘅基本，但好多人其實做錯咗！專家教你正確嘅潔面方法，從卸妝到二次清潔，每個步驟都唔能夠忽略。學識正確嘅深層清潔方法，令你嘅護膚品更容易被皮膚吸收。',
  },
  {
    id: 'hifu-facial-treatment',
    title: 'HIFU緊膚療程全攻略：效果、價錢、注意事項一文睇晒',
    thumbnail: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
    duration: '18:45',
    category: ['療程解析', '醫美療程'],
    tag: '醫美療程',
    views: '20.5K',
    date: '2025年4月1日',
    description: 'HIFU係近年最受歡迎嘅面部緊膚療程，從原理到術後護理，全面解構你想知嘅所有資訊。了解HIFU嘅適合人群、治療過程、效果維持時間同價錢範圍。',
  },
  {
    id: 'serum-top-10',
    title: '2025年必買護膚品清單：皮膚科醫生推薦嘅10款產品',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    duration: '15:20',
    category: ['產品推薦', '熱門護膚'],
    tag: '產品推薦',
    views: '19.8K',
    date: '2025年3月30日',
    description: '皮膚科醫生親自揀選嘅護膚品清單，從平價到高端，每款都經得起專業考驗。包括精華液、面霜、防曬同面膜，滿足唔同肌膚需要。',
  },
  {
    id: 'sensitive-skin-routine',
    title: '敏感肌護膚Routine：溫和有效嘅日常護理',
    thumbnail: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    duration: '14:10',
    category: ['敏感肌護理', '基礎護理'],
    tag: '敏感肌',
    views: '16.7K',
    date: '2025年3月28日',
    description: '敏感肌唔代表唔可以好好護膚！分享一套溫和而有效嘅日常護膚Routine，從潔面到保濕到防曬，每一步都揀選對敏感肌友善嘅產品。',
  },
  {
    id: 'retinol-beginners',
    title: 'A醇入門指南：新手點開始用？避免爛面嘅正確方法',
    thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    duration: '11:55',
    category: ['護膚成分', '抗老護膚'],
    tag: '護膚成分',
    views: '15.2K',
    date: '2025年3月26日',
    description: 'A醇係公認嘅抗老成分，但新手用錯可能會爛面！教你點樣安全開始使用A醇，由低濃度到高濃度嘅過渡方法，同埋使用期間嘅注意事項。',
  },
  {
    id: 'pore-minimizing-tips',
    title: '毛孔粗大點算好？專家教你5個有效收毛孔方法',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    duration: '10:40',
    category: ['基礎護理', '護膚知識'],
    tag: '護膚知識',
    views: '18.4K',
    date: '2025年3月24日',
    description: '毛孔粗大係好多人嘅煩惱！由毛孔形成嘅原因到有效嘅收毛孔方法，專家教你從日常護膚到專業療程，全方位改善毛孔問題。',
  },
  {
    id: 'sunscreen-myths',
    title: '防曬迷思大破解：皮膚科醫生話你知真相',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
    duration: '13:15',
    category: ['護膚知識', '基礎護理'],
    tag: '護膚知識',
    views: '14.9K',
    date: '2025年3月22日',
    description: '關於防曬嘅常見誤解，由SPF數值到補搽頻率，由物理防曬到化學防曬嘅分別，皮膚科醫生為你逐一拆解防曬迷思。',
  },
  {
    id: 'water-glow-injection',
    title: '水光針療程全面解構：適合你嗎？效果可以維持幾耐？',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    duration: '16:20',
    category: ['醫美療程', '療程解析'],
    tag: '醫美療程',
    views: '21.1K',
    date: '2025年3月20日',
    description: '水光針近年大受歡迎，但到底係咪人人都適合做？詳細解構水光針嘅原理、過程、效果維持時間、價錢範圍同術後護理方法。',
  },
];
