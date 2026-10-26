import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://secondmind-aa.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/templates',
          '/community',
          '/roadmap',
          '/privacy',
          '/terms',
          '/login',
          '/signup',
          '/try',
          '/for/',
        ],
        disallow: [
          '/app',
          '/api/',
          '/auth/',
          '/guest',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
