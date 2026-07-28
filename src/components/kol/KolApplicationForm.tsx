'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CheckCircle2 } from 'lucide-react';

/* ─── Options (aligned with EmailMeForm structure, beauty-adapted) ─── */

const TITLES = ['先生', '小姐', '女士', '太太'] as const;

const AGE_RANGES = ['18-25歲', '26-30歲', '31-40歲', '41-50歲', '51歲以上'] as const;

const BIRTH_MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
] as const;

const DISTRICT_GROUPS: { region: string; districts: string[] }[] = [
  {
    region: '香港島',
    districts: [
      '上環', '大坑', '山頂', '中環', '蘇豪', '蘭桂坊', '天后', '太古', '北角', '半山',
      '石澳', '西環', '赤柱', '金鐘', '柴灣', '灣仔', '西灣河', '杏花村', '香港仔',
      '淺水灣', '深水灣', '跑馬地', '筲箕灣', '銅鑼灣', '鴨脷洲', '薄扶林', '數碼港', '鰂魚涌',
    ],
  },
  {
    region: '九龍',
    districts: [
      '太子', '佐敦', '旺角', '油塘', '紅磡', '美孚', '彩虹', '樂富', '藍田', '觀塘',
      '九龍城', '九龍塘', '九龍灣', '土瓜灣', '大角咀', '牛頭角', '石硤尾', '尖沙咀',
      '何文田', '油麻地', '長沙灣', '荔枝角', '深水埗', '黃大仙', '慈雲山', '新蒲崗',
      '鯉魚門', '鑽石山',
    ],
  },
  {
    region: '新界',
    districts: [
      '上水', '大埔', '大圍', '元朗', '太和', '屯門', '火炭', '西貢', '沙田', '青衣',
      '粉嶺', '荃灣', '馬灣', '深井', '葵芳', '葵涌', '羅湖', '天水圍', '流浮山',
      '馬鞍山', '將軍澳', '落馬洲',
    ],
  },
  {
    region: '離島',
    districts: ['大澳', '坪洲', '東涌', '長洲', '大嶼山', '赤鱲角', '南丫島', '愉景灣'],
  },
];

const TRIAL_FREQUENCY = [
  '每日都做試用',
  '每星期做試用',
  '一個月一兩次',
  '間中才做',
  '不會主動做',
  '很少做',
] as const;

const TRIAL_EXPERIENCE = [
  '1-3個月',
  '6-12個月',
  '1-2年時間',
  '3+ 以上',
  '剛開始, 想做',
  '沒有經驗',
] as const;

const PUBLISH_PLATFORMS = [
  'Openrice',
  'Instagram',
  'Facebook',
  '小紅書',
  'Youtube',
  'TikTok',
  'Blog Website',
  'Threads',
  'Others',
] as const;

const OPENRICE_LEVELS = [
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Level 7',
  'Level 8',
  'Level 9',
  'Level 10',
  '智尊食家',
  '未開始',
] as const;

const CONTENT_TOPICS = [
  'beauty',
  '護膚 Skincare',
  '化妝 Makeup',
  '療程 Treatment',
  '自己生活照 my Life',
  '旅行 Travel',
  '時裝 Fashion',
  '生活娛樂 Lifestyle',
  '健康 Health',
  '其他 Others',
] as const;

const COOPERATION_INTERESTS = [
  'Beauty KOL',
  '幫品牌／美容院影產品相片',
  '網上Live直播',
  '產品試用活動',
  '上鏡拍攝',
  '媒體訪問',
  '品牌 Promoter 工作',
  '宣傳 Model 工作',
  '其他合作也可以',
] as const;

const VIDEO_SHARING = [
  '可以在 Beauty100 分享',
  '暫時不想分享影片',
  '可分享相片及文字',
  '我沒有影片內容',
  '有興趣成為 Beauty100 Editor',
  '有興趣成為 Beauty100 主持',
] as const;

