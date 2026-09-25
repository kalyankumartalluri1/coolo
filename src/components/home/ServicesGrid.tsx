import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Sparkles,
  Droplets,
  ShieldCheck,
  ArrowDownCircle,
  Gauge,
  CalendarCheck,
  Building2,
  ArrowRight,
  Check,
} from 'lucide-react';
import { SERVICES } from '@/lib/constants/services';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Icon mapping helper
const getServiceIcon = (iconName: string) => {
  const iconProps = { className: 'w-6 h-6 stroke-[2]' };
  switch (iconName) {
    case 'Wrench':
      return <Wrench {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'Droplets':
      return <Droplets {...iconProps} />;
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'ArrowDownCircle':
      return <ArrowDownCircle {...iconProps} />;
    case 'Gauge':
      return <Gauge {...iconProps} />;
    case 'CalendarCheck':
      return <CalendarCheck {...iconProps} />;
    case 'Building2':
      return <Building2 {...iconProps} />;
    default:
      return <Wrench {...iconProps} />;
  }
};

export const ServicesGrid: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50/50" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            Specialized Cooling Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Residential & Commercial AC Services
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Professional air conditioning services performed by certified technicians using calibrated diagnostic tools and genuine spares.
          </p>
        </div>

        {/* Services Grid (8 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <Card
              key={service.slug}
              hoverEffect
              className="flex flex-col justify-between relative group"
            >
              <div>
                {/* Header with Icon & Pricing */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors duration-200 shadow-xs">
                    {getServiceIcon(service.iconName)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Starting from
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      ₹{service.startingPrice}
                    </span>
                  </div>
                </div>

                {/* Title & Short Description */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {service.shortDescription}
                </p>

                {/* Features list */}
                <ul className="mt-4 space-y-1.5 pt-3 border-t border-slate-100">
                  {service.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/services/${service.slug}`}
                  className="text-xs font-semibold text-slate-600 hover:text-sky-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Button
                  href={`/book-service?service=${service.slug}`}
                  size="sm"
                  variant="primary"
                  className="text-xs"
                >
                  Book Service
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Commercial Banner callout */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Commercial & Corporate Cooling
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Looking for Corporate AMC or Multi-Unit Servicing?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              We manage office chillers, cassette AC networks, and server room climate control with custom SLA uptime agreements.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button href="/services/commercial-ac" variant="outline" className="text-xs">
              Commercial AC
            </Button>
            <Button href="/contact" variant="primary" className="text-xs">
              Request Corporate Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
