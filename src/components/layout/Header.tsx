'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Menu, X, Wind, ChevronDown, User, LogOut, LayoutDashboard, Wrench, UserCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { SERVICES } from '@/lib/constants/services';
import { Button } from '@/components/ui/Button';
import {
  CooloSession,
  getClientSession,
  roleBadgeColor,
  roleLabel,
} from '@/lib/auth/session';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [session, setSession] = useState<CooloSession | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => setSession(getClientSession()));
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setUserMenuOpen(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setSession(null);
    setSigningOut(false);
    router.push('/');
    router.refresh();
  }

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
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              Cities
            </Link>

            <Link
              href="/track"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              Track Booking
            </Link>

            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 180)}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left leading-tight pr-1">
                    <div className="text-xs font-semibold text-slate-900">
                      {session.name || 'Account'}
                    </div>
                    <div
                      className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadgeColor(session.role)}`}
                    >
                      {roleLabel(session.role)}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 w-64 z-50" role="menu">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {session.name || 'Coolo User'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {session.email || ''}
                        </div>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      {(session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Portal
                        </Link>
                      )}
                      {session.role === 'TECHNICIAN' && (
                        <Link
                          href="/technician"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                        >
                          <Wrench className="w-4 h-4" />
                          Technician Jobs
                        </Link>
                      )}
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={signingOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-60"
                        >
                          <LogOut className="w-4 h-4" />
                          {signingOut ? 'Signing out…' : 'Sign Out'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-sky-600 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}

            <a
              href={`tel:${BRAND.contact.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-sky-600 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
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
              Cities We Serve
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
            >
              Track Booking Status
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
            {session ? (
              <>
                <div className="px-3 py-2 border-y border-slate-100 my-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {session.name || 'Coolo User'}
                  </div>
                  <div
                    className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadgeColor(session.role)}`}
                  >
                    {roleLabel(session.role)}
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-600 rounded-lg"
                >
                  My Account
                </Link>
                {(session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-amber-700 hover:bg-amber-50 rounded-lg"
                  >
                    Admin Portal
                  </Link>
                )}
                {session.role === 'TECHNICIAN' && (
                  <Link
                    href="/technician"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg"
                  >
                    Technician Jobs
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleSignOut();
                  }}
                  disabled={signingOut}
                  className="w-full text-left block px-3 py-2 text-base font-semibold text-rose-600 hover:bg-rose-50 rounded-lg disabled:opacity-60"
                >
                  {signingOut ? 'Signing out…' : 'Sign Out →'}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-sky-600 hover:bg-sky-50 rounded-lg"
              >
                Sign In to Account →
              </Link>
            )}
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
