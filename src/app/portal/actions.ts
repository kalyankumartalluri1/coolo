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

  if (role === 'CUSTOMER') {
    if (status !== 'CANCELLED') throw new Error('Customers can only cancel upcoming bookings.');
    const { data: booking } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .maybeSingle();
    if (!booking || !['REQUESTED', 'CONFIRMED'].includes(booking.status)) {
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
      .in('status', ['ASSIGNED', 'ACCEPTED'])
      .maybeSingle();
    if (!assignment || !['TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED'].includes(status)) {
      throw new Error('You can only update the status of your assigned jobs.');
    }
  } else if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('You are not allowed to update bookings.');
  }

  const { error } = await supabase.from('bookings').update({ status } as never).eq('id', bookingId);
  if (error) throw new Error('The booking could not be updated. Please refresh and try again.');
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

  const admin = createAdminClient();
  const { data: technician } = await admin
    .from('technicians')
    .select('id')
    .eq('id', technicianId)
    .eq('is_active', true)
    .maybeSingle();
  if (!technician) throw new Error('That technician is not active.');

  const { data: existing } = await admin
    .from('technician_assignments')
    .select('id')
    .eq('booking_id', bookingId)
    .limit(1)
    .maybeSingle();

  const assignmentResult = existing
    ? await admin.from('technician_assignments').update({ technician_id: technicianId, status: 'ASSIGNED' } as never).eq('id', existing.id)
    : await admin.from('technician_assignments').insert({ booking_id: bookingId, technician_id: technicianId, status: 'ASSIGNED' } as never);

  if (assignmentResult.error) throw new Error('The technician could not be assigned.');
  const { error: bookingError } = await admin.from('bookings').update({ status: 'ASSIGNED' } as never).eq('id', bookingId);
  if (bookingError) throw new Error('The technician was assigned, but the booking status could not be updated.');
  revalidatePath('/portal');
}

export async function updateUserRole(formData: FormData) {
  const account = await requirePortalAccount(['SUPER_ADMIN']);
  const userId = String(formData.get('userId') ?? '');
  const role = String(formData.get('role') ?? '') as UserRole;
  if (!userId || !userRoles.includes(role)) throw new Error('Invalid user role update.');
  if (userId === account.user.id) throw new Error('Use a different super administrator to change your own role.');

  const admin = createAdminClient();
  const { data: target } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (!target) throw new Error('The selected user could not be found.');

  if (role === 'TECHNICIAN') {
    const { data: technician } = await admin.from('technicians').select('id').eq('user_id', userId).maybeSingle();
    if (technician) {
      const { error } = await admin.from('technicians').update({ is_active: true } as never).eq('id', technician.id);
      if (error) throw new Error('The technician profile could not be activated.');
    } else {
      const { error } = await admin.from('technicians').insert({
        user_id: userId,
        employee_code: `COOLO-${userId.toUpperCase()}`,
      } as never);
      if (error) throw new Error('A technician profile could not be created for this user.');
    }
  }

  const { error } = await admin.from('profiles').update({ role } as never).eq('id', userId);
  if (error) throw new Error('The user role could not be changed.');

  if (target.role === 'TECHNICIAN' && role !== 'TECHNICIAN') {
    const { error: technicianError } = await admin.from('technicians').update({ is_active: false } as never).eq('user_id', userId);
    if (technicianError) throw new Error('The role changed, but the technician profile could not be deactivated.');
  }
  revalidatePath('/portal');
}
