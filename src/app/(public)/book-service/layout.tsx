import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Book AC Service — Bangalore & 8 More Cities',
  description: 'Schedule AC repair, servicing, deep cleaning or installation across 9 cities with a convenient 2-hour service window.',
  path: '/book-service',
});

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}
