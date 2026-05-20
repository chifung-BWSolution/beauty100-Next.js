import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://www.beauty100-magazine.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/login',
          '/staff-login',
          '/member-login',
          '/salon-edit',
          '/salon-profile',
          '/settings',
          '/application-status',
          '/merchant-onboarding',
          '/merchant-signup',
          '/claim-salon',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
