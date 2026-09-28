import Link from 'next/link';
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  Headset,
  ShieldCheck,
  Star,
  UserPlus,
  UsersRound,
  Wind,
  Wrench,
} from 'lucide-react';
import type { Database, UserRole } from '@/lib/types/database.types';
import {
  assignTechnician,
  completeServiceJob,
  decideServiceEstimate,
  inviteStaffMember,
  markNotificationRead,
  recordCashPayment,
  respondToAssignment,
  signOut,
  submitBookingReview,
  submitServiceEstimate,
  updateBookingStatus,
  updateContactStatus,
  updateUserRole,
} from '@/app/portal/actions';

type Booking = Database['public']['Tables']['bookings']['Row'];
type ContactRequest = Database['public']['Tables']['contact_requests']['Row'];
type PortalUser = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'email' | 'role' | 'created_at'>;
type TechnicianOption = Pick<Database['public']['Tables']['technicians']['Row'], 'id' | 'employee_code'>;
type AssignmentOption = Pick<Database['public']['Tables']['technician_assignments']['Row'], 'id' | 'booking_id' | 'technician_id' | 'status'>;
type Account = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'email' | 'role'>;
type Estimate = Database['public']['Tables']['service_estimates']['Row'] & {
  items: Database['public']['Tables']['estimate_items']['Row'][];
};
type ServiceRecord = Database['public']['Tables']['service_records']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type BookingHistory = Database['public']['Tables']['booking_status_history']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

const roleDetails: Record<UserRole, { label: string; title: string; description: string }> = {
  CUSTOMER: { label: 'Customer', title: 'Your services, in one place.', description: 'Track upcoming visits, see completed work, and manage the bookings connected to your account.' },
  TECHNICIAN: { label: 'Technician', title: 'Your field-work dashboard.', description: 'Review assigned service jobs and keep customers informed as work progresses.' },
  ADMIN: { label: 'Administrator', title: 'Service operations.', description: 'Triage bookings, follow up on customer enquiries, and keep daily operations moving.' },
  SUPER_ADMIN: { label: 'Super administrator', title: 'Coolo control center.', description: 'Oversee service operations and manage role access for the team.' },
};

const statusLabels: Record<string, string> = {
  REQUESTED: 'Requested', CONFIRMED: 'Confirmed', ASSIGNED: 'Assigned',
  TECHNICIAN_ON_THE_WAY: 'Technician on the way', IN_PROGRESS: 'In progress',
  WAITING_FOR_APPROVAL: 'Waiting for approval', COMPLETED: 'Completed',
  CANCELLED: 'Cancelled', NO_SHOW: 'No show',
};

const statusStyles: Record<string, string> = {
  REQUESTED: 'bg-amber-50 text-amber-700 ring-amber-600/10',
  CONFIRMED: 'bg-sky-50 text-sky-700 ring-sky-600/10',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 ring-indigo-600/10',
  TECHNICIAN_ON_THE_WAY: 'bg-cyan-50 text-cyan-700 ring-cyan-600/10',
  IN_PROGRESS: 'bg-violet-50 text-violet-700 ring-violet-600/10',
  WAITING_FOR_APPROVAL: 'bg-orange-50 text-orange-700 ring-orange-600/10',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  NO_SHOW: 'bg-rose-50 text-rose-700 ring-rose-600/10',
};

const roleOptions: UserRole[] = ['CUSTOMER', 'TECHNICIAN', 'ADMIN', 'SUPER_ADMIN'];

function formattedDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`));
}

function addressArea(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Service location';
  const address = value as Record<string, unknown>;
  return [address.area, address.city].filter((part): part is string => typeof part === 'string' && Boolean(part)).join(', ') || 'Service location';
}

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: typeof CalendarDays }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="flex items-start justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className="rounded-xl bg-sky-50 p-2 text-sky-700"><Icon className="h-4 w-4" /></span></div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function BookingCard({ booking, role, technicians, assignment, estimates, serviceRecord, payments, review, history }: {
  booking: Booking;
  role: UserRole;
  technicians: TechnicianOption[];
  assignment?: AssignmentOption;
  estimates: Estimate[];
  serviceRecord?: ServiceRecord;
  payments: Payment[];
  review?: Review;
  history: BookingHistory[];
}) {
  const adminTransitions: Partial<Record<Booking['status'], Booking['status'][]>> = {
    REQUESTED: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
    CONFIRMED: ['CANCELLED', 'NO_SHOW'],
    ASSIGNED: ['CANCELLED', 'NO_SHOW'],
    TECHNICIAN_ON_THE_WAY: ['CANCELLED', 'NO_SHOW'],
    IN_PROGRESS: ['CANCELLED', 'NO_SHOW'],
    WAITING_FOR_APPROVAL: ['CANCELLED', 'NO_SHOW'],
  };
  const technicianNextStatus = booking.status === 'ASSIGNED'
    ? 'TECHNICIAN_ON_THE_WAY'
    : booking.status === 'TECHNICIAN_ON_THE_WAY' ? 'IN_PROGRESS' : null;
  const allowedStatuses = role === 'TECHNICIAN'
    ? technicianNextStatus ? [technicianNextStatus] : []
    : adminTransitions[booking.status] ?? [];
  const customerCanCancel = role === 'CUSTOMER' && ['REQUESTED', 'CONFIRMED'].includes(booking.status);
  const canUpdate = allowedStatuses.length > 0 && (role !== 'TECHNICIAN' || assignment?.status === 'ACCEPTED');
  const canAssign = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const canAssignNow = canAssign && ['REQUESTED', 'CONFIRMED', 'ASSIGNED'].includes(booking.status);
  const bookingEstimates = estimates.filter((estimate) => estimate.booking_id === booking.id);
  const pendingEstimate = bookingEstimates.find((estimate) => estimate.status === 'PENDING_APPROVAL');
  const bookingPayments = payments.filter((payment) => payment.booking_id === booking.id);

  return (
    <article className="border-b border-slate-100 px-5 py-5 last:border-0 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900">{booking.booking_number}</p>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[booking.status] ?? 'bg-slate-100 text-slate-700 ring-slate-500/10'}`}>{statusLabels[booking.status] ?? booking.status}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{booking.customer_name} <span className="text-slate-300">·</span> {booking.customer_mobile}</p>
        <p className="mt-1 text-xs text-slate-500">{formattedDate(booking.scheduled_date)} · {booking.scheduled_time_slot} · {addressArea(booking.address_snapshot)}</p>
        <p className="mt-1 text-xs text-slate-500">{booking.ac_type} AC{booking.ac_brand ? ` · ${booking.ac_brand}` : ''}{booking.ac_age ? ` · ${booking.ac_age}` : ''}{booking.customer_email ? ` · ${booking.customer_email}` : ''}</p>
        {booking.problem_description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{booking.problem_description}</p>}
      </div>
      {(canUpdate || customerCanCancel || (canAssignNow && technicians.length > 0) || (role === 'TECHNICIAN' && assignment?.status === 'ASSIGNED')) && <div className="flex flex-col gap-2 sm:items-end">
        {(canUpdate || customerCanCancel) && <form action={updateBookingStatus} className="flex items-center gap-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          {customerCanCancel ? <button name="status" value="CANCELLED" className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">Cancel booking</button> : <>
            <select name="status" defaultValue={booking.status} aria-label={`Update status for ${booking.booking_number}`} className="max-w-48 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500">
              <option value={booking.status} disabled>Current: {statusLabels[booking.status]}</option>
              {allowedStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
            <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-800">Update</button>
          </>}
        </form>}
        {role === 'TECHNICIAN' && assignment?.status === 'ASSIGNED' && <div className="flex gap-2">
          <form action={respondToAssignment}><input type="hidden" name="assignmentId" value={assignment.id} /><button name="decision" value="ACCEPT" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Accept job</button></form>
          <form action={respondToAssignment} className="flex gap-1"><input type="hidden" name="assignmentId" value={assignment.id} /><input name="reason" maxLength={500} aria-label="Optional reason for declining" placeholder="Reason (optional)" className="w-32 rounded-lg border border-slate-200 px-2 py-1 text-xs" /><button name="decision" value="REJECT" className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Decline</button></form>
        </div>}
        {canAssignNow && technicians.length > 0 && <form action={assignTechnician} className="flex items-center gap-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          <select name="technicianId" defaultValue={assignment?.technician_id ?? ''} aria-label={`Assign a technician to ${booking.booking_number}`} className="max-w-48 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500">
            <option value="" disabled>Select technician</option>
            {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.employee_code}</option>)}
          </select>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Assign</button>
        </form>}
      </div>}
      </div>

      {role === 'TECHNICIAN' && assignment?.status === 'ACCEPTED' && booking.status === 'IN_PROGRESS' && <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {!pendingEstimate && booking.customer_id && <form action={submitServiceEstimate} className="space-y-2 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
          <input type="hidden" name="bookingId" value={booking.id} />
          <h3 className="text-sm font-bold text-slate-900">Prepare customer estimate</h3>
          <div className="grid grid-cols-[1fr_auto] gap-2"><input name="description" required maxLength={300} placeholder="Labour / part description" className="rounded-lg border border-slate-200 px-3 py-2 text-xs" /><input name="unitPrice" required type="number" min="0" step="0.01" placeholder="₹ amount" className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-xs" /></div>
          <div className="grid grid-cols-3 gap-2"><select name="itemType" className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs"><option value="LABOUR">Labour</option><option value="PART">Part</option><option value="GAS">Gas</option><option value="OTHER">Other</option></select><input name="quantity" required type="number" min="1" max="1000" defaultValue="1" aria-label="Quantity" className="rounded-lg border border-slate-200 px-2 py-2 text-xs" /><input name="taxAmount" type="number" min="0" step="0.01" defaultValue="0" aria-label="Tax amount" placeholder="Tax ₹" className="rounded-lg border border-slate-200 px-2 py-2 text-xs" /></div>
          <input name="discountAmount" type="number" min="0" step="0.01" defaultValue="0" aria-label="Discount amount" placeholder="Discount ₹" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
          <textarea name="notes" maxLength={1000} placeholder="Notes for the customer (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
          <button className="rounded-lg bg-sky-700 px-3 py-2 text-xs font-semibold text-white">Send estimate for approval</button>
        </form>}
        {!pendingEstimate && <form action={completeServiceJob} className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <input type="hidden" name="bookingId" value={booking.id} />
          <h3 className="text-sm font-bold text-slate-900">Complete service report</h3>
          <textarea name="diagnosisNotes" maxLength={5000} placeholder="Diagnosis (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
          <textarea name="workPerformed" required maxLength={5000} placeholder="Work performed" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
          <input name="serviceAmount" required type="number" min="0" step="0.01" defaultValue={booking.estimated_price ?? 0} aria-label="Final amount" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" />
          <button className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Submit report and complete job</button>
        </form>}
        {!booking.customer_id && !pendingEstimate && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">This is a guest booking without a linked portal account, so a customer-approval estimate cannot be sent from here. Contact the customer and record the final service report.</p>}
      </div>}

      {bookingEstimates.length > 0 && <section className="mt-5 space-y-3">
        {bookingEstimates.map((estimate) => <div key={estimate.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-900">Service estimate · ₹{estimate.total_amount.toFixed(2)}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{estimate.status.replace('_', ' ')}</span></div>
          {estimate.items.map((item) => <p key={item.id} className="mt-2 text-xs text-slate-600">{item.quantity} × {item.description} — ₹{item.total_price.toFixed(2)}</p>)}
          {estimate.notes && <p className="mt-2 text-xs text-slate-500">{estimate.notes}</p>}
          {role === 'CUSTOMER' && estimate.status === 'PENDING_APPROVAL' && <div className="mt-3 flex gap-2"><form action={decideServiceEstimate}><input type="hidden" name="estimateId" value={estimate.id} /><button name="decision" value="APPROVE" className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Approve estimate</button></form><form action={decideServiceEstimate}><input type="hidden" name="estimateId" value={estimate.id} /><button name="decision" value="REJECT" className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Decline</button></form></div>}
        </div>)}
      </section>}

      {serviceRecord && <section className="mt-4 rounded-xl bg-slate-50 p-4"><h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileText className="h-4 w-4 text-sky-700" />Service report</h3>{serviceRecord.diagnosis_notes && <p className="mt-2 text-xs text-slate-600"><strong>Diagnosis:</strong> {serviceRecord.diagnosis_notes}</p>}<p className="mt-2 text-xs text-slate-600"><strong>Work performed:</strong> {serviceRecord.work_performed}</p><p className="mt-2 text-xs font-semibold text-slate-700">Final amount: ₹{(serviceRecord.final_amount ?? 0).toFixed(2)}</p></section>}

      {bookingPayments.map((payment) => <div key={payment.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3"><p className="flex items-center gap-2 text-xs text-slate-700"><CircleDollarSign className="h-4 w-4 text-emerald-700" />₹{payment.amount.toFixed(2)} · {payment.payment_method} · {payment.status}</p>{(role === 'ADMIN' || role === 'SUPER_ADMIN') && payment.status === 'PENDING' && payment.payment_method === 'CASH' && <form action={recordCashPayment}><input type="hidden" name="paymentId" value={payment.id} /><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Confirm cash collected</button></form>}</div>)}

      {role === 'CUSTOMER' && booking.status === 'COMPLETED' && !review && <form action={submitBookingReview} className="mt-4 grid gap-2 rounded-xl border border-amber-100 bg-amber-50/40 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-end"><input type="hidden" name="bookingId" value={booking.id} /><label className="text-xs font-semibold text-slate-700">Rate your service<select name="rating" defaultValue="5" className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Poor</option><option value="1">1 — Bad</option></select></label><input name="comment" maxLength={2000} placeholder="Share feedback (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-xs" /><button className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white"><Star className="h-3.5 w-3.5" />Submit review</button></form>}
      {review && <p className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700"><Star className="h-4 w-4 fill-current" />Your rating: {review.rating}/5{review.comment ? ` · ${review.comment}` : ''}</p>}

      {history.length > 0 && <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold text-slate-500">Booking history ({history.length})</summary><ol className="mt-2 space-y-2 border-l border-slate-200 pl-4">{history.map((item) => <li key={item.id} className="text-xs text-slate-500"><span className="font-semibold text-slate-700">{item.to_status.replaceAll('_', ' ')}</span> · {new Date(item.created_at).toLocaleString('en-IN')}</li>)}</ol></details>}
    </article>
  );
}

export function PortalDashboard({ account, bookings, contacts, users, technicians, assignmentByBooking, technicianReady, estimates, serviceRecords, payments, reviews, bookingHistory, notifications }: {
  account: Account;
  bookings: Booking[];
  contacts: ContactRequest[];
  users: PortalUser[];
  technicians: TechnicianOption[];
  assignmentByBooking: Record<string, AssignmentOption>;
  technicianReady: boolean;
  estimates: Estimate[];
  serviceRecords: ServiceRecord[];
  payments: Payment[];
  reviews: Review[];
  bookingHistory: BookingHistory[];
  notifications: Notification[];
}) {
  const details = roleDetails[account.role];
  const activeBookings = bookings.filter((booking) => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(booking.status)).length;
  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED').length;
  const openContacts = contacts.filter((request) => request.status !== 'RESOLVED').length;

  return (
    <div className="min-h-[80vh] bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/20"><Wind className="h-5 w-5" /></span>
            <span><span className="block text-sm font-extrabold tracking-wide text-slate-950">COOLO</span><span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Workspace</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{account.full_name}</p><p className="text-xs text-slate-500">{details.label}</p></div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{account.full_name.slice(0, 1).toUpperCase()}</span>
            <form action={signOut}><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">Sign out</button></form>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{details.label} workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{details.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{details.description}</p></div>
          {account.role === 'CUSTOMER' && <Link href="/book-service" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800">Book a service <ArrowUpRight className="h-4 w-4" /></Link>}
        </div>

        {account.role === 'TECHNICIAN' && !technicianReady && <div role="status" className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><Wrench className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Technician profile pending.</strong> Your account is active, but a technician record has not been linked yet. Ask a Coolo administrator to finish onboarding.</p></div>}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={account.role === 'CUSTOMER' ? 'My bookings' : 'Bookings in view'} value={bookings.length} detail={account.role === 'TECHNICIAN' ? 'Assigned service jobs' : 'Recent service requests'} icon={ClipboardList} />
          <StatCard label="Active" value={activeBookings} detail="Requests still being worked" icon={Clock3} />
          <StatCard label="Completed" value={completedBookings} detail="Jobs marked complete" icon={CheckCircle2} />
          {(account.role === 'ADMIN' || account.role === 'SUPER_ADMIN') ? <StatCard label="Open enquiries" value={openContacts} detail="Customer messages to follow up" icon={Headset} /> : <StatCard label="Role access" value={account.role === 'CUSTOMER' ? 1 : 2} detail={account.role === 'CUSTOMER' ? 'Personal service workspace' : 'Protected team workspace'} icon={ShieldCheck} />}
        </div>

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-slate-900">{account.role === 'CUSTOMER' ? 'Your bookings' : account.role === 'TECHNICIAN' ? 'Assigned jobs' : 'Booking queue'}</h2><p className="mt-1 text-xs text-slate-500">{account.role === 'CUSTOMER' ? 'Only bookings made while signed in are listed here.' : 'Latest service requests and their current status.'}</p></div><CalendarDays className="h-5 w-5 text-slate-400" /></div>
            {bookings.length ? bookings.map((booking) => <BookingCard
              key={booking.id}
              booking={booking}
              role={account.role}
              technicians={technicians}
              assignment={assignmentByBooking[booking.id]}
              estimates={estimates}
              serviceRecord={serviceRecords.find((record) => record.booking_id === booking.id)}
              payments={payments}
              review={reviews.find((item) => item.booking_id === booking.id)}
              history={bookingHistory.filter((item) => item.booking_id === booking.id)}
            />) : <div className="px-6 py-14 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ClipboardList className="h-5 w-5" /></span><p className="mt-4 text-sm font-semibold text-slate-800">{account.role === 'CUSTOMER' ? 'No account bookings yet' : account.role === 'TECHNICIAN' ? 'No assigned jobs' : 'No bookings to show'}</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{account.role === 'CUSTOMER' ? 'Book a service while signed in and it will appear here. Guest bookings are not automatically attached to your account.' : account.role === 'TECHNICIAN' && !technicianReady ? 'Your jobs will appear after an administrator links your technician profile.' : 'New requests will appear in this queue as customers submit them.'}</p></div>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-700" /><h2 className="text-sm font-bold text-slate-900">Your access</h2></div>
              <p className="mt-3 text-xs leading-5 text-slate-500">This workspace is scoped to your assigned role. Sensitive operations and data updates are re-checked on the server.</p>
              <div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Signed in as</p><p className="mt-1 break-all text-xs font-medium text-slate-700">{account.email ?? 'Email unavailable'}</p></div>
            </section>
            {account.role === 'CUSTOMER' && <section className="rounded-2xl bg-gradient-to-br from-sky-700 to-cyan-700 p-5 text-white"><p className="text-xs font-semibold uppercase tracking-wider text-sky-100">Need help?</p><h2 className="mt-2 text-lg font-bold">We’re here to help.</h2><p className="mt-1 text-xs leading-5 text-sky-50/85">Reach the Coolo team for booking and service support.</p><Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-xs font-bold hover:text-cyan-100">Contact support <ArrowUpRight className="h-3.5 w-3.5" /></Link></section>}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4"><Bell className="h-4 w-4 text-sky-700" /><h2 className="text-sm font-bold text-slate-900">Notifications</h2></div>
              {notifications.length ? <ul className="divide-y divide-slate-100">{notifications.map((notification) => <li key={notification.id} className={`px-5 py-3 ${notification.is_read ? 'opacity-60' : ''}`}><p className="text-xs font-semibold text-slate-800">{notification.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{notification.message}</p>{!notification.is_read && <form action={markNotificationRead} className="mt-2"><input type="hidden" name="notificationId" value={notification.id} /><button className="text-[11px] font-semibold text-sky-700">Mark read</button></form>}</li>)}</ul> : <p className="px-5 py-6 text-xs text-slate-500">You’re all caught up.</p>}
            </section>
          </aside>
        </div>

        {(account.role === 'ADMIN' || account.role === 'SUPER_ADMIN') && <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-slate-900">Customer enquiries</h2><p className="mt-1 text-xs text-slate-500">Private contact requests are visible only to administrators.</p></div><Headset className="h-5 w-5 text-slate-400" /></div>
          {contacts.length ? contacts.map((request) => <article key={request.id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-slate-900">{request.name}</p><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{request.status}</span></div><p className="mt-1 text-xs text-slate-500">{request.mobile}{request.email ? ` · ${request.email}` : ''} · {formattedDate(request.created_at.slice(0, 10))}</p><p className="mt-2 text-sm leading-5 text-slate-600">{request.message}</p></div><form action={updateContactStatus} className="flex items-center gap-2"><input type="hidden" name="requestId" value={request.id} /><select name="status" defaultValue={request.status} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs"><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="RESOLVED">Resolved</option></select><button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-800">Save</button></form></article>) : <p className="px-6 py-9 text-center text-sm text-slate-500">No customer enquiries yet.</p>}
        </section>}

        {account.role === 'SUPER_ADMIN' && <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-bold text-slate-900">User access management</h2><p className="mt-1 text-xs text-slate-500">Invite staff, promote existing accounts, or adjust access. New public registrations always default to customer.</p></div><UsersRound className="h-5 w-5 text-slate-400" /></div>
          <form action={inviteStaffMember} className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end sm:px-6"><label className="text-xs font-semibold text-slate-600">Staff name<input name="fullName" required minLength={2} maxLength={150} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-slate-600">Work email<input name="email" required type="email" autoComplete="email" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /></label><label className="text-xs font-semibold text-slate-600">Role<select name="role" defaultValue="TECHNICIAN" className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="TECHNICIAN">Technician</option><option value="ADMIN">Administrator</option><option value="SUPER_ADMIN">Super administrator</option></select></label><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white"><UserPlus className="h-4 w-4" />Invite staff</button><p className="text-xs text-slate-500 sm:col-span-4">Invitees receive a secure email link to set their own password. No shared credentials are created.</p></form>
          {users.map((user) => <article key={user.id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{user.full_name}{user.id === account.id ? ' (you)' : ''}</p><p className="mt-1 truncate text-xs text-slate-500">{user.email ?? 'No email on profile'}</p></div>{user.id === account.id ? <span className="text-xs font-semibold text-sky-700">Super administrator</span> : <form action={updateUserRole} className="flex items-center gap-2"><input type="hidden" name="userId" value={user.id} /><select name="role" defaultValue={user.role} aria-label={`Role for ${user.full_name}`} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs">{roleOptions.map((role) => <option key={role} value={role}>{role.replace('_', ' ')}</option>)}</select><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Save role</button></form>}</article>)}
          {!users.length && <p className="px-6 py-9 text-center text-sm text-slate-500">No user profiles found.</p>}
        </section>}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400"><span>Coolo role-based workspace</span><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Protected by Supabase authentication and row-level security</span></footer>
      </main>
    </div>
  );
}
