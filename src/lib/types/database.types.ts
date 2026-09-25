export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN' | 'SUPER_ADMIN';

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'TECHNICIAN_ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type ACType = 'Split' | 'Window' | 'Cassette' | 'Ducted' | 'Other';

export type AssignmentStatus = 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export type EstimateStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CASH';

export type PaymentMethod = 'UPI' | 'RAZORPAY' | 'CARD' | 'CASH';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          mobile: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          mobile?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          mobile?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          category_id: string | null;
          slug: string;
          name: string;
          short_description: string;
          full_description: string | null;
          icon_name: string;
          image_url: string | null;
          starting_price: number | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          slug: string;
          name: string;
          short_description: string;
          full_description?: string | null;
          icon_name?: string;
          image_url?: string | null;
          starting_price?: number | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          slug?: string;
          name?: string;
          short_description?: string;
          full_description?: string | null;
          icon_name?: string;
          image_url?: string | null;
          starting_price?: number | null;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
        };
      };
      service_areas: {
        Row: {
          id: string;
          city: string;
          state: string;
          area_name: string;
          pincode: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          city?: string;
          state?: string;
          area_name: string;
          pincode: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          city?: string;
          state?: string;
          area_name?: string;
          pincode?: string;
          is_active?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          customer_id: string | null;
          service_id: string | null;
          ac_type: ACType;
          ac_brand: string | null;
          ac_age: string | null;
          problem_description: string | null;
          photo_urls: string[];
          status: BookingStatus;
          scheduled_date: string;
          scheduled_time_slot: string;
          customer_name: string;
          customer_mobile: string;
          customer_email: string | null;
          address_snapshot: Json;
          estimated_price: number | null;
          final_amount: number | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_number?: string;
          customer_id?: string | null;
          service_id?: string | null;
          ac_type?: ACType;
          ac_brand?: string | null;
          ac_age?: string | null;
          problem_description?: string | null;
          photo_urls?: string[];
          status?: BookingStatus;
          scheduled_date: string;
          scheduled_time_slot: string;
          customer_name: string;
          customer_mobile: string;
          customer_email?: string | null;
          address_snapshot: Json;
          estimated_price?: number | null;
          final_amount?: number | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_id?: string | null;
          service_id?: string | null;
          ac_type?: ACType;
          ac_brand?: string | null;
          ac_age?: string | null;
          problem_description?: string | null;
          photo_urls?: string[];
          status?: BookingStatus;
          scheduled_date?: string;
          scheduled_time_slot?: string;
          customer_name?: string;
          customer_mobile?: string;
          customer_email?: string | null;
          address_snapshot?: Json;
          estimated_price?: number | null;
          final_amount?: number | null;
          cancellation_reason?: string | null;
          updated_at?: string;
        };
      };
      booking_status_history: {
        Row: {
          id: string;
          booking_id: string;
          from_status: BookingStatus | null;
          to_status: BookingStatus;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          from_status?: BookingStatus | null;
          to_status: BookingStatus;
          changed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          notes?: string | null;
        };
      };
      pricing: {
        Row: {
          id: string;
          service_id: string;
          ac_type: ACType;
          base_price: number;
          additional_unit_price: number;
          labour_charge: number;
          minimum_charge: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          ac_type: ACType;
          base_price?: number;
          additional_unit_price?: number;
          labour_charge?: number;
          minimum_charge?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          base_price?: number;
          additional_unit_price?: number;
          labour_charge?: number;
          minimum_charge?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      contact_requests: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          email: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mobile: string;
          email?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      ac_type: ACType;
      assignment_status: AssignmentStatus;
      estimate_status: EstimateStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
    };
  };
}
