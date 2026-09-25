import React from 'react';
import { Phone, CalendarCheck, Wind, MessageCircle } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';

export const CTASection: React.FC = () => {
  const whatsappUrl = `https://wa.me/${BRAND.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(
    BRAND.whatsappBookingMessage
  )}`;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-700 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Subtle cooling background graphics */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-6 right-12 opacity-10 hidden sm:block">
            <Wind className="w-48 h-48" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-sky-100 text-xs font-semibold backdrop-blur-sm">
              Bangalore On-Demand AC Specialists
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready for Clean, Powerful Cooling?
            </h2>
            <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
              Book your AC service or repair in under a minute. Verified technicians, upfront estimates, and convenient scheduling slots across Bangalore.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Button
                href="/book-service"
                size="lg"
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-100 border-white shadow-lg"
                leftIcon={<CalendarCheck className="w-4 h-4 text-sky-600" />}
              >
                Book a Service
              </Button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Book on WhatsApp</span>
              </a>

              <a
                href={`tel:${BRAND.contact.phone}`}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all backdrop-blur-sm border border-white/20"
              >
                <Phone className="w-4 h-4" />
                <span>{BRAND.contact.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
