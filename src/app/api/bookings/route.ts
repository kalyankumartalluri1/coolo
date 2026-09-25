import { NextRequest, NextResponse } from 'next/server';
import { detailedBookingSchema, quickBookingSchema, QuickBookingValues, DetailedBookingValues } from '@/lib/validations/booking.schema';
import { createAdminClient } from '@/lib/supabase/admin';
import { ACType } from '@/lib/types/database.types';
import { SERVICES } from '@/lib/constants/services';

function hasValidSupabaseEnv(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-coolo-dev') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('dummy')
  );
}

function mockBookingNumber(): string {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `COOLO-${currentYear}-${randomSuffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const detailedResult = detailedBookingSchema.safeParse(body);
    const quickResult = detailedResult.success ? null : quickBookingSchema.safeParse(body);

    if (!detailedResult.success && (!quickResult || !quickResult.success)) {
      const err = quickResult ?? detailedResult;
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: err.error?.issues },
        { status: 400 }
      );
    }

    const base: QuickBookingValues = detailedResult.success
      ? detailedResult.data
      : (quickResult!.data as QuickBookingValues);

    const extended: Partial<DetailedBookingValues> = detailedResult.success
      ? detailedResult.data
      : {};

    const {
      serviceSlug,
      areaName,
      preferredDate,
      preferredTimeSlot,
      customerName,
      customerMobile,
    } = base;

    const acType: ACType = extended.acType ?? 'Split';
    const acBrand = extended.acBrand ?? null;
    const acAge = extended.acAge ?? null;
    const problemDescription = extended.problemDescription ?? null;
    const customerEmail = extended.customerEmail ?? null;
    const addressLine1 = extended.addressLine1 ?? null;
    const pincode = extended.pincode ?? null;
    const landmark = extended.landmark ?? null;
    const addressLine2 = (extended as { addressLine2?: string | null }).addressLine2 ?? null;

    const addressSnapshot: Record<string, unknown> = {
      line1: addressLine1,
      line2: addressLine2,
      area: areaName,
      city: areaName,
      state: 'India',
      pincode,
      landmark,
    };

    const hasValidSupabase = hasValidSupabaseEnv();

    let resolvedServiceId: string | null = null;
    if (hasValidSupabase) {
      try {
        const supabase = createAdminClient();
        const { data: svcRow } = await supabase
          .from('services')
          .select('id')
          .eq('slug', serviceSlug)
          .is('is_active', true)
          .limit(1)
          .maybeSingle();
        if (svcRow) resolvedServiceId = (svcRow as { id: string }).id;
      } catch (err) {
        console.error('Service lookup error:', err);
      }
    } else {
      const mockSvc = SERVICES.find((s) => s.slug === serviceSlug);
      resolvedServiceId = mockSvc?.id ?? null;
    }

    const bookingPayload = {
      booking_number: hasValidSupabase ? '' : mockBookingNumber(),
      service_id: resolvedServiceId,
      ac_type: acType,
      ac_brand: acBrand,
      ac_age: acAge,
      problem_description: problemDescription,
      status: 'REQUESTED' as const,
      scheduled_date: preferredDate,
      scheduled_time_slot: preferredTimeSlot,
      customer_name: customerName,
      customer_mobile: customerMobile,
      customer_email: customerEmail,
      address_snapshot: addressSnapshot,
    };

    if (hasValidSupabase) {
      try {
        const supabase = createAdminClient();
        const { data: inserted, error } = await supabase
          .from('bookings')
          .insert([bookingPayload] as unknown as never)
          .select('booking_number, status, id')
          .single();

        if (error) {
          console.error('Supabase booking insert error:', error);
        } else if (inserted) {
          const rec = inserted as { booking_number: string; status: string; id: string };
          return NextResponse.json({
            success: true,
            bookingNumber: rec.booking_number,
            status: rec.status,
            message: 'Your service request has been received.',
          });
        }
      } catch (err) {
        console.error('Error connecting to Supabase:', err);
      }
    }

    return NextResponse.json({
      success: true,
      bookingNumber: bookingPayload.booking_number || mockBookingNumber(),
      status: 'REQUESTED',
      message: 'Your service request has been received.',
      details: {
        service: serviceSlug,
        serviceId: resolvedServiceId,
        area: areaName,
        date: preferredDate,
        time: preferredTimeSlot,
        customer: customerName,
      },
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing your booking. Please try again.' },
      { status: 500 }
    );
  }
}
