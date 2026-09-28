import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { Card } from '@/components/ui/Card';
import { ContactForm } from '@/components/contact/ContactForm';
import { getPortalAccount } from '@/lib/auth/portal';
import { createPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = createPageMetadata({
  title: 'Contact Coolo Support',
  description: 'Get in touch with Coolo for AC service queries, corporate quotes, AMC packages, or technician support across our 9 service cities.',
  path: '/contact',
});

export default async function ContactPage() {
  const account = await getPortalAccount();
  const profile = account?.profile ?? null;
  // Profiles may store +91-prefixed numbers; the form input expects 10 digits.
  const initialMobile = profile?.mobile ? profile.mobile.replace(/\D/g, '').slice(-10) : '';

  return (
    <div className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Contact Coolo Support
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Have questions regarding residential AC service, corporate quotes, AMC packages, or technician arrival? Our support team is here to assist across all 9 service cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left Column: Business details */}
          <div className="md:col-span-5 space-y-6">
            <Card className="p-6 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Operational Office
              </h2>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {BRAND.name} ({BRAND.tagline})
                    </span>
                    <span>Bangalore, Karnataka, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Phone Call Support</span>
                    <a href={`tel:${BRAND.contact.phone}`} className="text-sky-600 hover:underline">
                      {BRAND.contact.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Email Inquiries</span>
                    <a href={`mailto:${BRAND.contact.email}`} className="text-sky-600 hover:underline">
                      {BRAND.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">Working Hours</span>
                    <span>{BRAND.contact.workingHours}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <a
                  href={`https://wa.me/${BRAND.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(BRAND.whatsappBookingMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column: Contact Form — pre-filled when signed in */}
          <div className="md:col-span-7">
            <ContactForm
              initialName={profile?.full_name ?? ''}
              initialEmail={profile?.email ?? ''}
              initialMobile={initialMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
