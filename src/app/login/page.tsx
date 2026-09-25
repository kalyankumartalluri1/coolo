'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wind, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Wrench } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';
  const errorParam = searchParams.get('error') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'admin_access_required'
      ? 'Admin credentials required to access the operational portal.'
      : errorParam === 'technician_access_required'
      ? 'Technician credentials required to access assigned dispatch jobs.'
      : ''
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      const destination = redirectTarget || data.redirectUrl || '/account';
      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Switcher Helper
  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('coolo123');
    setErrorMessage('');
  };

  return (
    <div className="py-16 max-w-md mx-auto px-4 sm:px-6">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Wind className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {BRAND.name}
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Access your bookings, service records, or dispatch dashboard.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200/90 shadow-xl shadow-slate-200/50">
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/contact"
                className="text-[11px] font-semibold text-sky-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast-Switch Buttons for Reviewers/Evaluators */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
            ⚡ 1-Click Role Testing Switcher
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => fillCredentials('customer@coolo.in')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-[11px] font-semibold text-slate-700 transition-colors flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('tech@coolo.in')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-[11px] font-semibold text-slate-700 transition-colors flex flex-col items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5 text-teal-600" />
              <span>Technician</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@coolo.in')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-[11px] font-semibold text-slate-700 transition-colors flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-sky-600 hover:underline">
            Register as Customer
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
