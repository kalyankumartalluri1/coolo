import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BookingStatus, UserRole } from '@/lib/types/database.types';
import { z } from 'zod';

const MOCK_JOBS = [
  {
    id: 'mock-uuid-0003',
    booking_number: 'COOLO-2026-554301',
    status: 'ASSIGNED' as BookingStatus,
    customer_name: 'Rajesh Kumar',
    customer_mobile: '9741234567',
    scheduled_date: '2026-09-26',
    scheduled_time_slot: '08:00 AM – 10:00 AM',
    address_snapshot: { area: 'Whitefield', city: 'Bangalore', line1: 'Flat 12, Prestige Towers' },
    ac_type: 'Cassette',
    ac_brand: 'Daikin',
    problem_description: 'Water dripping from indoor unit and cooling is insufficient.',
  },
  {
    id: 'mock-uuid-0005',
    booking_number: 'COOLO-2026-998802',
    status: 'TECHNICIAN_ON_THE_WAY' as BookingStatus,
    customer_name: 'Sunita Rao',
    customer_mobile: '9880045678',
    scheduled_date: '2026-09-25',
    scheduled_time_slot: '10:00 AM – 12:00 PM',
    address_snapshot: { area: 'Marathahalli', city: 'Bangalore', line1: '24, Palm Grove Apt' },
    ac_type: 'Split',
    ac_brand: 'LG',
    problem_description: 'Not cooling at all after power cut.',
  },
  {
    id: 'mock-uuid-0004',
    booking_number: 'COOLO-2026-112900',
    status: 'COMPLETED' as BookingStatus,
    customer_name: 'Deepa Nair',
    customer_mobile: '9980011223',
    scheduled_date: '2026-09-24',
    scheduled_time_slot: '04:00 PM – 06:00 PM',
    address_snapshot: { area: 'Koramangala', city: 'Bangalore', line1: 'No. 5, 4th Block' },
    ac_type: 'Split',
    ac_brand: 'Voltas',
    problem_description: undefined,
  },
];

const hasValidSupabase = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-coolo-dev') &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('dummy');

export async function GET(request: NextRequest) {
  // In production: derive technician_id from session cookie
  // For now returns all assigned jobs (mock or from DB)
  const sessionCookie = request.cookies.get('coolo_session')?.value;

  if (sessionCookie) {
    try {
      JSON.parse(sessionCookie);
    } catch {
      // ignore
    }
  }

  if (hasValidSupabase()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id, booking_number, status, customer_name, customer_mobile, scheduled_date, scheduled_time_slot, address_snapshot, ac_type, ac_brand, problem_description'
        )
        .in('status', ['ASSIGNED', 'TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED'])
        .order('scheduled_date', { ascending: true })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ success: true, jobs: data || [] });
    } catch (err) {
      console.error('Technician jobs fetch error:', err);
    }
  }

  return NextResponse.json({ success: true, jobs: MOCK_JOBS });
}

const patchSchema = z.union([
  z.object({
    jobId: z.string().min(1),
    status: z.enum([
      'TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED',
    ]),
  }),
  z.object({
    jobId: z.string().min(1),
    action: z.literal('submitRecord'),
    diagnosisNotes: z.string().max(2000).optional(),
    workPerformed: z.string().min(3).max(3000),
    finalAmount: z.coerce.number().min(0).max(999999),
    paymentMethod: z.enum(['UPI', 'RAZORPAY', 'CARD', 'CASH']).optional(),
  }),
]);

const estimateItemSchema = z.object({
  item_type: z.enum(['PART', 'LABOUR', 'GAS', 'OTHER']),
  description: z.string().min(1).max(500),
  quantity: z.coerce.number().int().min(1).max(999),
  unit_price: z.coerce.number().min(0).max(999999),
  total_price: z.coerce.number().min(0).max(999999),
});

const postEstimateSchema = z.object({
  jobId: z.string().min(1),
  technicianId: z.string().min(1).optional(),
  items: z.array(estimateItemSchema).min(1),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0),
  totalAmount: z.coerce.number().min(0),
  notes: z.string().max(2000).optional(),
});

