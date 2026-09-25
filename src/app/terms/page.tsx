import React from 'react';
import type { Metadata } from 'next';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: 'Terms of Service | COOLO',
  description: 'Coolo terms of service covering bookings, diagnosis, warranties, and payment policies.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-black text-slate-900 mb-6">
        Terms of Service
      </h1>
      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <p>
          Welcome to <strong>{BRAND.name}</strong> ({BRAND.legalName}). By accessing our platform or booking an air conditioning service through {BRAND.domain}, you agree to these Terms of Service.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          1. Service Bookings & Inspection
        </h3>
        <p>
          Booking requests submitted online represent scheduling intent for a technician inspection visit. The initial diagnostic fee or routine service fee is communicated transparently. If additional repairs or replacement parts are required, the technician will present an itemized estimate for your authorization prior to commencement.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          2. Payment Terms
        </h3>
        <p>
          Coolo does not mandate advance online payments for standard booking visits. Payment is due upon completion of the service visit and post-service cooling performance check. We support UPI, Card, and Cash payments.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          3. Workmanship & Spares Warranty
        </h3>
        <p>
          Standard repair and servicing workmanship is covered under a dedicated warranty period specified on your digital service summary. Spare parts supplied by Coolo carry manufacturer or supplier warranty terms as noted during replacement.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">
          4. Jurisdiction
        </h3>
        <p>
          These terms are governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka.
        </p>
      </div>
    </div>
  );
}
