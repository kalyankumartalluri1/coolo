import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Coolo AC Support',
  description: 'Contact Coolo for AC repair, servicing, installation and cooling service questions across our 9 service cities.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
