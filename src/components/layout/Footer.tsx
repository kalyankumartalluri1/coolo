import React from 'react';
import Link from 'next/link';
import { Wind, Phone, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { SERVICES } from '@/lib/constants/services';
import { BANGALORE_AREAS } from '@/lib/constants/areas';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Wind className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  {BRAND.name}
                </span>
                <p className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase">
                  {BRAND.tagline}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Technology-enabled air and cooling solutions for homes and businesses. Transparent diagnostics, certified technicians, and verified digital service records across Bangalore.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${BRAND.contact.phone}`} className="hover:text-white transition-colors">
                  {BRAND.contact.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${BRAND.contact.email}`} className="hover:text-white transition-colors">
                  {BRAND.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{BRAND.contact.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Cooling Services
            </h4>
            <ul className="space-y-2 text-xs">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bangalore Coverage Zones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Bangalore Service Zones
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
              {BANGALORE_AREAS.slice(0, 10).map((area) => (
                <li key={area.id}>
                  <Link
                    href="/areas"
                    className="text-slate-400 hover:text-sky-400 transition-colors"
                  >
                    {area.areaName}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <Link href="/areas" className="text-xs font-semibold text-sky-400 hover:underline">
                View all Bangalore areas →
              </Link>
            </div>
          </div>

          {/* Quick Links & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-slate-400 hover:text-sky-400 transition-colors">
                  About Coolo
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/book-service" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Book a Visit
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-sky-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>

            <div className="pt-3">
              <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent diagnostics & verified technicians</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} {BRAND.name} ({BRAND.legalName}). All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Independent cooling solutions and AC service provider. Not affiliated with any OEM brand names mentioned for compatibility reference.
          </p>
        </div>
      </div>
    </footer>
  );
};
