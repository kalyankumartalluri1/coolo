import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { ACTIVE_SERVICE_AREAS } from '@/lib/constants/areas';

export const ServiceAreasPreview: React.FC = () => {
  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
              Coverage Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Cities We Serve
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Fast-response AC servicing and maintenance across key metro cities with local technician coverage.
            </p>
          </div>

          <Link
            href="/areas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
          >
            <span>View all service cities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ACTIVE_SERVICE_AREAS.map((area) => (
            <Link
              key={area.id}
              href={`/book-service?area=${encodeURIComponent(area.areaName)}`}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/40 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-sky-600">
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="truncate">{area.areaName}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                {area.state}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <span>
            Don&apos;t see your city listed? We are continuously expanding coverage to new metro and tier-2 service regions.
          </span>
          <Link
            href="/contact"
            className="font-semibold text-sky-600 hover:underline shrink-0"
          >
            Inquire for your city →
          </Link>
        </div>
      </div>
    </section>
  );
};
