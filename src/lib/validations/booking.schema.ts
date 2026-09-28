import { z } from 'zod';
import { ACTIVE_SERVICE_AREAS, TIME_SLOTS } from '@/lib/constants/areas';
import { SERVICES } from '@/lib/constants/services';

const serviceSlugSchema = z.enum(SERVICES.map(({ slug }) => slug) as [string, ...string[]]);
const areaNameSchema = z.enum(ACTIVE_SERVICE_AREAS.map(({ areaName }) => areaName) as [string, ...string[]]);
const dateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value
    && value >= new Date().toISOString().slice(0, 10);
}, 'Select a valid date that is today or later');

export const quickBookingSchema = z.object({
  serviceSlug: serviceSlugSchema,
  areaName: areaNameSchema,
  preferredDate: dateSchema,
  preferredTimeSlot: z.enum(TIME_SLOTS as [string, ...string[]]),
  customerName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  customerMobile: z
    .string()
    .trim()
    .regex(
      /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/,
      'Enter a valid 10-digit Indian mobile number'
    ),
});

export const detailedBookingSchema = quickBookingSchema.extend({
  acType: z.enum(['Split', 'Window', 'Cassette', 'Ducted', 'Other'], {
    message: 'Please select an AC type',
  }),
  acBrand: z.string().trim().max(100).optional(),
  acAge: z.string().trim().max(50).optional(),
  problemDescription: z.string().trim().max(500, 'Description max 500 characters').optional(),
  customerEmail: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string().trim().min(5, 'Address must be at least 5 characters').max(300),
  addressLine2: z.string().trim().max(300).optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  landmark: z.string().trim().max(150).optional(),
});

export type QuickBookingValues = z.infer<typeof quickBookingSchema>;
export type DetailedBookingValues = z.infer<typeof detailedBookingSchema>;
