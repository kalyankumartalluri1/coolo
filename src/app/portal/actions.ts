'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePortalAccount } from '@/lib/auth/portal';
import type { BookingStatus, UserRole } from '@/lib/types/database.types';

const bookingStatuses: BookingStatus[] = [
  'REQUESTED',
  'CONFIRMED',
  'ASSIGNED',
  'TECHNICIAN_ON_THE_WAY',
  'IN_PROGRESS',
  'WAITING_FOR_APPROVAL',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const userRoles: UserRole[] = ['CUSTOMER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN'];
const adminTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['CANCELLED', 'NO_SHOW'],
  ASSIGNED: ['CANCELLED', 'NO_SHOW'],
  TECHNICIAN_ON_THE_WAY: ['CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['CANCELLED', 'NO_SHOW'],
  WAITING_FOR_APPROVAL: ['CANCELLED', 'NO_SHOW'],
};

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/portal/login');
}

export async function updateBookingStatus(formData: FormData) {
  const account = await requirePortalAccount();
  const bookingId = String(formData.get('bookingId') ?? '');
  const status = String(formData.get('status') ?? '') as BookingStatus;
  if (!bookingId || !bookingStatuses.includes(status)) throw new Error('Invalid booking update.');

  const supabase = await createClient();
  const role = account.profile.role;
  const { data: booking } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .maybeSingle();
  if (!booking) throw new Error('Booking not found or you do not have access to it.');

  if (role === 'CUSTOMER') {
    if (status !== 'CANCELLED' || !['REQUESTED', 'CONFIRMED'].includes(booking.status)) {
      throw new Error('This booking can no longer be cancelled online.');
    }
  } else if (role === 'TECHNICIAN') {
    const { data: technician } = await supabase
      .from('technicians')
      .select('id')
      .eq('user_id', account.user.id)
      .eq('is_active', true)
      .maybeSingle();
    if (!technician) throw new Error('No active technician profile is linked to this account.');

    const { data: assignment } = await supabase
      .from('technician_assignments')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('technician_id', technician.id)
      .eq('status', 'ACCEPTED')
      .maybeSingle();
    const validStep = (booking.status === 'ASSIGNED' && status === 'TECHNICIAN_ON_THE_WAY')
      || (booking.status === 'TECHNICIAN_ON_THE_WAY' && status === 'IN_PROGRESS');
    if (!assignment || !validStep) {
      throw new Error('You can only update the status of your assigned jobs.');
    }
  } else if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('You are not allowed to update bookings.');
  } else if (!adminTransitions[booking.status as BookingStatus]?.includes(status)) {
    throw new Error('That booking status transition is not allowed.');
  }

  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status } as never)
    .eq('id', bookingId)
    .select('id')
    .maybeSingle();
  if (error || !updated) throw new Error('The booking could not be updated. Please refresh and try again.');
  revalidatePath('/portal');
}

export async function respondToAssignment(formData: FormData) {
  await requirePortalAccount(['TECHNICIAN']);
  const assignmentId = String(formData.get('assignmentId') ?? '');
  const decision = String(formData.get('decision') ?? '');
  if (!assignmentId || !['ACCEPT', 'REJECT'].includes(decision)) throw new Error('Invalid assignment response.');

  const supabase = await createClient();
  const { error } = await supabase.rpc('respond_to_assignment', {
    target_assignment_id: assignmentId,
    accept_assignment: decision === 'ACCEPT',
    decline_reason: decision === 'REJECT' ? String(formData.get('reason') ?? '').slice(0, 500) : null,
  });
  if (error) throw new Error('Your response could not be saved. The assignment may have changed.');
  revalidatePath('/portal');
}

