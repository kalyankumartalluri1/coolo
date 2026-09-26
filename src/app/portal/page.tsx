import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { requirePortalAccount } from '@/lib/auth/portal';
import type { Database } from '@/lib/types/database.types';
import { PortalDashboard } from '@/components/portal/PortalDashboard';

export const metadata: Metadata = {
  title: 'Your Coolo workspace',
  robots: { index: false, follow: false },
};

type Booking = Database['public']['Tables']['bookings']['Row'];
type ContactRequest = Database['public']['Tables']['contact_requests']['Row'];
type PortalUser = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'email' | 'role' | 'created_at'>;
type TechnicianOption = Pick<Database['public']['Tables']['technicians']['Row'], 'id' | 'employee_code'>;

export default async function PortalPage() {
  const account = await requirePortalAccount();
  const supabase = await createClient();
  let bookings: Booking[] = [];
  let contacts: ContactRequest[] = [];
  let users: PortalUser[] = [];
  let technicians: TechnicianOption[] = [];
  let assignedTechnicianByBooking: Record<string, string> = {};
  let technicianReady = true;

  if (account.profile.role === 'CUSTOMER') {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', account.user.id)
      .maybeSingle();

    if (customer) {
      const result = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customer.id)
        .order('scheduled_date', { ascending: false });
      bookings = result.data ?? [];
    }
  } else if (account.profile.role === 'TECHNICIAN') {
    const { data: technician } = await supabase
      .from('technicians')
      .select('id')
      .eq('user_id', account.user.id)
      .eq('is_active', true)
      .maybeSingle();

    technicianReady = Boolean(technician);
    if (technician) {
      const { data: assignments } = await supabase
        .from('technician_assignments')
        .select('booking_id')
        .eq('technician_id', technician.id)
        .in('status', ['ASSIGNED', 'ACCEPTED']);
      const bookingIds = assignments?.map((assignment) => assignment.booking_id) ?? [];

      if (bookingIds.length) {
        const result = await supabase
          .from('bookings')
          .select('*')
          .in('id', bookingIds)
          .order('scheduled_date', { ascending: true });
        bookings = result.data ?? [];
      }
    }
  } else {
    const bookingResult = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    bookings = bookingResult.data ?? [];

    const contactResult = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    contacts = contactResult.data ?? [];

    const technicianResult = await supabase
      .from('technicians')
      .select('id, employee_code')
      .eq('is_active', true)
      .order('employee_code');
    technicians = technicianResult.data ?? [];

    const bookingIds = bookings.map((booking) => booking.id);
    if (bookingIds.length) {
      const { data: assignments } = await supabase
        .from('technician_assignments')
        .select('booking_id, technician_id')
        .in('booking_id', bookingIds);
      assignedTechnicianByBooking = Object.fromEntries(
        (assignments ?? []).map((assignment) => [assignment.booking_id, assignment.technician_id])
      );
    }

    if (account.profile.role === 'SUPER_ADMIN') {
      const userResult = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      users = userResult.data ?? [];
    }
  }

  return (
    <PortalDashboard
      account={account.profile}
      bookings={bookings}
      contacts={contacts}
      users={users}
      technicians={technicians}
      assignedTechnicianByBooking={assignedTechnicianByBooking}
      technicianReady={technicianReady}
    />
  );
}
