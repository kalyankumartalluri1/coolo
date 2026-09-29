import React from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, CalendarCheck, LayoutDashboard } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { getPortalAccount } from '@/lib/auth/portal';
import { getSiteSettings } from '@/lib/catalog';

export const MobileActionBar: React.FC = async () => {
  const [account, settings] = await Promise.all([getPortalAccount(), getSiteSettings()]);
  const isSignedIn = Boolean(account);

  const whatsappUrl = `https://wa.me/${settings.whatsapp.replace('+', '')}?text=${encodeURIComponent(
    BRAND.whatsappBookingMessage
  )}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Call */}
        <a
          href={`tel:${settings.phone}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors active:scale-95"
          aria-label="Call Coolo"
        >
          <Phone className="w-4 h-4 text-sky-600 mb-0.5" />
          <span className="text-[11px] font-semibold">Call Now</span>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 transition-colors active:scale-95"
          aria-label="WhatsApp Coolo"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span className="text-[11px] font-semibold">WhatsApp</span>
        </a>

        {/* Book Now / My Bookings */}
        {isSignedIn ? (
          <Link
            href="/portal"
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/20 transition-colors active:scale-95"
            aria-label="My Bookings"
          >
            <LayoutDashboard className="w-4 h-4 text-white mb-0.5" />
            <span className="text-[11px] font-bold">My Bookings</span>
          </Link>
        ) : (
          <Link
            href="/book-service"
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/20 transition-colors active:scale-95"
            aria-label="Book Service"
          >
            <CalendarCheck className="w-4 h-4 text-white mb-0.5" />
            <span className="text-[11px] font-bold">Book Now</span>
          </Link>
        )}
      </div>
    </div>
  );
};
