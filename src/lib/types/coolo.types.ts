import { BookingStatus, ACType } from './database.types';

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  startingPrice: number;
  features: string[];
  popular?: boolean;
}

export interface ServiceAreaItem {
  id: string;
  areaName: string;
  pincode?: string;
  city: string;
  state: string;
  isActive: boolean;
}

export interface QuickBookingFormData {
  serviceSlug: string;
  areaName: string;
  preferredDate: string;
  preferredTimeSlot: string;
  customerName: string;
  customerMobile: string;
}

export interface BookingSubmissionPayload {
  serviceId?: string;
  serviceSlug: string;
  acType: ACType;
  acBrand?: string;
  acAge?: string;
  problemDescription?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  address: {
    line1: string;
    line2?: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
}

export interface BookingResult {
  success: boolean;
  bookingNumber?: string;
  status?: BookingStatus;
  message?: string;
  error?: string;
}
