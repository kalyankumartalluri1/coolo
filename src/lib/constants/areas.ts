import { ServiceAreaItem } from '../types/coolo.types';

export const SERVICE_CITIES: ServiceAreaItem[] = [
  { id: 'bangalore', areaName: 'Bangalore', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'pune', areaName: 'Pune', city: 'Pune', state: 'Maharashtra', isActive: true },
  { id: 'hyderabad', areaName: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', isActive: true },
  { id: 'chennai', areaName: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', isActive: true },
  { id: 'mumbai', areaName: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', isActive: true },
  { id: 'delhi-ncr', areaName: 'Delhi NCR', city: 'Delhi NCR', state: 'Delhi', isActive: true },
  { id: 'ahmedabad', areaName: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', isActive: true },
  { id: 'jaipur', areaName: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', isActive: true },
  { id: 'kochi', areaName: 'Kochi', city: 'Kochi', state: 'Kerala', isActive: true },
];

export const BANGALORE_AREAS = SERVICE_CITIES.filter((item) => item.city === 'Bangalore');
export const ACTIVE_SERVICE_AREAS = SERVICE_CITIES.filter((area) => area.isActive);
export const DEFAULT_SERVICE_AREA = ACTIVE_SERVICE_AREAS[0]?.areaName ?? 'Bangalore';

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
