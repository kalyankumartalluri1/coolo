import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { SERVICES } from '@/lib/constants/services';

function hasValidSupabaseEnv(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-coolo-dev') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('dummy')
  );
}

const reviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
  photo_urls: z.array(z.string().url()).optional().nullable(),
  customerName: z.string().min(2).optional().nullable(),
  customerMobile: z.string().optional().nullable(),
  serviceSlug: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment, photo_urls, customerName, customerMobile, serviceSlug } = result.data;

    let serviceId: string | null = null;
    if (serviceSlug) {
      if (hasValidSupabaseEnv()) {
        const supabase = createAdminClient();
        const { data: svcRow } = await supabase
          .from('services')
          .select('id')
          .eq('slug', serviceSlug)
          .limit(1)
          .maybeSingle();
        if (svcRow) serviceId = (svcRow as { id: string }).id;
      } else {
        serviceId = SERVICES.find((s) => s.slug === serviceSlug)?.id ?? null;
      }
    }

    const reviewPayload: Record<string, unknown> = {
      booking_id: bookingId,
      service_id: serviceId,
      rating,
      comment: comment ?? null,
      photo_urls: photo_urls ?? [],
      customer_name: customerName ?? null,
      customer_mobile: customerMobile ?? null,
      is_moderated: false,
      is_published: true,
    };

    if (hasValidSupabaseEnv()) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewPayload] as never[])
        .select('id, rating, comment, created_at')
        .limit(1)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { success: false, error: `DB insert failed: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully. Thank you for your feedback!',
        review: data,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully (demo mode). Thank you for your feedback!',
        review: {
          id: `mock-review-${Date.now()}`,
          rating,
          comment,
          created_at: new Date().toISOString(),
        },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Unexpected error: ${msg}` },
      { status: 500 }
    );
  }
}
