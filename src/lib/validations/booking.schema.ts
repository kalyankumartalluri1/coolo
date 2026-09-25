import { z } from 'zod';

export const quickBookingSchema = z.object({
  serviceSlug: z.string().min(1, 'Please select a service'),
  areaName: z.string().min(1, 'Please select your city'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTimeSlot: z.string().min(1, 'Please select a time slot'),
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
  acBrand: z.string().optional(),
  acAge: z.string().optional(),
  problemDescription: z.string().max(500, 'Description max 500 characters').optional(),
  customerEmail: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  addressLine1: z.string().trim().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().trim().optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  landmark: z.string().trim().optional(),
});

export type QuickBookingValues = z.infer<typeof quickBookingSchema>;
export type DetailedBookingValues = z.infer<typeof detailedBookingSchema>;
