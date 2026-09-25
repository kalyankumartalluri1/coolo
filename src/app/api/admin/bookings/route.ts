import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BookingStatus } from '@/lib/types/database.types';
import { z } from 'zod';

// Mock bookings for dev/demo mode
const MOCK_BOOKINGS = [
  {
    id: 'mock-uuid-0001',
    booking_number: 'COOLO-2026-881204',
    status: 'CONFIRMED' as BookingStatus,
    customer_name: 'Anand Sharma',
    customer_mobile: '9876543210',
    scheduled_date: '2026-09-27',
    scheduled_time_slot: '10:00 AM – 12:00 PM',
    address_snapshot: { area: 'Indiranagar', city: 'Bangalore' },
    ac_type: 'Split',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-uuid-0002',
    booking_number: 'COOLO-2026-773190',
    status: 'REQUESTED' as BookingStatus,
    customer_name: 'Priya Menon',
    customer_mobile: '9845012345',
    scheduled_date: '2026-09-28',
    scheduled_time_slot: '02:00 PM – 04:00 PM',
    address_snapshot: { area: 'HSR Layout', city: 'Bangalore' },
    ac_type: 'Window',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-uuid-0003',
    booking_number: 'COOLO-2026-554301',
    status: 'ASSIGNED' as BookingStatus,
    customer_name: 'Rajesh Kumar',
    customer_mobile: '9741234567',
    scheduled_date: '2026-09-26',
    scheduled_time_slot: '08:00 AM – 10:00 AM',
    address_snapshot: { area: 'Whitefield', city: 'Bangalore' },
    ac_type: 'Cassette',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-uuid-0004',
    booking_number: 'COOLO-2026-112900',
    status: 'COMPLETED' as BookingStatus,
    customer_name: 'Deepa Nair',
    customer_mobile: '9980011223',
    scheduled_date: '2026-09-24',
    scheduled_time_slot: '04:00 PM – 06:00 PM',
    address_snapshot: { area: 'Koramangala', city: 'Bangalore' },
    ac_type: 'Split',
    created_at: new Date().toISOString(),
  },
];

const hasValidSupabase = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-coolo-dev') &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('dummy');

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const statusFilter = searchParams.get('status');

  if (hasValidSupabase()) {
    try {
      const supabase = createAdminClient();
      let query = supabase
        .from('bookings')
        .select('id, booking_number, status, customer_name, customer_mobile, scheduled_date, scheduled_time_slot, address_snapshot, ac_type, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter as BookingStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      return NextResponse.json({ success: true, bookings: data || [] });
    } catch (err) {
      console.error('Admin bookings fetch error:', err);
    }
  }

  // Dev mock fallback
  const filtered = statusFilter && statusFilter !== 'ALL'
    ? MOCK_BOOKINGS.filter((b) => b.status === statusFilter)
    : MOCK_BOOKINGS;

  return NextResponse.json({ success: true, bookings: filtered });
}

const patchSchema = z.union([
  z.object({
    bookingId: z.string().min(1),
    status: z.enum([
      'REQUESTED', 'CONFIRMED', 'ASSIGNED', 'TECHNICIAN_ON_THE_WAY',
      'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'CANCELLED', 'NO_SHOW',
    ]),
  }),
  z.object({
    bookingId: z.string().min(1),
    assignTechnicianId: z.string().min(1),
    status: z.enum([
      'REQUESTED', 'CONFIRMED', 'ASSIGNED', 'TECHNICIAN_ON_THE_WAY',
      'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'CANCELLED', 'NO_SHOW',
    ]).optional(),
  }),
]);

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = patchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { bookingId } = result.data;
    const nextStatus = 'status' in result.data ? result.data.status : undefined;
    const assignTechnicianId =
      'assignTechnicianId' in result.data ? result.data.assignTechnicianId : undefined;

    const finalStatus: BookingStatus | undefined =
      assignTechnicianId && !nextStatus ? 'ASSIGNED' : nextStatus;

    if (hasValidSupabase()) {
      const supabase = createAdminClient();

      if (assignTechnicianId) {
        const { error: assignmentError } = await supabase
          .from('technician_assignments')
          .insert([
            {
              booking_id: bookingId,
              technician_id: assignTechnicianId,
              status: 'ASSIGNED',
            } as never,
          ]);
        if (assignmentError) throw assignmentError;
      }

      if (finalStatus) {
        const { error } = await supabase
          .from('bookings')
          .update({ status: finalStatus, updated_at: new Date().toISOString() } as never)
          .eq('id', bookingId);
        if (error) throw error;
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      status: finalStatus ?? undefined,
      assignedTechnicianId: assignTechnicianId ?? undefined,
    });
  } catch (err) {
    console.error('Admin booking patch error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking.' },
      { status: 500 }
    );
  }
}