export async function submitServiceEstimate(formData: FormData) {
  await requirePortalAccount(['TECHNICIAN']);
  const bookingId = String(formData.get('bookingId') ?? '');
  const description = String(formData.get('description') ?? '').trim();
  const itemType = String(formData.get('itemType') ?? 'LABOUR');
  const unitPrice = Number(formData.get('unitPrice'));
  const quantity = Number(formData.get('quantity') ?? 1);
  const taxAmount = Number(formData.get('taxAmount') ?? 0);
  const discountAmount = Number(formData.get('discountAmount') ?? 0);
  const notes = String(formData.get('notes') ?? '').trim();
  if (!bookingId || !description || description.length > 300
    || !['PART', 'LABOUR', 'GAS', 'OTHER'].includes(itemType)
    || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000
    || !Number.isFinite(unitPrice) || unitPrice < 0
    || !Number.isFinite(taxAmount) || taxAmount < 0 || taxAmount > 10_000_000
    || !Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > 10_000_000) {
    throw new Error('Enter a valid estimate line item and amounts.');
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('submit_service_estimate', {
    target_booking_id: bookingId,
    estimate_items: [{ item_type: itemType, description, quantity, unit_price: unitPrice }],
    tax_amount: taxAmount,
    discount_amount: discountAmount,
    estimate_notes: notes || null,
  });
  if (error) throw new Error('The estimate could not be submitted. Check that the job is in progress and try again.');
  revalidatePath('/portal');
}

export async function decideServiceEstimate(formData: FormData) {
  await requirePortalAccount(['CUSTOMER']);
  const estimateId = String(formData.get('estimateId') ?? '');
  const decision = String(formData.get('decision') ?? '');
  if (!estimateId || !['APPROVE', 'REJECT'].includes(decision)) throw new Error('Invalid estimate decision.');

  const supabase = await createClient();
  const { error } = await supabase.rpc('decide_service_estimate', {
    target_estimate_id: estimateId,
    approve_estimate: decision === 'APPROVE',
  });
  if (error) throw new Error('Your estimate decision could not be saved. Please refresh and try again.');
  revalidatePath('/portal');
}

export async function completeServiceJob(formData: FormData) {
  await requirePortalAccount(['TECHNICIAN']);
  const bookingId = String(formData.get('bookingId') ?? '');
  const diagnosisNotes = String(formData.get('diagnosisNotes') ?? '').trim();
  const workPerformed = String(formData.get('workPerformed') ?? '').trim();
  const serviceAmount = Number(formData.get('serviceAmount'));
  if (!bookingId || !workPerformed || workPerformed.length > 5000
    || diagnosisNotes.length > 5000 || !Number.isFinite(serviceAmount)
    || serviceAmount < 0 || serviceAmount > 10_000_000) {
    throw new Error('Complete all required service report fields with valid amounts.');
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('complete_service_job', {
    target_booking_id: bookingId,
    diagnosis_notes: diagnosisNotes,
    work_performed: workPerformed,
    service_amount: serviceAmount,
  });
  if (error) throw new Error('The job could not be completed. Resolve any pending estimate and try again.');
  revalidatePath('/portal');
}

export async function recordCashPayment(formData: FormData) {
  await requirePortalAccount(['ADMIN', 'SUPER_ADMIN']);
  const paymentId = String(formData.get('paymentId') ?? '');
  if (!paymentId) throw new Error('Payment record is missing.');
  const supabase = await createClient();
  const { error } = await supabase.rpc('record_cash_payment', { target_payment_id: paymentId });
  if (error) throw new Error('Cash payment could not be reconciled.');
  revalidatePath('/portal');
}

export async function markNotificationRead(formData: FormData) {
  const account = await requirePortalAccount();
  const notificationId = String(formData.get('notificationId') ?? '');
  if (!notificationId) throw new Error('Notification not found.');
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', account.user.id);
  if (error) throw new Error('Notification could not be marked as read.');
  revalidatePath('/portal');
}

export async function submitBookingReview(formData: FormData) {
  await requirePortalAccount(['CUSTOMER']);
  const bookingId = String(formData.get('bookingId') ?? '');
  const rating = Number(formData.get('rating'));
  const comment = String(formData.get('comment') ?? '').trim();
  if (!bookingId || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 2000) {
    throw new Error('Enter a valid rating and review.');
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc('submit_booking_review', {
    target_booking_id: bookingId,
    review_rating: rating,
    review_comment: comment || null,
  });
  if (error) throw new Error('Your review could not be saved. You may already have reviewed this booking.');
  revalidatePath('/portal');
}

export async function inviteStaffMember(formData: FormData) {
  await requirePortalAccount(['SUPER_ADMIN']);
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('role') ?? '') as UserRole;
  if (fullName.length < 2 || fullName.length > 150
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !['TECHNICIAN', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    throw new Error('Enter a valid name, email, and staff role.');
  }

  const origin = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${origin}/auth/callback?next=%2Fportal`,
  });
  if (error || !data.user) throw new Error('The invitation could not be sent. Check the email provider and try again.');

  const supabase = await createClient();
  const { error: roleError } = await supabase.rpc('update_user_role', {
    target_user_id: data.user.id,
    target_role: role,
  });
  if (roleError) throw new Error('The invitation was sent, but the staff role could not be assigned. Review the account in user access management.');

  revalidatePath('/portal');
}

export async function updateContactStatus(formData: FormData) {
  await requirePortalAccount(['ADMIN', 'SUPER_ADMIN']);
  const requestId = String(formData.get('requestId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!requestId || !['NEW', 'CONTACTED', 'RESOLVED'].includes(status)) throw new Error('Invalid contact request update.');

  const supabase = await createClient();
  const { error } = await supabase.from('contact_requests').update({ status } as never).eq('id', requestId);
  if (error) throw new Error('The contact request could not be updated.');
  revalidatePath('/portal');
}

export async function assignTechnician(formData: FormData) {
  await requirePortalAccount(['ADMIN', 'SUPER_ADMIN']);
  const bookingId = String(formData.get('bookingId') ?? '');
  const technicianId = String(formData.get('technicianId') ?? '');
  if (!bookingId || !technicianId) throw new Error('Choose a technician and booking.');

  const supabase = await createClient();
  const { error } = await supabase.rpc('assign_booking_technician', {
    target_booking_id: bookingId,
    target_technician_id: technicianId,
  });
  if (error) throw new Error('The technician could not be assigned. Please refresh and try again.');
  revalidatePath('/portal');
}

export async function updateUserRole(formData: FormData) {
  await requirePortalAccount(['SUPER_ADMIN']);
  const userId = String(formData.get('userId') ?? '');
  const role = String(formData.get('role') ?? '') as UserRole;
  if (!userId || !userRoles.includes(role)) throw new Error('Invalid user role update.');
  const supabase = await createClient();
  const { error } = await supabase.rpc('update_user_role', {
    target_user_id: userId,
    target_role: role,
  });
  if (error) throw new Error('The user role could not be changed.');
  revalidatePath('/portal');
}

const MAX_PRICE = 10_000_000;

function parsePriceInput(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > MAX_PRICE) return null;
  return Math.round(value * 100) / 100;
}

/**
 * Super admins set the "starting from" price for each service. Prices are stored
 * in the services table and rendered across the public site; leaving a field
 * empty keeps the current price.
 */
export async function updateServicePricing(formData: FormData) {
  const account = await requirePortalAccount(['SUPER_ADMIN']);
  const supabase = await createClient();

  const slugs = formData.getAll('serviceSlug').map(String);
  let updated = 0;
  for (const slug of slugs) {
    const raw = String(formData.get(`price_${slug}`) ?? '');
    if (!raw.trim()) continue;
    const price = parsePriceInput(raw);
    if (price === null) throw new Error(`Invalid price for ${slug}. Enter a number between 0 and 1,00,00,000.`);
    // .select() makes RLS-filtered updates visible: a silent policy no-op returns
    // zero rows instead of pretending the write succeeded.
    const { data, error } = await supabase
      .from('services')
      .update({ starting_price: price } as never)
      .eq('slug', slug)
      .select('id');
    if (error) throw new Error(`The price for ${slug} could not be saved. Verify the catalog table and try again.`);
    if (!data?.length) throw new Error(`The price for ${slug} was not saved. The database policy is blocking catalog updates — run the pending site_settings migration as an operator, then retry.`);
    updated += 1;
  }
  if (updated === 0) throw new Error('No price changes were submitted.');
  void account;
  revalidatePath('/', 'layout');
}

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s()-]/g, '');
  if (!cleaned) return '';
  return /^\+?\d{10,14}$/.test(cleaned) ? cleaned : null;
}

/**
 * Super admins manage the public contact details (phones, WhatsApp, emails,
 * working hours). Values live in site_settings and override the compiled
 * defaults on every public page. Empty input removes an override.
 */
export async function updateSiteSettings(formData: FormData) {
  const account = await requirePortalAccount(['SUPER_ADMIN']);
  const supabase = await createClient();

  const phoneFields: Array<{ key: string; field: string }> = [
    { key: 'contact.phone', field: 'phone' },
    { key: 'contact.phone_display', field: 'phoneDisplay' },
    { key: 'contact.whatsapp', field: 'whatsapp' },
  ];

  const updates: Array<{ key: string; value: string }> = [];
  const removals: string[] = [];

  for (const { key, field } of phoneFields) {
    const raw = String(formData.get(field) ?? '').trim();
    if (!raw) { removals.push(key); continue; }
    const normalized = normalizePhone(raw);
    if (normalized === null) throw new Error(`Invalid phone number for ${field}. Use digits with an optional + prefix.`);
    if (normalized === '') { removals.push(key); continue; }
    updates.push({ key, value: normalized });
  }

  for (const field of ['email', 'supportEmail'] as const) {
    const raw = String(formData.get(field) ?? '').trim();
    if (!raw) { removals.push(`contact.${field === 'email' ? 'email' : 'support_email'}`); continue; }
    if (!/^\S+@\S+\.\S+$/.test(raw) || raw.length > 200) throw new Error(`Invalid email address for ${field}.`);
    updates.push({ key: `contact.${field === 'email' ? 'email' : 'support_email'}`, value: raw });
  }

  const hours = String(formData.get('workingHours') ?? '').trim();
  if (hours) {
    if (hours.length > 100) throw new Error('Working hours text is too long.');
    updates.push({ key: 'contact.working_hours', value: hours });
  } else {
    removals.push('contact.working_hours');
  }

  for (const { key, value } of updates) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_by: account.profile.id } as never, { onConflict: 'key' });
    if (error) throw new Error('Settings could not be saved. Verify the site_settings table exists (run pending migrations) and try again.');
  }
  for (const key of removals) {
    await supabase.from('site_settings').delete().eq('key', key);
  }

  revalidatePath('/', 'layout');
}
