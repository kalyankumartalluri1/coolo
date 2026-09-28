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
    default: 'AC Services in Bangalore',
    template: '%s | COOLO Air & Cooling Solutions',
  },
  description:
    'Reliable AC repair, servicing, deep cleaning, installation and cooling solutions in Bangalore. Verified technicians, transparent pricing, and digital service records.',
  keywords: [
    'AC service Bangalore',
    'AC repair Bangalore',
    'AC cleaning Bangalore',
    'AC installation Bangalore',
    'AC gas charging Bangalore',
    'Coolo',
    'Air & Cooling Solutions',
  ],
  authors: [{ name: 'Coolo' }],
  creator: 'Coolo Air & Cooling Solutions',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'COOLO',
  },
  twitter: {
    card: 'summary_large_image',
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
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
