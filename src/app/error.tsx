'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Home, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/constants/brand';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg mx-auto">
        {/* Error icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-rose-500" strokeWidth={1.5} />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3">
          Something went wrong
        </p>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
          An unexpected error occurred
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed mb-2 max-w-md mx-auto">
          We apologize for the inconvenience. The Coolo team has been notified. You can try again or return to our homepage.
        </p>

        {error.digest && (
          <p className="text-[11px] text-slate-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Button onClick={reset} variant="primary" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button href="/" variant="outline" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>

        {/* Emergency contact */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 inline-flex items-center gap-3">
          <Phone className="w-5 h-5 text-sky-600 shrink-0" />
          <div className="text-left">
            <p className="text-xs text-slate-500">Need urgent AC service? Call us:</p>
            <a href={`tel:${BRAND.contact.phone}`} className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors">
              {BRAND.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
