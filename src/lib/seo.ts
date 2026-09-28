import type { Metadata } from 'next';

export const SITE_URL = 'https://coolo.in';

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
}

export function createPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const canonical = path === '/' ? '/' : path.replace(/\/$/, '');

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'COOLO',
      title,
      description,
      url: canonical,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
  };
}
