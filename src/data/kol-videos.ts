/* ═══════════════════════════════════════════════════════════════
   KOL VIDEO DATA — shared across index and watch pages
   ═══════════════════════════════════════════════════════════════ */

export interface KolVideo {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  kolName: string;
  kolAvatar: string;
  kolId: string;
  category: string[];
  views: string;
  date: string;
  description: string;
}

export interface KolArticle {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  summary: string;
  date: string;
}

export const ALL_KOL_VIDEOS: KolVideo[] = [
  // ── 護膚實測 ──
  {
    id: 'kol-skincare-serum-compare',
    title: 'KOL親測：10款熱賣精華液30日真實效果對比',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    duration: '18:32',
    kolName: 'Chloe Beauty',
    kolAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    kolId: 'chloe-beauty',
    category: ['護膚實測'],
    views: '52.3K',
    date: '2025年4月1日',
    description: '今次揀咗10款市面上最受歡迎嘅精華液，連續30日每日跟蹤使用效果。由平價到貴價，包括維他命C、玻尿酸、煙醯胺等唔同成分，睇吓邊款真係有效改善膚質、提亮膚色。',
  },
  {
    id: 'kol-sunscreen-sensitive',
    title: '敏感肌適用？實測5款網紅防曬霜',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    duration: '12:45',
    kolName: 'Mia護膚日記',
    kolAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    kolId: 'mia-skincare',
    category: ['護膚實測'],
    views: '38.1K',
    date: '2025年3月29日',
    description: '敏感肌揀防曬真係好頭痛！今次搵咗5款網上好評嘅防曬霜，逐款上面試用，測試質地、防曬力、致敏程度同持久度，幫敏感肌姊妹搵到最適合嘅防曬。',
  },
  {
    id: 'kol-moisturizer-blind-test',
    title: '平價vs貴價保濕面霜盲測！結果出乎意料',
    thumbnail: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    duration: '15:20',
    kolName: 'Chloe Beauty',
    kolAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    kolId: 'chloe-beauty',
    category: ['護膚實測'],
    views: '44.7K',
    date: '2025年3月25日',
    description: '今次做咗個盲測實驗，揀咗3款$100以下同3款$500以上嘅保濕面霜，搵10位朋友蒙眼試用再評分。結果竟然平價組都有一款完勝貴價！想知係邊款就入嚟睇。',
  },
  {
    id: 'kol-no-skincare-7days',
    title: '連續7日唔護膚會點？真人實驗全記錄',
    thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    duration: '10:15',
    kolName: 'Yuki實驗室',
    kolAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    kolId: 'yuki-lab',
    category: ['護膚實測'],
    views: '61.2K',
    date: '2025年3月20日',
    description: '為咗測試護膚品到底有冇用，我決定連續7日完全唔用任何護膚品！每日紀錄皮膚狀態變化，用皮膚檢測儀量度水分、油脂同毛孔變化。結果真係幾驚人…',
  },
  // ── 療程實錄 ──
  {
    id: 'kol-hifu-experience',
    title: 'HIFU全過程實錄：痛感、效果、恢復期全公開',
    thumbnail: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80',
    duration: '22:10',
    kolName: 'Jessica醫美體驗',
    kolAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80',
    kolId: 'jessica-beauty',
    category: ['療程實錄'],
    views: '73.5K',
    date: '2025年4月2日',
    description: '第一次做HIFU緊膚療程！由諮詢到真正做療程，全程無剪接實錄。詳細分享痛感評分、即時效果、術後恢復過程同埋一個月後嘅真實變化。',
  },
  {
    id: 'kol-water-glow-injection',
    title: '第一次做水光針！全程無剪接記錄',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    duration: '16:48',
    kolName: 'Mia護膚日記',
    kolAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    kolId: 'mia-skincare',
    category: ['療程實錄'],
    views: '58.9K',
    date: '2025年3月28日',
    description: '終於去做水光針啦！全程記錄由敷麻膏到打針嘅過程，到底有幾痛？即時效果點樣？術後幾日皮膚有咩變化？全部真實呈現。',
  },
  {
    id: 'kol-pico-laser',
    title: '皮秒激光去斑效果：術後30日跟蹤紀錄',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
    duration: '19:55',
    kolName: 'Jessica醫美體驗',
    kolAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80',
    kolId: 'jessica-beauty',
    category: ['療程實錄'],
    views: '41.6K',
    date: '2025年3月22日',
    description: '做完皮秒激光去斑，連續30日每日影相記錄，睇吓色斑真係會消失嗎？分享療程感受、恢復過程同最終效果。',
  },
  {
    id: 'kol-thermage-flx',
    title: 'Thermage FLX體驗：真係無痛嗎？效果幾耐見到？',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
    duration: '14:30',
    kolName: 'Anna Beauty Lab',
    kolAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    kolId: 'anna-beauty-lab',
    category: ['療程實錄', '抗老體驗'],
    views: '35.4K',
    date: '2025年3月18日',
    description: '坊間話Thermage FLX比舊版痛少好多，到底係咪真？今次親身體驗第4代Thermage，由術前到術後2星期完整記錄。',
  },
  // ── 化妝教學 ──
  {
    id: 'kol-5min-office-makeup',
    title: '5分鐘返工妝容教學：簡單快靚正',
    thumbnail: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    duration: '8:22',
    kolName: 'Yuki實驗室',
    kolAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    kolId: 'yuki-lab',
    category: ['化妝教學'],
    views: '89.3K',
    date: '2025年3月31日',
    description: '返工趕時間但又想靚靚出門？教你5分鐘完成一個清新自然嘅返工妝容，只需要5件化妝品就搞掂！',
  },
  {
    id: 'kol-natural-base-makeup',
    title: '新手必學：自然偽素顏底妝教程',
    thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    duration: '11:40',
    kolName: 'Chloe Beauty',
    kolAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    kolId: 'chloe-beauty',
    category: ['化妝教學'],
    views: '67.8K',
    date: '2025年3月27日',
    description: '想化一個自然到好似冇化妝嘅底妝？由選擇粉底到定妝技巧，一步步教你打造「有素顏感」嘅完美底妝。',
  },
  {
    id: 'kol-eye-makeup-monolid',
    title: '眼妝技巧大全：單眼皮變大眼妝容',
    thumbnail: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&q=80',
    duration: '13:15',
    kolName: 'Mia護膚日記',
    kolAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    kolId: 'mia-skincare',
    category: ['化妝教學'],
    views: '55.2K',
    date: '2025年3月23日',
    description: '單眼皮都可以有大眼效果！分享我嘅眼妝秘訣，由眼影配色到眼線畫法，每個步驟都影響最終效果。',
  },
  {
    id: 'kol-contouring-face-shape',
    title: '修容塑形教學：唔同面型嘅修容方法',
    thumbnail: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
    duration: '14:08',
    kolName: 'Anna Beauty Lab',
    kolAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    kolId: 'anna-beauty-lab',
    category: ['化妝教學'],
    views: '42.1K',
    date: '2025年3月19日',
    description: '圓面、方面、長面都有唔同嘅修容方法！教你點樣用修容同高光打造完美面型輪廓。',
  },
  // ── 抗老體驗 ──
  {
    id: 'kol-anti-aging-25',
    title: '25歲開始抗老！我嘅初抗老護膚Routine',
    thumbnail: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
    duration: '16:30',
    kolName: 'Yuki實驗室',
    kolAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    kolId: 'yuki-lab',
    category: ['抗老體驗'],
    views: '48.6K',
    date: '2025年3月30日',
    description: '25歲就要開始抗老？冇錯！分享我由護膚品到生活習慣嘅初抗老Routine，防止細紋同膠原蛋白流失。',
  },
  {
    id: 'kol-anti-aging-serum-ranking',
    title: '抗老精華液排行榜：實測6款人氣之選',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    duration: '20:12',
    kolName: 'Jessica醫美體驗',
    kolAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80',
    kolId: 'jessica-beauty',
    category: ['抗老體驗', '護膚實測'],
    views: '39.4K',
    date: '2025年3月26日',
    description: '用咗6款人氣抗老精華液各一個月，由A醇到胜肽到生長因子，分享每款嘅使用感受同效果對比。',
  },
  {
    id: 'kol-eye-wrinkle-guide',
    title: '眼部抗皺全攻略：眼霜真係有用嗎？',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    duration: '12:55',
    kolName: 'Anna Beauty Lab',
    kolAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    kolId: 'anna-beauty-lab',
    category: ['抗老體驗'],
    views: '33.7K',
    date: '2025年3月21日',
    description: '眼紋係最令人煩惱嘅衰老跡象！解構眼霜成分同使用方法，分享點樣有效改善眼周細紋同黑眼圈。',
  },
  // ── 身材管理 ──
  {
    id: 'kol-30day-exercise',
    title: '30日居家運動挑戰：體態變化全記錄',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    duration: '17:45',
    kolName: 'Yuki實驗室',
    kolAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    kolId: 'yuki-lab',
    category: ['身材管理'],
    views: '95.2K',
    date: '2025年4月1日',
    description: '30日居家運動挑戰！每日15分鐘，唔去gym都可以改善體態。記錄每星期嘅身體變化，分享最有效嘅居家運動動作。',
  },
  {
    id: 'kol-coolsculpting',
    title: '體雕療程真實體驗：CoolSculpting冷凍溶脂',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    duration: '21:30',
    kolName: 'Jessica醫美體驗',
    kolAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80',
    kolId: 'jessica-beauty',
    category: ['身材管理', '療程實錄'],
    views: '62.8K',
    date: '2025年3月27日',
    description: '試做CoolSculpting冷凍溶脂！記錄由諮詢到做完3個月嘅效果變化，到底冷凍溶脂真係可以減走頑固脂肪嗎？',
  },
  {
    id: 'kol-diet-no-restriction',
    title: '飲食管理分享：唔節食都可以瘦？',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    duration: '14:22',
    kolName: 'Anna Beauty Lab',
    kolAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
    kolId: 'anna-beauty-lab',
    category: ['身材管理'],
    views: '71.3K',
    date: '2025年3月24日',
    description: '唔使節食都可以保持好身材！分享我嘅飲食管理方法，由食物選擇到進食時間，建立健康而可持續嘅飲食習慣。',
  },
  // ── 熱門KOL ──
  {
    id: 'kol-qa-skincare',
    title: 'Q&A時間：粉絲問我最多嘅護膚問題',
    thumbnail: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80',
    duration: '25:10',
    kolName: 'Chloe Beauty',
    kolAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    kolId: 'chloe-beauty',
    category: ['熱門KOL'],
    views: '112.5K',
    date: '2025年4月2日',
    description: '收集咗粉絲最想知嘅護膚問題，一次過解答！包括油性肌點護膚、暗瘡印點淡化、毛孔粗大點改善等等。',
  },
  {
    id: 'kol-beauty-cabinet',
    title: '我嘅美容櫃大公開！用緊嘅所有產品',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    duration: '19:45',
    kolName: 'Mia護膚日記',
    kolAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    kolId: 'mia-skincare',
    category: ['熱門KOL'],
    views: '87.6K',
    date: '2025年3月30日',
    description: '大公開我嘅美容櫃！逐件介紹我每日用緊嘅護膚品、化妝品同工具，分享為咩揀呢啲產品。',
  },
  {
    id: 'kol-day-vlog',
    title: '一日Vlog：KOL嘅真實工作日常',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    duration: '23:18',
    kolName: 'Yuki實驗室',
    kolAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    kolId: 'yuki-lab',
    category: ['熱門KOL'],
    views: '76.4K',
    date: '2025年3月28日',
    description: '好多人都好奇KOL平時點過日子，今次就記錄咗我完整嘅一日工作日常，由朝早護膚到拍片到晚上routine。',
  },
];