const AVAILABLE_TIMES = [
  '任何時間都可以',
  '返緊正職, 平日晚上',
  '星期五晚上',
  '星期六日及假期全日',
  '下午茶時間可以',
  '上午時間可以',
] as const;

const CLUB_INTEREST = [
  '好, 我想加入',
  '想了解, 有興趣考慮',
  '想參加活動了解',
  '沒有興趣,不想加入',
] as const;

const MODEL_EXPERIENCE = [
  '有, 經常做model 工作',
  '有, 幾次',
  '有, 1-2次',
  '無, 但興趣考慮做model',
  '無, 不喜歡',
] as const;

const CAMERA_EXPERIENCE = [
  '有, 經常出鏡',
  '有, 幾次',
  '有, 1-2次',
  '無, 但興趣考慮',
  '無, 不喜歡上鏡',
] as const;

const LIVE_INTEREST = [
  '有, 有開live經驗',
  '有, 上鏡經驗',
  '無, 但興趣考慮',
  '無, 不喜歡上鏡',
] as const;

type FormState = {
  name: string;
  title: string;
  email: string;
  phone: string;
  ageRange: string;
  birthMonth: string;
  residenceDistrict: string;
  workDistrict: string;
  trialFrequency: string;
  trialExperience: string;
  publishPlatforms: string[];
  openriceUrl: string;
  openriceLevel: string;
  instagram: string;
  instagramFollowers: string;
  facebook: string;
  facebookLikes: string;
  xiaohongshu: string;
  xiaohongshuFollowers: string;
  youtube: string;
  youtubeSubscribers: string;
  tiktok: string;
  tiktokFollowers: string;
  blogUrl: string;
  blogSubscribers: string;
  otherChannels: string;
  otherFollowers: string;
  contentTopics: string[];
  cooperationInterests: string[];
  videoSharing: string;
  availableTimes: string[];
  clubInterest: string;
  modelExperience: string;
  cameraExperience: string;
  liveInterest: string;
};

const INITIAL: FormState = {
  name: '',
  title: '',
  email: '',
  phone: '',
  ageRange: '',
  birthMonth: '',
  residenceDistrict: '',
  workDistrict: '',
  trialFrequency: '',
  trialExperience: '',
  publishPlatforms: [],
  openriceUrl: '',
  openriceLevel: '',
  instagram: '',
  instagramFollowers: '',
  facebook: '',
  facebookLikes: '',
  xiaohongshu: '',
  xiaohongshuFollowers: '',
  youtube: '',
  youtubeSubscribers: '',
  tiktok: '',
  tiktokFollowers: '',
  blogUrl: '',
  blogSubscribers: '',
  otherChannels: '',
  otherFollowers: '',
  contentTopics: [],
  cooperationInterests: [],
  videoSharing: '',
  availableTimes: [],
  clubInterest: '',
  modelExperience: '',
  cameraExperience: '',
  liveInterest: '',
};

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-colors bg-white';

