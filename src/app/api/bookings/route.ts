import { NextRequest, NextResponse } from 'next/server';
import { detailedBookingSchema, quickBookingSchema } from '@/lib/validations/booking.schema';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createSessionClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { ACTIVE_SERVICE_AREAS } from '@/lib/constants/areas';

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const isDetailed = typeof body === 'object' && body !== null && 'addressLine1' in body;
    const parseResult = isDetailed
      ? detailedBookingSchema.safeParse(body)
      : quickBookingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Booking is temporarily unavailable. Please call Coolo to book your service.' },
        { status: 503 }
      );
    }

    const booking = parseResult.data;
    const supabase = createAdminClient();
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('slug', booking.serviceSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (serviceError || !service) {
      console.error('Could not resolve the selected booking service:', serviceError);
      return NextResponse.json(
        { success: false, error: 'The selected service is currently unavailable. Please try another service.' },
        { status: 503 }
      );
    }

    let customerId: string | null = null;
    const sessionClient = await createSessionClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (user) {
      const { data: customer } = await sessionClient
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      customerId = customer?.id ?? null;
    }

    const selectedArea = ACTIVE_SERVICE_AREAS.find(({ areaName }) => areaName === booking.areaName);
    const addressSnapshot = isDetailed
      ? {
          line1: 'addressLine1' in booking ? booking.addressLine1 : '',
          line2: 'addressLine2' in booking ? booking.addressLine2 || null : null,
          area: booking.areaName,
          city: selectedArea?.city ?? booking.areaName,
          state: selectedArea?.state ?? null,
          pincode: 'pincode' in booking ? booking.pincode : null,
          landmark: 'landmark' in booking ? booking.landmark || null : null,
          serviceSlug: booking.serviceSlug,
        }
      : {
          area: booking.areaName,
          city: selectedArea?.city ?? booking.areaName,
          state: selectedArea?.state ?? null,
          serviceSlug: booking.serviceSlug,
        };

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        customer_id: customerId,
        service_id: service.id,
        ac_type: 'acType' in booking ? booking.acType : 'Split',
        ac_brand: 'acBrand' in booking ? booking.acBrand || null : null,
        ac_age: 'acAge' in booking ? booking.acAge || null : null,
        problem_description: 'problemDescription' in booking ? booking.problemDescription || null : null,
        status: 'REQUESTED',
        scheduled_date: booking.preferredDate,
        scheduled_time_slot: booking.preferredTimeSlot,
        customer_name: booking.customerName,
        customer_mobile: booking.customerMobile,
        customer_email: 'customerEmail' in booking ? booking.customerEmail || null : null,
        address_snapshot: addressSnapshot,
      }] as unknown as never)
      .select('booking_number, status')
      .single();

    if (error || !data) {
      console.error('Supabase booking insert error:', error);
      return NextResponse.json(
        { success: false, error: 'We could not save your booking. Please try again or call Coolo directly.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingNumber: data.booking_number,
      status: data.status,
      message: 'Your service request has been received.',
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while processing your booking. Please try again.',
      },
      { status: 500 }
    );
  }
}
