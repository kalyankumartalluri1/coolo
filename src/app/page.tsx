import React from 'react';
import { Hero } from '@/components/home/Hero';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { CostEstimator } from '@/components/home/CostEstimator';
import { WhyChooseCoolo } from '@/components/home/WhyChooseCoolo';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ServiceAreasPreview } from '@/components/home/ServiceAreasPreview';
import { FAQSection } from '@/components/home/FAQSection';
import { CTASection } from '@/components/home/CTASection';
import { BRAND } from '@/lib/constants/brand';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: 'https://coolo.in',
    telephone: BRAND.contact.phone,
    email: BRAND.contact.email,
    description:
      'Reliable AC repair, servicing, deep cleaning, and cooling solutions across major Indian cities including Bangalore, Hyderabad, Delhi, Pune and Chennai.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
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
    areaServed: [
      { '@type': 'City', name: 'Bangalore' },
      { '@type': 'City', name: 'Hyderabad' },
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'City', name: 'Pune' },
      { '@type': 'City', name: 'Chennai' },
      { '@type': 'City', name: 'Mumbai' },
      { '@type': 'City', name: 'Kolkata' },
      { '@type': 'City', name: 'Guntur' },
    ],
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
      <CostEstimator />
      <WhyChooseCoolo />
      <HowItWorks />
      <ServiceAreasPreview />
      <FAQSection />
      <CTASection />
    </>
  );
}
