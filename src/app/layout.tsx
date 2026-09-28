import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coolo.in'),
  title: {
    default: 'AC Services in Bangalore & 8 More Cities | COOLO',
    template: '%s | COOLO Air & Cooling Solutions',
  },
  description:
    'Reliable AC repair, servicing, deep cleaning, installation and cooling solutions across Bangalore, Pune, Mumbai, Delhi NCR and more. Verified technicians, transparent pricing, and digital service records.',
  applicationName: 'COOLO',
  keywords: [
    'AC service Bangalore',
    'AC repair Bangalore',
    'AC cleaning Bangalore',
    'AC installation Bangalore',
    'AC gas charging Bangalore',
    'AC service Pune',
    'AC service Mumbai',
    'AC service Delhi NCR',
    'AC service Hyderabad',
    'AC service Chennai',
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
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a192f' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
        {children}
      </body>
    </html>
  );
}
