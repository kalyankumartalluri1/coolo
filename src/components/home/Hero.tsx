import React from 'react';
import { Phone, ShieldCheck, CheckCircle2, Clock, FileText, Sparkles, Snowflake } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';
import { QuickBookingWidget } from './QuickBookingWidget';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden cooling-hero-gradient pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/60">
      {/* Background cooling ambient orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-teal-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Trust & Action */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200/80 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping" />
              <span className="text-xs font-semibold text-sky-800">
                Bangalore’s Dedicated Air & Cooling Specialists
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              AC & Cooling Services at{' '}
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Your Doorstep
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Book reliable AC repair, servicing, cleaning and installation from trusted local technicians. Upfront diagnostics, transparent pricing, and digital job reports across Bangalore.
            </p>

            {/* Trust Indicators Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Verified technicians</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transparent service</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Convenient scheduling</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Digital service records</span>
              </div>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Button href="/book-service" size="lg" variant="primary">
                Book a Service
              </Button>
              <a
                href={`tel:${BRAND.contact.phone}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-300 shadow-xs hover:border-slate-400 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-sky-600" />
                <span>Call {BRAND.contact.phoneDisplay}</span>
              </a>
            </div>

            {/* Extra assurance stats */}
            <div className="pt-4 flex items-center gap-6 border-t border-slate-200/60 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-sky-500" />
                <span>Split, Window & Cassette</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>All Major AC Brands</span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Booking Widget */}
          <div className="lg:col-span-6">
            <QuickBookingWidget />
          </div>
        </div>
      </div>
    </section>
  );
};
