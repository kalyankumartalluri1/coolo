import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal', '/auth/', '/api/'],
      },
      // Aggressive AI/crawler bots that add no SEO value but consume crawl budget
      {
        userAgent: ['GPTBot', 'CCBot', 'anthropic-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
