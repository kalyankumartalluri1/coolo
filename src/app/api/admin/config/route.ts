import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_SITE_CONFIG, normalizeSiteConfig } from '@/lib/config/site-config';
import { readSiteConfigFromDisk, writeSiteConfig } from '@/lib/config/site-config.server';

const citySchema = z.object({
  id: z.string().min(1),
  areaName: z.string().min(1),
  pincode: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  isActive: z.boolean().default(true),
});

const configSchema = z.object({
  contact: z.object({
    phone: z.string().min(1),
    phoneDisplay: z.string().min(1),
    whatsapp: z.string().min(1),
    email: z.string().min(1),
    supportEmail: z.string().min(1),
    address: z.string().min(1),
    workingHours: z.string().min(1),
  }),
  cities: z.array(citySchema).min(1),
});

export async function GET() {
  return NextResponse.json({
    success: true,
    config: readSiteConfigFromDisk(),
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = configSchema.safeParse(body ?? DEFAULT_SITE_CONFIG);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin configuration', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = writeSiteConfig(normalizeSiteConfig(parsed.data));
    return NextResponse.json({ success: true, config: result });
  } catch (error) {
    console.error('Admin config update failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to save configuration.' },
      { status: 500 }
    );
  }
}
