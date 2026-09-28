import type { MetadataRoute } from 'next';
import { SERVICES } from '@/lib/constants/services';
import { ACTIVE_SERVICE_AREAS } from '@/lib/constants/areas';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const serviceUrls = SERVICES.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
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

  // One lightweight per-city entry points crawlers at each market we serve.
  // All links land on /areas — the canonical coverage page for every city.
  const areaUrls = ACTIVE_SERVICE_AREAS.map((area) => ({
    url: `${baseUrl}/areas#${encodeURIComponent(area.areaName)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...areaUrls, ...serviceUrls];
}
