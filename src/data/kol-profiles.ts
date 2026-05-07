/* ═══════════════════════════════════════════════════════════════
   KOL PROFILE DATA — creator identity system
   ═══════════════════════════════════════════════════════════════ */

export interface KolProfile {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  intro: string;
  expertise: string[];
  focusArea: string;
  joinedDate: string;
  // Related article topic keywords
  relatedTopics: string[];
}

export const KOL_PROFILES: KolProfile[] = [
  {
    id: 'chloe-beauty',
    name: 'Chloe Beauty',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80',
    intro: '專注護膚品實測同化妝教學嘅美容KOL，以真實、客觀嘅態度分享每一款產品嘅使用感受。相信「適合自己嘅先係最好」，希望幫大家搵到最啱自己嘅護膚品同化妝方法。',
    expertise: ['護膚品實測', '化妝教學', '底妝技巧', '產品評測'],
    focusArea: '護膚實測 · 化妝教學',
    joinedDate: '2023年6月',
    relatedTopics: ['基礎護理', '產品推薦', '護膚知識', '護膚成分'],
  },
  {
    id: 'mia-skincare',
    name: 'Mia護膚日記',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80',
    intro: '敏感肌出身，因為自己嘅皮膚問題開始研究護膚。專注分享敏感肌友善嘅產品同療程體驗，亦會拍攝化妝教學。希望敏感肌嘅姊妹都可以搵到適合自己嘅護膚方案。',
    expertise: ['敏感肌護理', '療程實錄', '化妝教學', '美容櫃分享'],
    focusArea: '敏感肌護理 · 療程體驗',
    joinedDate: '2023年9月',
    relatedTopics: ['基礎護理', '產品推薦', '醫美療程', '護膚知識'],
  },
  {
    id: 'yuki-lab',
    name: 'Yuki實驗室',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
    intro: '鍾意用「實驗」嘅方式去驗證坊間嘅美容傳言！由唔護膚挑戰到30日運動體態變化，用真實數據同記錄嚟話畀你知到底啲方法有冇效。理性又有趣嘅美容頻道。',
    expertise: ['美容實驗', '身材管理', '抗老護膚', '生活Vlog'],
    focusArea: '美容實驗 · 身材管理',
    joinedDate: '2024年1月',
    relatedTopics: ['飲食健康', '護膚知識', '產品推薦'],
  },
  {
    id: 'jessica-beauty',
    name: 'Jessica醫美體驗',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80',
    intro: '專門分享各種醫美療程嘅真實體驗！由面部緊膚到身體雕塑，全程無剪接記錄，幫你了解每個療程嘅真實感受、效果同恢復過程。做療程之前先嚟呢度做功課！',
    expertise: ['HIFU緊膚', '皮秒激光', '抗老精華', '體雕療程'],
    focusArea: '醫美療程 · 抗老體驗',
    joinedDate: '2023年3月',
    relatedTopics: ['醫美療程', '護膚成分', '飲食健康'],
  },
  {
    id: 'anna-beauty-lab',
    name: 'Anna Beauty Lab',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&q=80',
    intro: '集合化妝教學、抗老護膚同身材管理嘅全方位美容頻道。相信美麗係由內到外，由飲食、運動到護膚缺一不可。分享實用嘅美容Tips，幫你建立健康又美麗嘅生活方式。',
    expertise: ['化妝教學', '修容技巧', '抗老護膚', '飲食管理'],
    focusArea: '化妝教學 · 全方位美容',
    joinedDate: '2024年2月',
    relatedTopics: ['飲食健康', '產品推薦', '護膚成分'],
  },
];

/**
 * Get a KOL profile by their ID/slug.
 */
export function getKolProfile(kolId: string): KolProfile | undefined {
  return KOL_PROFILES.find((p) => p.id === kolId);
}

/**
 * Get all KOL profiles.
 */
export function getAllKolProfiles(): KolProfile[] {
  return KOL_PROFILES;
}
