import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { SERVICE_CITIES } from '@/lib/constants/areas';
import { CTASection } from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'Cities We Serve | COOLO Coverage',
  description:
    'Coolo provides AC and cooling services across major Indian cities including Bangalore, Hyderabad, Delhi, Guntur, Pune, Mumbai, Chennai, and Kolkata.',
};

export default function AreasPage() {
  return (
    <div className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            Multi-City Service Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Cities We Serve
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            We keep one central contact point for customer support and service coordination across major Indian cities instead of breaking each city into smaller sub-areas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {SERVICE_CITIES.map((city) => (
            <div
              key={city.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {city.areaName}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {city.state}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  AC repair, deep cleaning, gas refill, installation and preventive maintenance with one central coordination desk.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active City
                </span>

                <Link
                  href={`/book-service?area=${encodeURIComponent(city.areaName)}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                >
                  <span>Book in {city.areaName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Centralized Support
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                One phone number handles customer intake, dispatch coordination, and service follow-up across all cities.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Verified Service Teams
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Background-checked technicians and professional field support for each city covered by COOLO.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Single Point of Contact
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Customers can reach the same centralized service desk via phone or WhatsApp in every supported city.
              </p>
            </div>
          </div>
        </div>

        <CTASection />
      </div>
    </div>
  );
}
