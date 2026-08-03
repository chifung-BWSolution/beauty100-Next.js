export const KOL_HUB_NAV = [
  { label: '首頁', href: '/kol', match: 'exact' as const },
  { label: 'KOL 服務', href: '/kol/services', match: 'prefix' as const },
  { label: '推廣計劃', href: '/kol/packages', match: 'prefix' as const },
  { label: '短片拍攝', href: '/kol/short-video', match: 'prefix' as const },
  { label: '宣傳片', href: '/kol/corporate-video', match: 'prefix' as const },
  { label: '節目主播', href: '/kol/show-host', match: 'prefix' as const },
  { label: 'KOL 登記', href: '/kol/apply', match: 'prefix' as const },
  { label: '聯絡我們', href: '/contact', match: 'prefix' as const },
];

/** Unsplash images for KOL hub — distinct from the reference site */
export const KOL_HUB_IMAGES = {
  salonStorefront:
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  creatorSelfie:
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
  facialTreatment:
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
  skincareFlatlay:
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  beautyPortrait:
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1400&q=80',
  filmingCreator:
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  studioLights:
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
  beautyTalk:
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
  brandFilm:
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1400&q=80',
  talkShowStudio:
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1400&q=80',
  productHero:
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
};

export const KOL_APPLY_HREF = '/kol/apply';
export const MERCHANT_PROMO_HREF = '/kol-promotion';
