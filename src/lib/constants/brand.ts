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
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+919900819475',
    phoneDisplay: process.env.NEXT_PUBLIC_BUSINESS_PHONE_DISPLAY || '+91 99008 19475',
    whatsapp: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || '+919900819475',
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'hello@coolo.in',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@coolo.in',
    address: 'Bangalore, Karnataka 560038, India',
    workingHours: 'Mon - Sun: 8:00 AM – 9:00 PM',
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
