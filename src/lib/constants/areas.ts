import { ServiceAreaItem } from '../types/coolo.types';

export const BANGALORE_AREAS: ServiceAreaItem[] = [
  { id: 'area-1', areaName: 'Indiranagar', pincode: '560038', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-2', areaName: 'Whitefield', pincode: '560066', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-3', areaName: 'HSR Layout', pincode: '560102', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-4', areaName: 'Koramangala', pincode: '560034', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-5', areaName: 'Marathahalli', pincode: '560037', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-6', areaName: 'Brookefield', pincode: '560037', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-7', areaName: 'Mahadevapura', pincode: '560048', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-8', areaName: 'Electronic City', pincode: '560100', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-9', areaName: 'BTM Layout', pincode: '560076', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-10', areaName: 'Jayanagar', pincode: '560041', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-11', areaName: 'JP Nagar', pincode: '560078', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-12', areaName: 'Hebbal', pincode: '560024', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-13', areaName: 'Yelahanka', pincode: '560064', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-14', areaName: 'Kalyan Nagar', pincode: '560043', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-15', areaName: 'HBR Layout', pincode: '560043', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-16', areaName: 'KR Puram', pincode: '560036', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-17', areaName: 'Bellandur', pincode: '560103', city: 'Bangalore', state: 'Karnataka', isActive: true },
  { id: 'area-18', areaName: 'Sarjapur Road', pincode: '560035', city: 'Bangalore', state: 'Karnataka', isActive: true },
];

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
