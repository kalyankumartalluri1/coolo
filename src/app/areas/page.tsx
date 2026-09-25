import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { ACTIVE_SERVICE_AREAS } from '@/lib/constants/areas';
import { CTASection } from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'Service Cities | COOLO Coverage',
  description:
    'Coolo provides AC repair, installation and maintenance services across major Indian cities including Bangalore, Pune, Hyderabad, Chennai, Delhi NCR, and more.',
};

export default function AreasPage() {
  return (
    <div className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            City Service Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Cities We Serve
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Our certified cooling technicians are stationed across key metro cities to provide reliable service windows and transparent pricing.
          </p>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {ACTIVE_SERVICE_AREAS.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {area.areaName}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {area.state}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  Full residential and commercial AC repair, deep cleaning, gas charging and installation available.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Service City
                </span>

                <Link
                  href={`/book-service?area=${encodeURIComponent(area.areaName)}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                >
                  <span>Book in {area.areaName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Coverage Guarantees */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                2-Hour Arrival Windows
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Pick morning, afternoon, or evening slots with proactive technician updates.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Verified Local Specialists
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Background-checked technicians who know city-specific conditions and service requirements.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Expanding Across Cities
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Adding new metro and growth corridors every month as we expand service coverage.
              </p>
            </div>
          </div>
        </div>

        <CTASection />
      </div>
    </div>
  );
}
