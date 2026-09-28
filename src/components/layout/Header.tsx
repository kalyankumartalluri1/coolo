import React from 'react';
import Link from 'next/link';
import { Phone, Wind, ChevronDown, LayoutDashboard } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { SERVICES } from '@/lib/constants/services';
import { Button } from '@/components/ui/Button';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { getPortalAccount } from '@/lib/auth/portal';

export const Header: React.FC = async () => {
  // Read session server-side — safe, cached per request via React cache()
  const account = await getPortalAccount();
  const user = account?.profile ?? null;

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
              <Link
                href="/services"
                className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </Link>

              <div className="hidden group-hover:block group-focus-within:block absolute left-0 top-full pt-2 w-72">
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
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Signed-in state */
              <Link
                href="/portal"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors group"
              >
                {/* Avatar initial */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold shrink-0">
                  {user.full_name.slice(0, 1).toUpperCase()}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-sky-700 max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {user.role.toLowerCase().replace('_', ' ')}
                  </span>
                </span>
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
              </Link>
            ) : (
              /* Signed-out state */
              <Link
                href="/portal/login"
                className="px-2 py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-sky-700"
              >
                Sign in
              </Link>
            )}

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

          <MobileNavigation user={user} />
        </div>
      </div>
    </header>
  );
};
