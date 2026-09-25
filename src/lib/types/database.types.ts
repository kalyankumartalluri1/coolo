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
      customers: {
        Row: {
          id: string;
          user_id: string | null;
          preferred_language: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          preferred_language?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          preferred_language?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      technicians: {
        Row: {
          id: string;
          user_id: string | null;
          employee_code: string;
          skills: string[];
          experience_years: number | null;
          is_active: boolean;
          current_status: string | null;
          rating_avg: number | null;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          employee_code: string;
          skills?: string[];
          experience_years?: number | null;
          is_active?: boolean;
          current_status?: string | null;
          rating_avg?: number | null;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          employee_code?: string;
          skills?: string[];
          experience_years?: number | null;
          is_active?: boolean;
          current_status?: string | null;
          rating_avg?: number | null;
          rating_count?: number;
          updated_at?: string;
        };
      };
      service_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
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
      addresses: {
        Row: {
          id: string;
          customer_id: string | null;
          address_line1: string;
          address_line2: string | null;
          area: string;
          city: string;
          state: string;
          pincode: string;
          landmark: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          address_line1: string;
          address_line2?: string | null;
          area: string;
          city?: string;
          state?: string;
          pincode: string;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_id?: string | null;
          address_line1?: string;
          address_line2?: string | null;
          area?: string;
          city?: string;
          state?: string;
          pincode?: string;
          landmark?: string | null;
          is_default?: boolean;
          updated_at?: string;
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
      technician_assignments: {
        Row: {
          id: string;
          booking_id: string;
          technician_id: string;
          status: AssignmentStatus;
          assigned_at: string;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          technician_id: string;
          status?: AssignmentStatus;
          assigned_at?: string;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          status?: AssignmentStatus;
          rejection_reason?: string | null;
        };
      };
      service_estimates: {
        Row: {
          id: string;
          booking_id: string;
          technician_id: string;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total_amount: number;
          status: EstimateStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          technician_id: string;
          subtotal?: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          status?: EstimateStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subtotal?: number;
          tax_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          status?: EstimateStatus;
          notes?: string | null;
          updated_at?: string;
        };
      };
      estimate_items: {
        Row: {
          id: string;
          estimate_id: string;
          item_type: string;
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          estimate_id: string;
          item_type: string;
          description: string;
          quantity?: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          item_type?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      service_records: {
        Row: {
          id: string;
          booking_id: string;
          technician_id: string;
          diagnosis_notes: string | null;
          work_performed: string;
          before_photos: string[];
          after_photos: string[];
          final_amount: number | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          technician_id: string;
          diagnosis_notes?: string | null;
          work_performed: string;
          before_photos?: string[];
          after_photos?: string[];
          final_amount?: number | null;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          diagnosis_notes?: string | null;
          work_performed?: string;
          before_photos?: string[];
          after_photos?: string[];
          final_amount?: number | null;
          completed_at?: string;
        };
      };
      parts: {
        Row: {
          id: string;
          part_number: string;
          name: string;
          category: string | null;
          unit_cost: number;
          selling_price: number;
          in_stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          part_number: string;
          name: string;
          category?: string | null;
          unit_cost: number;
          selling_price: number;
          in_stock?: number;
          created_at?: string;
        };
        Update: {
          part_number?: string;
          name?: string;
          category?: string | null;
          unit_cost?: number;
          selling_price?: number;
          in_stock?: number;
        };
      };
      service_parts: {
        Row: {
          id: string;
          service_record_id: string;
          part_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_record_id: string;
          part_id: string;
          quantity?: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          payment_method: PaymentMethod;
          status: PaymentStatus;
          transaction_reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          amount: number;
          payment_method?: PaymentMethod;
          status?: PaymentStatus;
          transaction_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          payment_method?: PaymentMethod;
          status?: PaymentStatus;
          transaction_reference?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string | null;
          rating: number;
          comment: string | null;
          photo_urls: string[];
          is_moderated: boolean;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id?: string | null;
          rating: number;
          comment?: string | null;
          photo_urls?: string[];
          is_moderated?: boolean;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          photo_urls?: string[];
          is_moderated?: boolean;
          is_published?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          channel: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          channel?: string;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      admin_notes: {
        Row: {
          id: string;
          booking_id: string;
          author_id: string | null;
          note: string;
          is_internal_only: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          author_id?: string | null;
          note: string;
          is_internal_only?: boolean;
          created_at?: string;
        };
        Update: {
          note?: string;
          is_internal_only?: boolean;
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
