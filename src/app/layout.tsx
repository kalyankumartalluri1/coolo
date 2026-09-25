import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileActionBar } from '@/components/layout/MobileActionBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coolo.in'),
  title: {
    default: 'COOLO — Air & Cooling Solutions | AC Services Across Major Indian Cities',
    template: '%s | COOLO Air & Cooling Solutions',
  },
  description:
    'Reliable AC repair, servicing, deep cleaning, installation and cooling solutions across Bangalore, Hyderabad, Delhi, Guntur, Pune, Mumbai, Chennai and Kolkata.',
  keywords: [
    'AC service Bangalore',
    'AC repair Hyderabad',
    'AC service Delhi',
    'AC service Kolkata',
    'Coolo',
    'Air & Cooling Solutions',
  ],
  authors: [{ name: 'Coolo' }],
  creator: 'Coolo Air & Cooling Solutions',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://coolo.in',
    siteName: 'COOLO',
    title: 'COOLO — Air & Cooling Solutions at Your Doorstep',
    description:
      'Book reliable AC repair, servicing, cleaning and installation from verified local technicians across major Indian cities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COOLO — Air & Cooling Solutions',
    description:
      'Book reliable AC repair, servicing, cleaning and installation from verified local technicians across major Indian cities.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <head>
        <link rel="canonical" href="https://coolo.in" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
