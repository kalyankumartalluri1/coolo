import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters'),
  mobile: z
    .string()
    .trim()
    .regex(/^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  email: z.string().trim().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, mobile, email, password } = result.data;

    // Check if live Supabase is configured
    const hasValidSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock-coolo-dev') &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('dummy');

    if (hasValidSupabase) {
      try {
        const supabase = createAdminClient();
        const { data: authUser, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, mobile },
          },
        });

        if (authError || !authUser.user) {
          return NextResponse.json(
            { success: false, error: authError?.message || 'Registration failed' },
            { status: 400 }
          );
        }

        // Insert matching profile row
        await supabase.from('profiles').insert([
          {
            id: authUser.user.id,
            role: 'CUSTOMER',
            full_name: fullName,
            mobile,
            email,
          },
        ] as unknown as never);

        const response = NextResponse.json({
          success: true,
          message: 'Account created successfully.',
          redirectUrl: '/account',
        });

        response.cookies.set(
          'coolo_session',
          JSON.stringify({
            userId: authUser.user.id,
            email,
            role: 'CUSTOMER',
            name: fullName,
          }),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          }
        );

        return response;
      } catch (err) {
        console.error('Supabase registration error:', err);
      }
    }

    // Default mock response for dev environment
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      redirectUrl: '/account',
    });

    response.cookies.set(
      'coolo_session',
      JSON.stringify({
        userId: 'cust-' + Date.now(),
        email,
        role: 'CUSTOMER',
        name: fullName,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      }
    );

    return response;
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