export const RELATED_ARTICLES: KolArticle[] = [
  {
    id: 'article-deep-cleansing',
    title: '深層清潔面部護理：你真係做啱咗嗎？專家教你正確步驟',
    thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    category: '基礎護理',
    summary: '深層清潔係面部護理嘅基本，但好多人其實做錯咗！專家教你正確嘅潔面方法。',
    date: '2025年4月2日',
  },
  {
    id: 'article-must-buy-2025',
    title: '2025年必買護膚品清單：皮膚科醫生推薦嘅10款產品',
    thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    category: '產品推薦',
    summary: '皮膚科醫生親自揀選嘅護膚品清單，從平價到高端，每款都經得起專業考驗。',
    date: '2025年3月30日',
  },
  {
    id: 'article-hifu-guide',
    title: 'HIFU緊膚療程全攻略：效果、價錢、注意事項一文睇晒',
    thumbnail: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&q=80',
    category: '醫美療程',
    summary: 'HIFU係近年最受歡迎嘅面部緊膚療程，從原理到術後護理，全面解構。',
    date: '2025年4月1日',
  },
  {
    id: 'article-anti-aging-food',
    title: '10種抗老食物：由內到外保持年輕',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    category: '飲食健康',
    summary: '抗老唔只係搽嘢！呢10種食物含豐富抗氧化成分，幫你由內到外對抗衰老。',
    date: '2025年3月28日',
  },
  {
    id: 'article-sunscreen-myths',
    title: '防曬迷思大破解：皮膚科醫生話你知真相',
    thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80',
    category: '護膚知識',
    summary: '關於防曬嘅常見誤解，由SPF數值到補搽頻率，醫生為你逐一拆解。',
    date: '2025年3月25日',
  },
  {
    id: 'article-retinol-guide',
    title: 'A醇入門指南：新手點開始用？',
    thumbnail: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    category: '護膚成分',
    summary: 'A醇係公認嘅抗老成分，但新手用錯可能會爛面！教你點樣安全開始使用。',
    date: '2025年3月22日',
  },
];