export default function KolApplicationForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [photo1, setPhoto1] = useState<File | null>(null);
  const [photo2, setPhoto2] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const districtOptions = useMemo(
    () =>
      DISTRICT_GROUPS.flatMap((g) => [
        { value: `-----${g.region}-----`, label: `-----${g.region}-----`, disabled: true },
        ...g.districts.map((d) => ({ value: d, label: d, disabled: false })),
      ]),
    []
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadPhoto = async (file: File, slot: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `kol-applications/${Date.now()}-${slot}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('public').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!form.publishPlatforms.length) throw new Error('請至少選擇一個發佈平台');
      if (!form.contentTopics.length) throw new Error('請至少選擇一個內容主題');
      if (!form.availableTimes.length) throw new Error('請至少選擇一個可參加活動時間');

      const photoUrls: string[] = [];
      if (photo1) photoUrls.push(await uploadPhoto(photo1, 'personal'));
      if (photo2) photoUrls.push(await uploadPhoto(photo2, 'work'));

      const primaryLink =
        form.instagram ||
        form.xiaohongshu ||
        form.facebook ||
        form.youtube ||
        form.tiktok ||
        form.openriceUrl ||
        form.blogUrl ||
        form.otherChannels ||
        '';
      const primaryFollowers =
        form.instagramFollowers ||
        form.xiaohongshuFollowers ||
        form.facebookLikes ||
        form.youtubeSubscribers ||
        form.tiktokFollowers ||
        form.blogSubscribers ||
        form.otherFollowers ||
        form.openriceLevel ||
        '';

      const { error: dbError } = await supabase.from('kol_applications').insert({
        name: form.name,
        title: form.title,
        phone: form.phone,
        email: form.email,
        age_range: form.ageRange,
        birth_month: form.birthMonth,
        residence_district: form.residenceDistrict || null,
        work_district: form.workDistrict || null,
        region: form.residenceDistrict || form.workDistrict || '',
        platform_name: form.publishPlatforms.join(', '),
        platform_link: primaryLink,
        followers: primaryFollowers,
        content_direction: form.contentTopics.join(', '),
        experience: form.trialExperience,
        introduction: [
          `試用頻率：${form.trialFrequency}`,
          `合作興趣：${form.cooperationInterests.join('、') || '—'}`,
          `影片分享：${form.videoSharing}`,
          `可參加時間：${form.availableTimes.join('、')}`,
        ].join('\n'),
        photo_urls: photoUrls,
        form_data: {
          title: form.title,
          age_range: form.ageRange,
          birth_month: form.birthMonth,
          residence_district: form.residenceDistrict,
          work_district: form.workDistrict,
          trial_frequency: form.trialFrequency,
          trial_experience: form.trialExperience,
          publish_platforms: form.publishPlatforms,
          platforms: {
            openrice_url: form.openriceUrl,
            openrice_level: form.openriceLevel,
            instagram: form.instagram,
            instagram_followers: form.instagramFollowers,
            facebook: form.facebook,
            facebook_likes: form.facebookLikes,
            xiaohongshu: form.xiaohongshu,
            xiaohongshu_followers: form.xiaohongshuFollowers,
            youtube: form.youtube,
            youtube_subscribers: form.youtubeSubscribers,
            tiktok: form.tiktok,
            tiktok_followers: form.tiktokFollowers,
            blog_url: form.blogUrl,
            blog_subscribers: form.blogSubscribers,
            other_channels: form.otherChannels,
            other_followers: form.otherFollowers,
          },
          content_topics: form.contentTopics,
          cooperation_interests: form.cooperationInterests,
          video_sharing: form.videoSharing,
          available_times: form.availableTimes,
          club_interest: form.clubInterest,
          model_experience: form.modelExperience,
          camera_experience: form.cameraExperience,
          live_interest: form.liveInterest,
        },
      });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || '提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section id="application-form" className="py-16 sm:py-20 bg-gradient-to-b from-white to-teal-50/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">申請已提交！</h2>
          <p className="text-base text-slate-600 leading-relaxed mb-3">
            提交後，我們的專員將盡快與你聯繫及對接合作詳情。
          </p>
          <p className="text-sm text-slate-500">
            如資料合適，我們將進一步與你溝通合作方向、內容形式與後續安排。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="application-form" className="py-16 sm:py-20 bg-gradient-to-b from-white to-teal-50/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">申請加入</h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            請填寫以下資料，我們將盡快安排專員與你聯繫。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 lg:p-10 space-y-8"
        >
          {/* Basic info */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">基本資料</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>姓名</FieldLabel>
                <input className={inputClass} required value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="你的姓名" />
              </div>
              <div>
                <FieldLabel required>稱謂</FieldLabel>
                <select className={inputClass} required value={form.title} onChange={(e) => setField('title', e.target.value)}>
                  <option value="">請選擇</option>
                  {TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>電郵地址</FieldLabel>
                <input className={inputClass} type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="example@email.com" />
              </div>
              <div>
                <FieldLabel required>聯絡電話</FieldLabel>
                <input className={inputClass} type="tel" required value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="例：9123 4567" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel required>年齡層</FieldLabel>
                <select className={inputClass} required value={form.ageRange} onChange={(e) => setField('ageRange', e.target.value)}>
                  <option value="">請選擇</option>
                  {AGE_RANGES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel required>出生月份（通知您生日優惠）</FieldLabel>
                <select className={inputClass} required value={form.birthMonth} onChange={(e) => setField('birthMonth', e.target.value)}>
                  <option value="">請選擇</option>
                  {BIRTH_MONTHS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel>居住地區（方便體驗安排）</FieldLabel>
                <select className={inputClass} value={form.residenceDistrict} onChange={(e) => setField('residenceDistrict', e.target.value)}>
                  <option value="">請選擇</option>
                  {districtOptions.map((d) => (
                    <option key={`${d.label}-${d.value}`} value={d.disabled ? '' : d.value} disabled={d.disabled}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>工作地區（方便體驗安排）</FieldLabel>
                <select className={inputClass} value={form.workDistrict} onChange={(e) => setField('workDistrict', e.target.value)}>
                  <option value="">請選擇</option>
                  <option value="待業中">待業中</option>
                  {districtOptions.map((d) => (
                    <option key={`work-${d.label}-${d.value}`} value={d.disabled ? '' : d.value} disabled={d.disabled}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">試用與內容經驗</h3>

            <div>
              <FieldLabel required>KOL 試用／體驗時間</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRIAL_FREQUENCY.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="trialFrequency"
                      required
                      checked={form.trialFrequency === opt}
                      onChange={() => setField('trialFrequency', opt)}
                      className="text-teal-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>試用＋撰寫評測經驗</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRIAL_EXPERIENCE.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="trialExperience"
                      required
                      checked={form.trialExperience === opt}
                      onChange={() => setField('trialExperience', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>內容發佈平台</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PUBLISH_PLATFORMS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="checkbox"
                      checked={form.publishPlatforms.includes(opt)}
                      onChange={() => setField('publishPlatforms', toggleValue(form.publishPlatforms, opt))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Platform links */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">社交平台連結</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel>Openrice 食家連結</FieldLabel>
                <input
                  className={inputClass}
                  value={form.openriceUrl}
                  onChange={(e) => setField('openriceUrl', e.target.value)}
                  placeholder="https://www.openrice.com/..."
                />
              </div>
              <div>
                <FieldLabel>Openrice 食家評級</FieldLabel>
                <select
                  className={inputClass}
                  value={form.openriceLevel}
                  onChange={(e) => setField('openriceLevel', e.target.value)}
                >
                  <option value="">請選擇</option>
                  {OPENRICE_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Instagram 帳號</FieldLabel>
                <input className={inputClass} value={form.instagram} onChange={(e) => setField('instagram', e.target.value)} placeholder="@username 或連結" />
              </div>
              <div>
                <FieldLabel>Instagram Follower 數目</FieldLabel>
                <input className={inputClass} value={form.instagramFollowers} onChange={(e) => setField('instagramFollowers', e.target.value)} placeholder="例：5000" />
              </div>
              <div>
                <FieldLabel>Facebook 網頁連結</FieldLabel>
                <input className={inputClass} value={form.facebook} onChange={(e) => setField('facebook', e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <FieldLabel>Facebook Page 讚好數目</FieldLabel>
                <input className={inputClass} value={form.facebookLikes} onChange={(e) => setField('facebookLikes', e.target.value)} />
              </div>
              <div>
                <FieldLabel>小紅書</FieldLabel>
                <input className={inputClass} value={form.xiaohongshu} onChange={(e) => setField('xiaohongshu', e.target.value)} />
              </div>
              <div>
                <FieldLabel>小紅書粉絲人數</FieldLabel>
                <input className={inputClass} value={form.xiaohongshuFollowers} onChange={(e) => setField('xiaohongshuFollowers', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Youtube Channels</FieldLabel>
                <input className={inputClass} value={form.youtube} onChange={(e) => setField('youtube', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Youtube Subscriber 數目</FieldLabel>
                <input className={inputClass} value={form.youtubeSubscribers} onChange={(e) => setField('youtubeSubscribers', e.target.value)} />
              </div>
              <div>
                <FieldLabel>TikTok</FieldLabel>
                <input className={inputClass} value={form.tiktok} onChange={(e) => setField('tiktok', e.target.value)} />
              </div>
              <div>
                <FieldLabel>TikTok Follower 數目</FieldLabel>
                <input className={inputClass} value={form.tiktokFollowers} onChange={(e) => setField('tiktokFollowers', e.target.value)} />
              </div>
              <div>
                <FieldLabel>個人網址 / Blog</FieldLabel>
                <input className={inputClass} value={form.blogUrl} onChange={(e) => setField('blogUrl', e.target.value)} />
              </div>
              <div>
                <FieldLabel>個人網址訂閱人數</FieldLabel>
                <input className={inputClass} value={form.blogSubscribers} onChange={(e) => setField('blogSubscribers', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Other Channels</FieldLabel>
                <input className={inputClass} value={form.otherChannels} onChange={(e) => setField('otherChannels', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Other Follower 數目</FieldLabel>
                <input className={inputClass} value={form.otherFollowers} onChange={(e) => setField('otherFollowers', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">內容主題</h3>
            <div>
              <FieldLabel required>Blog / 內容的主題</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONTENT_TOPICS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="checkbox"
                      checked={form.contentTopics.includes(opt)}
                      onChange={() => setField('contentTopics', toggleValue(form.contentTopics, opt))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Cooperation */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-200 to-teal-300" />
              <h3 className="text-base sm:text-lg font-bold text-teal-700 tracking-wide shrink-0">
                合作方案
              </h3>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-teal-200 to-teal-300" />
            </div>

            <div>
              <FieldLabel>合作層面：上鏡機會、媒體訪問、品牌活動，你有興趣嗎？（可選多項）</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COOPERATION_INTERESTS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="checkbox"
                      checked={form.cooperationInterests.includes(opt)}
                      onChange={() => setField('cooperationInterests', toggleValue(form.cooperationInterests, opt))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>影片／內容推廣（讓更多人收看你的內容）</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VIDEO_SHARING.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="videoSharing"
                      required
                      checked={form.videoSharing === opt}
                      onChange={() => setField('videoSharing', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>可以參加體驗活動時間（可選多於一項）</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_TIMES.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="checkbox"
                      checked={form.availableTimes.includes(opt)}
                      onChange={() => setField('availableTimes', toggleValue(form.availableTimes, opt))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Beauty KOL Club 分享美容文化／賺取合作機會</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CLUB_INTEREST.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="clubInterest"
                      checked={form.clubInterest === opt}
                      onChange={() => setField('clubInterest', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>模特兒 Model 經驗</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODEL_EXPERIENCE.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="modelExperience"
                      checked={form.modelExperience === opt}
                      onChange={() => setField('modelExperience', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>上鏡經驗</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAMERA_EXPERIENCE.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="cameraExperience"
                      checked={form.cameraExperience === opt}
                      onChange={() => setField('cameraExperience', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>有興趣成為 Facebook / Instagram Live 主播</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LIVE_INTEREST.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 rounded-lg border border-gray-100 px-3 py-2 cursor-pointer hover:bg-teal-50/50">
                    <input
                      type="radio"
                      name="liveInterest"
                      required
                      checked={form.liveInterest === opt}
                      onChange={() => setField('liveInterest', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">相片</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel>[相片1] 個人近照</FieldLabel>
                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  onChange={(e) => setPhoto1(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <FieldLabel>[相片2] 工作時相片（方便安排拍攝上鏡機會）</FieldLabel>
                <input
                  type="file"
                  accept="image/*"
                  className={inputClass}
                  onChange={(e) => setPhoto2(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              size="lg"
            >
              {submitting ? '提交中...' : '提交申請'}
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 pt-2">
            提交後，我們的專員將盡快與你聯繫及對接合作詳情。
          </p>
        </form>
      </div>
    </section>
  );
}
