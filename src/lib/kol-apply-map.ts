/** Shared mapping helpers for Beauty100 ↔ MPS kol_apply dual-write */

export type KolApplyFormPayload = {
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
  photoUrls: string[];
};

export function toInt(value?: string | null): number | null {
  if (!value) return null;
  const n = parseInt(String(value).replace(/[, ]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

export function buildBeauty100Row(form: KolApplyFormPayload) {
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

  const formData = {
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
  };

  return {
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
    photo_urls: form.photoUrls,
    form_data: formData,
  };
}

export function buildMpsKolApplyRow(form: KolApplyFormPayload) {
  const otherParts: string[] = [];
  if (form.tiktok) {
    otherParts.push(
      `TikTok: ${form.tiktok}${form.tiktokFollowers ? ` (${form.tiktokFollowers})` : ''}`
    );
  }
  if (form.otherChannels) otherParts.push(form.otherChannels);

  return {
    name: form.name,
    salutation: form.title || null,
    email: form.email,
    phone: form.phone,
    age_group: form.ageRange || null,
    birth_month: form.birthMonth || null,
    residence_area: form.residenceDistrict || null,
    work_area: form.workDistrict || null,
    blog_themes: form.contentTopics,
    specialty: form.contentTopics[0] || null,
    instagram_account: form.instagram || null,
    instagram_followers: toInt(form.instagramFollowers),
    facebook_url: form.facebook || null,
    facebook_likes: toInt(form.facebookLikes),
    xiaohongshu_url: form.xiaohongshu || null,
    xiaohongshu_followers: toInt(form.xiaohongshuFollowers),
    youtube_url: form.youtube || null,
    youtube_subscribers: toInt(form.youtubeSubscribers),
    openrice_url: form.openriceUrl || null,
    openrice_level: form.openriceLevel || null,
    blog_url: form.blogUrl || null,
    blog_subscribers: toInt(form.blogSubscribers),
    other_channels: otherParts.join(' | ') || null,
    other_followers: toInt(form.otherFollowers) ?? toInt(form.tiktokFollowers),
    publish_platforms: form.publishPlatforms.join(', ') || null,
    tasting_frequency: form.trialFrequency || null,
    tasting_experience: form.trialExperience || null,
    model_experience: form.modelExperience || null,
    on_camera_experience: form.cameraExperience || null,
    wine_club: form.clubInterest || null,
    cooperation_intent: form.cooperationInterests.join(', ') || null,
    available_times: form.availableTimes.join(', ') || null,
    video_blog_promo: form.videoSharing || null,
    facebook_live_interest: form.liveInterest || null,
    photo_url: form.photoUrls[0] || null,
    work_photo_url: form.photoUrls[1] || null,
    raw_payload: form,
    source: 'beauty100',
    audit_status: 'pending_review',
  };
}
