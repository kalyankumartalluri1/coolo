import { Hero } from '@/components/home/Hero';
import { ServicesGrid } from '@/components/home/ServicesGrid';
import { WhyChooseCoolo } from '@/components/home/WhyChooseCoolo';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ServiceAreasPreview } from '@/components/home/ServiceAreasPreview';
import { FAQS, FAQSection } from '@/components/home/FAQSection';
import { CTASection } from '@/components/home/CTASection';
import { BRAND } from '@/lib/constants/brand';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'AC Repair and Service in Bangalore',
  description: 'Book trusted AC repair, servicing, deep cleaning and installation in Bangalore with transparent diagnostics and convenient scheduling.',
  path: '/',
});

export default function HomePage() {
  // Local Business Structured Data for Bangalore Local SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HVACBusiness',
        '@id': 'https://coolo.in/#business',
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
          postalCode: '560038',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 12.9716,
          longitude: 77.5946,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '21:00',
          },
        ],
        priceRange: '₹399 - ₹4999',
        areaServed: { '@type': 'City', name: 'Bangalore' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  return (
    <>
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
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
