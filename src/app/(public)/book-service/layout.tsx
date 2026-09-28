import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Book AC Service in Bangalore',
  description: 'Schedule AC repair, servicing, deep cleaning or installation in Bangalore with a convenient service window.',
  path: '/book-service',
});

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}
