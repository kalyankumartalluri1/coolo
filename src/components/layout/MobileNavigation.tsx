'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Phone, X } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { SERVICES } from '@/lib/constants/services';
import { Button } from '@/components/ui/Button';

export function MobileNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
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
          onClick={() => setMenuOpen((open) => !open)}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation-drawer" aria-label="Mobile navigation" className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            <Link href="/" onClick={closeMenu} className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg">
              Home
            </Link>
            <Link href="/services" onClick={closeMenu} className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg">
              All Services
            </Link>
            <div className="pl-4 space-y-1">
              {SERVICES.slice(0, 4).map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`} onClick={closeMenu} className="block py-1 text-sm text-slate-600 hover:text-sky-600">
                  {service.name}
                </Link>
              ))}
            </div>
            <Link href="/areas" onClick={closeMenu} className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg">
              Service Areas
            </Link>
            <Link href="/about" onClick={closeMenu} className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg">
              About Coolo
            </Link>
            <Link href="/contact" onClick={closeMenu} className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg">
              Contact Us
            </Link>
            <Link href="/portal/login" onClick={closeMenu} className="block px-3 py-2 text-base font-semibold text-sky-700 hover:bg-sky-50 rounded-lg">
              Sign in / Create account
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button href="/book-service" variant="primary" className="w-full" onClick={closeMenu}>
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
        </nav>
      )}
    </>
  );
}
