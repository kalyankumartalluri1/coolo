import type { Metadata } from 'next';
import { LoginForm } from '@/components/portal/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in to Coolo',
  robots: { index: false, follow: false },
};

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-[75vh] bg-slate-950 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/20 md:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[580px] flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-800 p-10 text-white md:flex">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border-[48px] border-white/10" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-black ring-1 ring-white/25">C</div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">Coolo operations</p>
            <h1 className="mt-3 max-w-sm text-4xl font-bold leading-tight">The right tools for every role.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-sky-50/85">Manage bookings, coordinate technicians, and keep every customer up to date from one secure workspace.</p>
          </div>
          <div className="relative grid grid-cols-2 gap-3 text-xs font-medium text-white/90">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">Customer bookings</div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">Technician jobs</div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">Service operations</div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">Admin controls</div>
          </div>
        </section>
        <section className="flex items-center px-6 py-10 sm:px-10 md:py-14">
          <LoginForm confirmationError={params.error === 'confirmation'} />
        </section>
      </div>
    </div>
  );
}
