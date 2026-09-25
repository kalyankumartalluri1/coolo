import { DEFAULT_SITE_CONFIG } from '@/lib/config/site-config';
import { ServiceAreaItem } from '../types/coolo.types';

export const SERVICE_CITIES: ServiceAreaItem[] = DEFAULT_SITE_CONFIG.cities.filter((city) => city.isActive);
export const CITIES_WE_SERVE = SERVICE_CITIES;
export const BANGALORE_AREAS = SERVICE_CITIES;

export const TIME_SLOTS = [
  '08:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 02:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
];

export const AC_TYPES = ['Split', 'Window', 'Cassette', 'Ducted', 'Other'] as const;
export const AC_BRANDS = [
  'Daikin',
  'Voltas',
  'LG',
  'Samsung',
  'Hitachi',
  'Blue Star',
  'Carrier',
  'Panasonic',
  'Mitsubishi',
  'Godrej',
  'Lloyd',
  'O General',
  'Other',
];
