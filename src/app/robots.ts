import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/portal', '/auth/', '/api/'],
    },
    sitemap: 'https://coolo.in/sitemap.xml',
  };
}
