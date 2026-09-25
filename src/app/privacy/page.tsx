import React from 'react';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Privacy Policy | COOLO',
  description: 'Coolo privacy policy regarding data collection, service bookings, and customer protection.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-black text-slate-900 mb-6">
        Privacy Policy
      </h1>
      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <p>
          At <strong>{BRAND.name}</strong> ({BRAND.legalName}), accessible from {BRAND.domain}, we are committed to safeguarding the personal privacy of our customers, technicians, and website visitors.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          1. Information We Collect
        </h3>
        <p>
          When you request or book an AC service through Coolo, we collect contact and operational information including your name, telephone number, email address, physical service address, and equipment details (such as AC type, brand, and observed problem description).
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          2. How We Use Your Information
        </h3>
        <p>
          We use this data strictly to schedule, fulfill, and verify cooling service jobs, dispatch certified technicians to your location, generate digital service records, and communicate service progress via SMS, WhatsApp, or phone call.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          3. Data Security & Storage
        </h3>
        <p>
          Your customer records are stored securely using industry-standard encrypted PostgreSQL infrastructure through Supabase with Row Level Security (RLS) policies. We do not sell, rent, or lease your personal information to third-party marketing companies.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          4. Contact Information
        </h3>
        <p>
          For queries concerning your personal data, contact us at <strong>{BRAND.contact.email}</strong>.
        </p>
      </div>
    </div>
  );
}
