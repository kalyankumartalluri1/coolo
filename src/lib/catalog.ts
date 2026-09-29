import { createClient } from '@/lib/supabase/server';
import { SERVICES, type ServiceItem } from '@/lib/constants/services';
import { BRAND } from '@/lib/constants/brand';

export type SiteSettings = {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  workingHours: string;
};

export type ServiceCatalogEntry = ServiceItem & { dbPrice: number | null; isDbBacked: boolean };

// Canonical setting keys stored in public.site_settings (managed by super admins).
export const SETTING_KEYS = {
  phone: 'contact.phone',
  phoneDisplay: 'contact.phone_display',
  whatsapp: 'contact.whatsapp',
  email: 'contact.email',
  supportEmail: 'contact.support_email',
  workingHours: 'contact.working_hours',
} as const;

export const SETTING_LABELS: Record<string, { label: string; hint: string }> = {
  [SETTING_KEYS.phone]: { label: 'Primary phone (dialable)', hint: 'Used by call buttons. Format: +919900819475' },
  [SETTING_KEYS.phoneDisplay]: { label: 'Phone display text', hint: 'Human-readable, e.g. +91 99008 19475' },
  [SETTING_KEYS.whatsapp]: { label: 'WhatsApp number', hint: 'Digits with country code, e.g. +919900819475' },
  [SETTING_KEYS.email]: { label: 'General email', hint: 'Shown in footer/contact pages' },
  [SETTING_KEYS.supportEmail]: { label: 'Support email', hint: 'Shown for customer support queries' },
  [SETTING_KEYS.workingHours]: { label: 'Working hours', hint: 'e.g. Mon - Sun: 8:00 AM – 9:00 PM' },
};

function fallbackSettings(): SiteSettings {
  return {
    phone: BRAND.contact.phone,
    phoneDisplay: BRAND.contact.phoneDisplay,
    whatsapp: BRAND.contact.whatsapp,
    email: BRAND.contact.email,
    supportEmail: BRAND.contact.supportEmail,
    workingHours: BRAND.contact.workingHours,
  };
}

/**
 * Reads site settings from public.site_settings with fallback to BRAND constants.
 * Never throws: catalog pages must render even when the table is missing/empty.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient();
    // site_settings is created by migration 20260930000002 and is not yet in the
    // generated Database types, so the result is cast explicitly.
    const result = (await supabase.from('site_settings').select('key, value')) as unknown as {
      data: Array<{ key: string; value: string }> | null;
      error: { message: string } | null;
    };
    const { data, error } = result;
    if (error || !data?.length) return fallbackSettings();
    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
    return {
      phone: map[SETTING_KEYS.phone] || BRAND.contact.phone,
      phoneDisplay: map[SETTING_KEYS.phoneDisplay] || BRAND.contact.phoneDisplay,
      whatsapp: map[SETTING_KEYS.whatsapp] || BRAND.contact.whatsapp,
      email: map[SETTING_KEYS.email] || BRAND.contact.email,
      supportEmail: map[SETTING_KEYS.supportEmail] || BRAND.contact.supportEmail,
      workingHours: map[SETTING_KEYS.workingHours] || BRAND.contact.workingHours,
    };
  } catch {
    return fallbackSettings();
  }
}

/**
 * Service catalog with super-admin-controlled prices.
 * Merges static service copy with DB `services.starting_price` where available.
 */
export async function getServiceCatalog(): Promise<ServiceCatalogEntry[]> {
  let dbPrices: Record<string, number> = {};
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('services').select('slug, starting_price').eq('is_active', true);
    if (!error && data) {
      dbPrices = Object.fromEntries(
        data
          .filter((row) => typeof row.starting_price === 'number')
          .map((row) => [row.slug, row.starting_price as number])
      );
    }
  } catch {
    // fall through to constants
  }
  return SERVICES.map((service) => {
    const dbPrice = service.slug in dbPrices ? dbPrices[service.slug] : null;
    return { ...service, startingPrice: dbPrice ?? service.startingPrice, dbPrice, isDbBacked: dbPrice !== null };
  });
}

export function catalogBySlug(catalog: ServiceCatalogEntry[], slug: string): ServiceCatalogEntry | undefined {
  return catalog.find((entry) => entry.slug === slug);
}
