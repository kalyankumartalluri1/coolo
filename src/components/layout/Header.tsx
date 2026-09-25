'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Menu, X, Wind, ChevronDown } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { SERVICES } from '@/lib/constants/services';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Wind className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  {BRAND.name}
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                {BRAND.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                type="button"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              <div className="hidden group-hover:block absolute left-0 top-full pt-2 w-72">
                <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 space-y-1">
                  {SERVICES.slice(0, 6).map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
                    >
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Starting from ₹{service.startingPrice}
                      </div>
                    </Link>
                  ))}
                  <div className="pt-1 border-t border-slate-100">
                    <Link
                      href="/services"
                      className="block px-3 py-1.5 text-xs font-semibold text-sky-600 hover:underline"
                    >
                      View All Services →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/areas"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              Service Areas
            </Link>

            <Link
              href="/about"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${BRAND.contact.phone}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-sky-600 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>{BRAND.contact.phoneDisplay}</span>
            </a>

            <Button href="/book-service" size="sm" variant="primary">
              Book a Service
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={`tel:${BRAND.contact.phone}`}
              className="p-2 text-slate-700 rounded-lg border border-slate-200"
              aria-label="Call Coolo"
            >
              <Phone className="w-4 h-4 text-sky-600" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
            >
              All Services
            </Link>
            <div className="pl-4 space-y-1">
              {SERVICES.slice(0, 4).map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 text-sm text-slate-600 hover:text-sky-600"
                >
                  • {s.name}
                </Link>
              ))}
            </div>
            <Link
              href="/areas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
            >
              Bangalore Service Areas
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
            >
              About Coolo
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
            >
              Contact Us
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button
              href="/book-service"
              variant="primary"
              className="w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book a Service Now
            </Button>
            <a
              href={`https://wa.me/${BRAND.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(BRAND.whatsappBookingMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
