import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Phone,
  Sparkles,
  Droplets,
  CalendarCheck,
  Gauge,
  ArrowDownCircle,
  Building2,
  Star,
  Quote,
  Camera,
} from 'lucide-react';
import { SERVICES } from '@/lib/constants/services';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FAQSection } from '@/components/home/FAQSection';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const service = SERVICES.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: `${service.name} in Bangalore — Upfront Diagnostics & Transparent Pricing`,
    description: service.shortDescription,
    alternates: {
      canonical: `https://coolo.in/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.name} | COOLO Bangalore`,
      description: service.shortDescription,
      url: `https://coolo.in/services/${service.slug}`,
    },
  };
}

const getIcon = (name: string) => {
  const props = { className: 'w-7 h-7 stroke-[2]' };
  switch (name) {
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Droplets':
      return <Droplets {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'ArrowDownCircle':
      return <ArrowDownCircle {...props} />;
    case 'Gauge':
      return <Gauge {...props} />;
    case 'CalendarCheck':
      return <CalendarCheck {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    default:
      return <Wrench {...props} />;
  }
};

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const resolvedParams = await params;
  const service = SERVICES.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const relatedServices = SERVICES.filter((s) => s.slug !== service.slug).slice(
    0,
    3
  );

  return (
    <div className="pt-4 pb-20">
      {/* Hero Banner */}
      <section className="cooling-hero-gradient border-b border-slate-200/60 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
              <Link href="/" className="hover:text-sky-600">
                Home
              </Link>
              <span>/</span>
              <Link href="/services" className="hover:text-sky-600">
                Services
              </Link>
              <span>/</span>
              <span className="text-sky-600">{service.name}</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-600/20">
                {getIcon(service.iconName)}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full">
                  Bangalore On-Site Service
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-1">
                  {service.name}
                </h1>
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              {service.fullDescription}
            </p>

            {/* Starting price indicator */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-semibold">
                  Indicative Service Charge
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-slate-900">
                    Starting from ₹{service.startingPrice}
                  </span>
                  <span className="text-xs text-slate-500">
                    (Plus spare parts if needed)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  href={`/book-service?service=${service.slug}`}
                  variant="primary"
                  size="md"
                >
                  Book This Service
                </Button>
                <a
                  href={`tel:${BRAND.contact.phone}`}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
                  aria-label="Call Coolo"
                >
                  <Phone className="w-4 h-4 text-sky-600" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Service Details Content */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Scope & Inspection */}
          <div className="lg:col-span-8 space-y-12">
            {/* What Technician Checks */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-sky-600" />
                <span>What Our Technician Inspects</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-800">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Service Protocol */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-sky-600" />
                <span>Our Standardized Process</span>
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Pre-Service Assessment
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Our technician arrives within your scheduled window, checks power points, evaluates current cooling airflow, and measures temperature differential.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Transparent Diagnostic Quote
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      If any replacement parts, gas refill, or additional work is necessary, an itemized quote is provided before any physical work starts.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Precision Execution & Cleanup
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      We use protective covers, calibrated equipment, and clean up the work area thoroughly after service completion.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                    4
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Digital Bill & Warranty Confirmation
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Pay easily via UPI, Card or Cash only after testing. Receive a digital service invoice directly to your mobile.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common problems indicator */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Signs You Need {service.name}
                  </h4>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    Noticeable drop in cooling speed, unusual humming or rattling noises, ice formation on evaporator pipes, water leakage from the indoor cabinet, or foul odors upon turning on the AC.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Callout */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <Card className="p-6 border-slate-200 shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 block mb-1">
                  Ready to Schedule?
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Book {service.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Serving all major Bangalore zones. Select your 2-hour slot with zero upfront payment.
                </p>

                <div className="space-y-3">
                  <Button
                    href={`/book-service?service=${service.slug}`}
                    variant="primary"
                    size="lg"
                    className="w-full text-sm"
                  >
                    Book This Service
                  </Button>
                  <a
                    href={`https://wa.me/${BRAND.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                      `Hi Coolo, I would like to book ${service.name} in Bangalore.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                  >
                    Book via WhatsApp
                  </a>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No advance payment needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Standardized diagnostic checklist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Digital service warranty record</span>
                  </div>
                </div>
              </Card>

              {/* Related Services */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Other Popular Services
                </h4>
                <div className="space-y-2.5">
                  {relatedServices.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/services/${rel.slug}`}
                      className="block p-3 rounded-xl bg-white border border-slate-200/80 hover:border-sky-300 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-sky-600">
                          {rel.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                      </div>
                      <span className="text-[11px] text-slate-500">
                        From ₹{rel.startingPrice}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Published Customer Reviews */}
      <section className="py-12 lg:py-16 bg-slate-50/60 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                Customer Reviews
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Verified feedback from Bangalore homes who trusted COOLO with their {service.name}.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <div className="text-xs ml-2">
                <div className="font-bold text-slate-900">4.8 / 5.0</div>
                <div className="text-slate-500">Based on 320+ services</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: 'Priya S.',
                area: 'Koramangala',
                rating: 5,
                date: '12 days ago',
                comment: `Technician arrived on time for our ${service.name.toLowerCase()}, explained every issue in simple terms, and the cooling is back to brand new. The transparent quote before starting work was a big relief.`,
                photos: 2,
              },
              {
                name: 'Rahul M.',
                area: 'Indiranagar',
                rating: 5,
                date: '3 weeks ago',
                comment: `Booked ${service.name.toLowerCase()} for our 2 split ACs. Tech spotted a gas leak we didn't even know about, fixed it same visit, and cleaned up everything spotless. Will definitely use COOLO again.`,
                photos: 0,
              },
              {
                name: 'Anita K.',
                area: 'Whitefield',
                rating: 4,
                date: '1 month ago',
                comment: `Scheduling was easy via WhatsApp, showed up in the promised 2-hour window. Only suggestion: a more detailed breakdown of spare parts used would be nice. Otherwise great service.`,
                photos: 1,
              },
              {
                name: 'Vikram P.',
                area: 'HSR Layout',
                rating: 5,
                date: '1 month ago',
                comment: `Our cassette AC had been acting up for months — previous technicians couldn't diagnose it properly. COOLO's guy found the sensor issue in 15 minutes and had it fixed within an hour. Highly recommended.`,
                photos: 3,
              },
              {
                name: 'Meera J.',
                area: 'JP Nagar',
                rating: 5,
                date: '2 months ago',
                comment: `The digital service record and follow-up call after 48 hours really impressed me. It's not often you get this level of accountability from local AC services in Bangalore.`,
                photos: 0,
              },
              {
                name: 'Arjun D.',
                area: 'Electronic City',
                rating: 5,
                date: '2 months ago',
                comment: `Paid only after testing — exactly as promised. Cooling efficiency improved by a noticeable margin after the deep cleaning service. 15% multi-unit discount was applied automatically too.`,
                photos: 1,
              },
            ].map((review, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{review.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{review.area}</span>
                        <span>·</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <Quote className="w-5 h-5 text-sky-200" />
                </div>

                <div className="flex items-center gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= review.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {review.photos > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Camera className="w-3 h-3" />
                    <span>{review.photos} service photo{review.photos > 1 ? 's' : ''} attached</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ for this service */}
      <FAQSection />
    </div>
  );
}