/**
 * Get related videos for a given video, based on category overlap and KOL identity.
 * Returns up to `limit` videos, excluding the given video.
 * Prioritizes: same category > same KOL > others.
 */
export function getRelatedVideos(videoId: string, limit = 8): KolVideo[] {
  const currentVideo = ALL_KOL_VIDEOS.find((v) => v.id === videoId);
  if (!currentVideo) return ALL_KOL_VIDEOS.slice(0, limit);

  // Score by category overlap + KOL identity bonus
  const scored = ALL_KOL_VIDEOS
    .filter((v) => v.id !== videoId)
    .map((v) => {
      const categoryOverlap = v.category.filter((c) => currentVideo.category.includes(c)).length;
      const sameKol = v.kolId === currentVideo.kolId ? 0.5 : 0;
      return { video: v, score: categoryOverlap + sameKol };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.video);
}

/**
 * Get related articles for a given video, based on category keyword matching.
 * Uses the video's categories to find topically relevant articles.
 * Returns up to `limit` articles.
 */
export function getRelatedArticles(videoId: string, limit = 3): KolArticle[] {
  const currentVideo = ALL_KOL_VIDEOS.find((v) => v.id === videoId);
  if (!currentVideo) return RELATED_ARTICLES.slice(0, limit);

  // Map video categories to relevant article categories
  const categoryKeywords: Record<string, string[]> = {
    '護膚實測': ['基礎護理', '產品推薦', '護膚知識', '護膚成分'],
    '療程實錄': ['醫美療程', '護膚成分'],
    '化妝教學': ['產品推薦', '基礎護理'],
    '抗老體驗': ['護膚成分', '飲食健康', '醫美療程'],
    '身材管理': ['飲食健康'],
    '熱門KOL': ['產品推薦', '基礎護理', '護膚知識'],
  };

  const relevantCategories = currentVideo.category.flatMap(
    (cat) => categoryKeywords[cat] || []
  );

  // Score articles: higher if their category appears multiple times in relevant list
  const scored = RELATED_ARTICLES.map((a) => ({
    article: a,
    score: relevantCategories.filter((c) => c === a.category).length,
  })).sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.article);
}

/**
 * Get related articles for a KOL profile, based on the profile's relatedTopics.
 * Returns up to `limit` articles matched to the KOL's focus areas.
 */
export function getArticlesForKol(relatedTopics: string[], limit = 4): KolArticle[] {
  if (!relatedTopics || relatedTopics.length === 0) return RELATED_ARTICLES.slice(0, limit);

  const scored = RELATED_ARTICLES.map((a) => ({
    article: a,
    score: relatedTopics.includes(a.category) ? 1 : 0,
  })).sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.article);
}
