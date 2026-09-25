import type { ServiceAreaItem } from '@/lib/types/coolo.types';

export interface SiteContactConfig {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  address: string;
  workingHours: string;
}

export interface SiteConfig {
  contact: SiteContactConfig;
  cities: ServiceAreaItem[];
}

export const DEFAULT_CITIES: ServiceAreaItem[] = [
  { id: 'city-bangalore', areaName: 'Bangalore', pincode: '560001', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'city-hyderabad', areaName: 'Hyderabad', pincode: '500001', city: 'Hyderabad', state: 'Telangana', isActive: true },
  { id: 'city-delhi', areaName: 'Delhi', pincode: '110001', city: 'Delhi', state: 'Delhi', isActive: true },
  { id: 'city-guntur', areaName: 'Guntur', pincode: '522001', city: 'Guntur', state: 'Andhra Pradesh', isActive: true },
  { id: 'city-pune', areaName: 'Pune', pincode: '411001', city: 'Pune', state: 'Maharashtra', isActive: true },
  { id: 'city-mumbai', areaName: 'Mumbai', pincode: '400001', city: 'Mumbai', state: 'Maharashtra', isActive: true },
  { id: 'city-chennai', areaName: 'Chennai', pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', isActive: true },
  { id: 'city-kolkata', areaName: 'Kolkata', pincode: '700001', city: 'Kolkata', state: 'West Bengal', isActive: true },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  contact: {
    phone: '+919900819475',
    phoneDisplay: '+91 99008 19475',
    whatsapp: '+919900819475',
    email: 'hello@coolo.in',
    supportEmail: 'support@coolo.in',
    address: 'Bangalore, Karnataka 560038, India',
    workingHours: 'Mon - Sun: 8:00 AM – 9:00 PM',
  },
  cities: DEFAULT_CITIES,
};

function ensureString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function ensureBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeCity(city: any, index: number): ServiceAreaItem {
  const areaName = ensureString(city?.areaName, city?.city || `City ${index + 1}`);
  return {
    id: ensureString(city?.id, `city-${index + 1}`),
    areaName,
    pincode: ensureString(city?.pincode, '000000'),
    city: ensureString(city?.city, areaName),
    state: ensureString(city?.state, 'India'),
    isActive: ensureBoolean(city?.isActive, true),
  };
}

export function normalizeSiteConfig(input: Partial<SiteConfig> | null | undefined): SiteConfig {
  const base = DEFAULT_SITE_CONFIG;
  const parsedCities = Array.isArray(input?.cities)
    ? input.cities.map(normalizeCity)
    : base.cities;

  return {
    contact: {
      phone: ensureString(input?.contact?.phone, base.contact.phone),
      phoneDisplay: ensureString(input?.contact?.phoneDisplay, base.contact.phoneDisplay),
      whatsapp: ensureString(input?.contact?.whatsapp, base.contact.whatsapp),
      email: ensureString(input?.contact?.email, base.contact.email),
      supportEmail: ensureString(input?.contact?.supportEmail, base.contact.supportEmail),
      address: ensureString(input?.contact?.address, base.contact.address),
      workingHours: ensureString(input?.contact?.workingHours, base.contact.workingHours),
    },
    cities: parsedCities,
  };
}
