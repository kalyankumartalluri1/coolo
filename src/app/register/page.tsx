'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wind, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/[\s-]/g, '');
    const mobilePattern = /^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$/;
    if (!mobilePattern.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!email || !password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: cleanMobile,
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account.');
      }

      router.push('/account');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-md mx-auto px-4 sm:px-6">
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
          Create Your Coolo Account
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track service visits, store addresses, and view digital AC warranties.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200/90 shadow-xl shadow-slate-200/50">
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number (10 digits) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98765 43210"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password (6+ characters) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500"
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
            Create Customer Account
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your data is protected under strict Row Level Security (RLS).</span>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-sky-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </Card>
    </div>
  );
}
