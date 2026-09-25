import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ArrowRight, Phone, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Page Not Found — COOLO Air & Cooling Solutions',
  description: 'The page you are looking for does not exist. Explore our AC repair, servicing and cooling solutions in Bangalore.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg mx-auto">
        {/* Snowflake visual */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-50 to-cyan-100 border border-sky-200/60 flex items-center justify-center shadow-lg">
              <Snowflake className="w-14 h-14 text-sky-500" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xl font-black text-slate-800">
              ?
            </div>
          </div>
        </div>

        {/* Status code */}
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-3">
          Error 404 — Page Not Found
        </p>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
          Looks like we&apos;ve lost this page
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          The page you&apos;re looking for may have been moved or no longer exists. Let&apos;s get you back to cool comfort — explore our services or book a repair.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button href="/" variant="primary" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Back to Homepage
          </Button>
          <Button href="/services" variant="outline" size="lg">
            View All Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Quick links */}
        <div className="border-t border-slate-100 pt-8">
          <p className="text-xs text-slate-500 mb-4 font-medium">Or navigate to:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Book a Service', href: '/book-service' },
              { label: 'AC Repair', href: '/services/ac-repair' },
              { label: 'AC Servicing', href: '/services/ac-service' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'Service Areas', href: '/areas' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-block text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 px-3 py-1.5 rounded-full transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Phone CTA */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 inline-flex items-center gap-3">
          <Phone className="w-5 h-5 text-sky-600 shrink-0" />
          <div className="text-left">
            <p className="text-xs text-slate-500">Need immediate AC help?</p>
            <a href={`tel:${BRAND.contact.phone}`} className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors">
              {BRAND.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
