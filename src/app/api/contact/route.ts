import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  mobile: z
    .string()
    .trim()
    .regex(/^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  email: z.string().trim().email('Valid email required').optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, mobile, email, message } = result.data;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Contact requests are temporarily unavailable. Please call Coolo directly.' },
        { status: 503 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('contact_requests').insert([{
      name,
      mobile,
      email: email || null,
      message,
      status: 'NEW',
    }] as unknown as never);

    if (error) {
      console.error('Failed to write to Supabase contact_requests:', error);
      return NextResponse.json(
        { success: false, error: 'Your request could not be saved. Please try again or call Coolo directly.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. A Coolo representative will connect with you promptly.',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process inquiry. Please try calling directly.' },
      { status: 500 }
    );
  }
}
