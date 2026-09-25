import React from 'react';
import { Hero } from '@/components/home/Hero';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { WhyChooseCoolo } from '@/components/home/WhyChooseCoolo';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ServiceAreasPreview } from '@/components/home/ServiceAreasPreview';
import { FAQSection } from '@/components/home/FAQSection';
import { CTASection } from '@/components/home/CTASection';
import { BRAND } from '@/lib/constants/brand';

export default function HomePage() {
  // Local Business Structured Data for Bangalore Local SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: 'https://coolo.in',
    telephone: BRAND.contact.phone,
    email: BRAND.contact.email,
    description:
      'Reliable AC repair, servicing, deep cleaning, and cooling solutions in Bangalore, Karnataka.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '21:00',
      },
    ],
    priceRange: '₹399 - ₹4999',
    areaServed: {
      '@type': 'City',
      name: 'Bangalore',
    },
  };

  return (
    <>
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />
      <ServicesGrid />
      <WhyChooseCoolo />
      <HowItWorks />
      <ServiceAreasPreview />
      <FAQSection />
      <CTASection />
    </>
  );
}