async function resolveTechnicianId(
  sessionUserId: string | null
): Promise<string | null> {
  if (!sessionUserId || !hasValidSupabase()) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('technicians')
      .select('id')
      .eq('user_id', sessionUserId)
      .limit(1)
      .maybeSingle();
    return data ? (data as { id: string }).id : null;
  } catch {
    return null;
  }
}

function readSession(request: NextRequest): { userId: string | null; role: UserRole | null } {
  const raw = request.cookies.get('coolo_session')?.value;
  if (!raw) return { userId: null, role: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      userId: parsed.userId || null,
      role: parsed.role || null,
    };
  } catch {
    return { userId: null, role: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = readSession(request);
    const body = await request.json();
    const estResult = postEstimateSchema.safeParse(body);
    if (!estResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid estimate data', details: estResult.error.flatten() },
        { status: 400 }
      );
    }

    const { jobId, items, subtotal, taxAmount, discountAmount, totalAmount, notes, technicianId } =
      estResult.data;

    const resolvedTechId =
      technicianId || (await resolveTechnicianId(session.userId)) || 'tech-uuid-001';

    if (hasValidSupabase()) {
      const supabase = createAdminClient();

      const { data: estRow, error: estError } = await supabase
        .from('service_estimates')
        .insert([
          {
            booking_id: jobId,
            technician_id: resolvedTechId,
            subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            status: 'PENDING_APPROVAL',
            notes,
          } as never,
        ])
        .select('id')
        .single();

      if (estError || !estRow) {
        throw estError || new Error('Failed to create estimate');
      }

      const estimateId = (estRow as { id: string }).id;
      const { error: itemsError } = await supabase.from('estimate_items').insert(
        items.map(
          (item) =>
            ({
              estimate_id: estimateId,
              item_type: item.item_type,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
            }) as never
        )
      );
      if (itemsError) throw itemsError;

      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'WAITING_FOR_APPROVAL' as BookingStatus, updated_at: new Date().toISOString() } as never)
        .eq('id', jobId);
      if (bookingError) throw bookingError;
    }

    return NextResponse.json({
      success: true,
      jobId,
      status: 'WAITING_FOR_APPROVAL' as BookingStatus,
      totalAmount,
    });
  } catch (err) {
    console.error('Technician estimate POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit service estimate.' },
      { status: 500 }
    );
  }
}

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

    if ('action' in result.data && result.data.action === 'submitRecord') {
      const {
        jobId,
        diagnosisNotes,
        workPerformed,
        finalAmount,
        paymentMethod = 'CASH',
      } = result.data;
      const session = readSession(request);
      const techId =
        (await resolveTechnicianId(session.userId)) ||
        (body.technicianId as string | undefined) ||
        'tech-uuid-001';

      if (hasValidSupabase()) {
        const supabase = createAdminClient();

        const { error: recError } = await supabase.from('service_records').insert([
          {
            booking_id: jobId,
            technician_id: techId,
            diagnosis_notes: diagnosisNotes,
            work_performed: workPerformed,
            final_amount: finalAmount,
            before_photos: [],
            after_photos: [],
          } as never,
        ]);
        if (recError) throw recError;

        const { error: payError } = await supabase.from('payments').insert([
          {
            booking_id: jobId,
            amount: finalAmount,
            payment_method: paymentMethod,
            status: paymentMethod === 'CASH' ? 'CASH' : 'PAID',
          } as never,
        ]);
        if (payError) throw payError;

        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            status: 'COMPLETED' as BookingStatus,
            final_amount: finalAmount,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', jobId);
        if (bookingError) throw bookingError;
      }

      return NextResponse.json({
        success: true,
        jobId,
        status: 'COMPLETED' as BookingStatus,
      });
    } else {
      const { jobId, status } = result.data as { jobId: string; status: BookingStatus };

      if (hasValidSupabase()) {
        const supabase = createAdminClient();
        const { error } = await supabase
          .from('bookings')
          .update({ status, updated_at: new Date().toISOString() } as never)
          .eq('id', jobId);

        if (error) throw error;
      }

      return NextResponse.json({ success: true, jobId, status });
    }
  } catch (err) {
    console.error('Technician job patch error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update job.' },
      { status: 500 }
    );
  }
}
