import type { MetadataRoute } from 'next';
import { SERVICES } from '@/lib/constants/services';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const serviceUrls = SERVICES.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book-service`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/areas`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...serviceUrls];
}
