'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

export function LoginForm({ confirmationError = false }: { confirmationError?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    setError('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const supabase = createClient();

    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('Those sign-in details were not accepted. Check them and try again.');
        setPending(false);
        return;
      }
      router.replace('/portal');
      router.refresh();
      return;
    }

    const fullName = String(form.get('fullName') ?? '').trim();
    const mobile = String(form.get('mobile') ?? '').trim();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, mobile },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.session) {
      router.replace('/portal');
      router.refresh();
      return;
    } else {
      setMessage('Check your email to confirm your account. New accounts start with customer access.');
    }
    setPending(false);
  }

  return (
    <div className="w-full">
      <Link href="/" className="text-sm font-bold tracking-wide text-sky-700">COOLO <span className="font-medium text-slate-400">/ secure portal</span></Link>
      <h2 className="mt-7 text-3xl font-bold tracking-tight text-slate-950">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'signin' ? 'Sign in to open the workspace for your account.' : 'Create a customer account to track your service bookings.'}</p>

      {confirmationError && <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">That confirmation link could not be verified. Please request a new one.</p>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {mode === 'signup' && <>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="fullName">Full name</label>
          <div className="relative -mt-2"><UserRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input id="fullName" name="fullName" required minLength={2} autoComplete="name" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="Your name" /></div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="mobile">Mobile (optional)</label>
          <input id="mobile" name="mobile" type="tel" autoComplete="tel" className="-mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="Your mobile number" />
        </>}
        <label className="block text-sm font-semibold text-slate-700" htmlFor="email">Email address</label>
        <div className="relative -mt-2"><Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="you@example.com" /></div>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
        <div className="relative -mt-2"><LockKeyhole className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input id="password" name="password" type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 rounded-md p-0.5 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
        <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-wait disabled:opacity-70">
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <>{mode === 'signin' ? 'Sign in' : 'Create customer account'} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === 'signin' ? 'New to Coolo? ' : 'Already have an account? '}
        <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage(''); }} className="font-semibold text-sky-700 hover:text-sky-900">
          {mode === 'signin' ? 'Create a customer account' : 'Sign in'}
        </button>
      </p>
      <p className="mt-8 text-center text-xs leading-5 text-slate-400">Staff accounts are provisioned by Coolo administrators. Role access is never self-selected during registration.</p>
    </div>
  );
}
