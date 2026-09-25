import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, HeartHandshake, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About COOLO — Air & Cooling Solutions',
  description:
    'Learn about Coolo: A technology-enabled cooling platform bringing transparent diagnostics, verified technicians, and digital accountability to Bangalore.',
};

export default function AboutPage() {
  return (
    <div className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            About Our Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Cooling Service Built on Transparency & Quality
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-4 leading-relaxed">
            Coolo is a technology-enabled air and cooling solutions company founded in Bangalore. We are reimagining how homes and businesses maintain their climate comfort through verified workmanship, upfront diagnostics, and digital service records.
          </p>
        </div>

        {/* Brand Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Verified Technical Standards
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We eliminate guesswork. Our technicians follow standardized diagnostic protocols with calibrated manifold gauges, vacuum pumps, and electrical multimeters.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Customer First Transparency
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No hidden fees, no fake gas leak claims, and no pressure. Every recommendation is accompanied by an itemized estimate that requires your explicit consent.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Digital Service Heritage
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Track your service history, before/after photos, replaced part serials, and warranty documents securely in one centralized digital interface.
            </p>
          </div>
        </div>

        {/* Vision Narrative */}
        <div className="bg-gradient-to-tr from-slate-900 to-sky-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400">
              <Target className="w-4 h-4" />
              <span>Our Vision</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              From AC Service to Full Climate & Air Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Coolo begins with Bangalore residential and commercial AC maintenance, but our architecture is designed for full air management: ventilation, indoor air quality filtration, heat load balancing, and smart cooling systems.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Button href="/services" variant="outline" className="text-xs">
              Explore Our Services
            </Button>
            <Button href="/book-service" variant="primary" className="text-xs">
              Book a Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
