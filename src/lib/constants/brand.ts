import { DEFAULT_SITE_CONFIG } from '@/lib/config/site-config';

export const BRAND = {
  name: 'COOLO',
  legalName: 'Coolo Air & Cooling Solutions',
  tagline: 'Air & Cooling Solutions',
  headline: 'AC & Cooling Services at Your Doorstep',
  subheadline: 'Book reliable AC repair, servicing, cleaning and installation from trusted local technicians in Bangalore.',
  domain: 'https://coolo.in',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  contact: {
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || DEFAULT_SITE_CONFIG.contact.phone,
    phoneDisplay: process.env.NEXT_PUBLIC_BUSINESS_PHONE_DISPLAY || DEFAULT_SITE_CONFIG.contact.phoneDisplay,
    whatsapp: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || DEFAULT_SITE_CONFIG.contact.whatsapp,
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || DEFAULT_SITE_CONFIG.contact.email,
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || DEFAULT_SITE_CONFIG.contact.supportEmail,
    address: DEFAULT_SITE_CONFIG.contact.address,
    workingHours: DEFAULT_SITE_CONFIG.contact.workingHours,
  },
  trustPillars: [
    {
      title: 'Verified Technicians',
      description: 'Background checked, certified cooling specialists with proven field experience.',
      icon: 'ShieldCheck',
    },
    {
      title: 'Transparent Service',
      description: 'Clear diagnostic inspection before any repair. Clear quotes without hidden fees.',
      icon: 'SearchCheck',
    },
    {
      title: 'Convenient Scheduling',
      description: 'Choose your preferred 2-hour arrival window with on-time arrival tracking.',
      icon: 'Clock',
    },
    {
      title: 'Digital Service Records',
      description: 'Online job reports, part logs, before/after photos, and service warranty receipts.',
      icon: 'FileText',
    },
  ],
  whatsappBookingMessage: 'Hi Coolo, I would like to book an AC service in Bangalore.',
} as const;
