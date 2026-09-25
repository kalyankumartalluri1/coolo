import React from 'react';
import type { Metadata } from 'next';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { WhyChooseCoolo } from '@/components/home/WhyChooseCoolo';
import { CTASection } from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'AC & Cooling Services Catalog in Bangalore',
  description:
    'Explore our comprehensive cooling services: AC Repair, Deep Cleaning, Routine Servicing, Gas Refill, Installation, and Commercial HVAC in Bangalore.',
};

export default function ServicesPage() {
  return (
    <div className="pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
          Our Services Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
          Complete Air & Cooling Solutions
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3">
          Engineered cooling services for all AC types: Split, Window, Cassette, and Commercial HVAC units across Bangalore.
        </p>
      </div>

      <ServicesGrid />
      <WhyChooseCoolo />
      <CTASection />
    </div>
  );
}
