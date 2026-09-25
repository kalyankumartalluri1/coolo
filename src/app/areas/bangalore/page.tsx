import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, CheckCircle2, Clock, ShieldCheck, Phone } from 'lucide-react';
import { SERVICE_CITIES } from '@/lib/constants/areas';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';
import { CTASection } from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'Bangalore AC Service | Centralized COOLO Support',
  description:
    'COOLO serves Bangalore through one central contact desk. No sub-city service areas are required—customers can book service quickly with a single support number.',
  alternates: {
    canonical: 'https://coolo.in/areas/bangalore',
  },
  openGraph: {
    title: 'Bangalore AC Service | COOLO Centralized Support',
    description:
      'Book AC service in Bangalore with one central support team and one phone number for customer support and dispatch coordination.',
    url: 'https://coolo.in/areas/bangalore',
  },
};

export default function BangaloreAreasPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BRAND.name,
    url: 'https://coolo.in/areas/bangalore',
    telephone: BRAND.contact.phone,
    description: 'AC and cooling service company serving Bangalore through a centralized support desk.',
    areaServed: [{ '@type': 'City', name: 'Bangalore' }],
  };

  return (
    <div className="pt-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/areas" className="hover:text-sky-600 transition-colors">Cities</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Bangalore</span>
        </nav>

        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/60">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              Bangalore, Karnataka
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Bangalore AC Service
            <span className="block bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent">
              Through One Central Contact
            </span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
            We do not split Bangalore into smaller sub-areas. Customers can call one central support number for booking, dispatch, and service coordination across the city.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Button href="/book-service" variant="primary" size="lg">
              Book a Service
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a
              href={`tel:${BRAND.contact.phone}`}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
            >
              <Phone className="w-4 h-4 text-sky-600" />
              Call {BRAND.contact.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div className="rounded-3xl bg-slate-900 text-white p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-3">Centralized Escalation</p>
            <h2 className="text-3xl font-black mb-3">One number for all Bangalore requests</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Whether the customer is in Whitefield, Indiranagar, Koramangala, Electronic City, Yelahanka, or any other part of Bangalore, they contact the same support desk and receive coordinated scheduling.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-sky-300">
              <Phone className="w-4 h-4" />
              {BRAND.contact.phoneDisplay}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">What this means</p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> No neighborhood-by-neighborhood booking form is required.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> One city-level service model keeps the customer journey simpler.</li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Dispatch and follow-up are managed through a single support team.</li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Other Cities We Serve</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SERVICE_CITIES.filter((city) => city.areaName !== 'Bangalore').map((city) => (
              <div key={city.id} className="bg-white border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 shadow-xs">
                {city.areaName}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
              title: 'Verified Technicians',
              desc: 'Every service visit is handled by trained, vetted professionals for Bangalore homes and offices.',
            },
            {
              icon: <Clock className="w-6 h-6 text-teal-600" />,
              title: '2-Hour Window',
              desc: 'Schedule a preferred arrival slot and receive confirmation before the technician reaches the site.',
            },
            {
              icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
              title: 'Transparent Pricing',
              desc: 'No hidden city-based split pricing—service coordination is simple, centralized, and clear.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <CTASection />
    </div>
  );
}
