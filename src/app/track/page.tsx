'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BookingStatusTracker } from '@/components/booking/BookingStatusTracker';

function TrackBookingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [bookingIdInput, setBookingIdInput] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const cleanId = bookingIdInput.trim().toUpperCase();

    if (!cleanId) {
      setErrorMessage('Please enter your Booking ID (e.g. COOLO-2026-123456).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/bookings/track?id=${encodeURIComponent(cleanId)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No booking found matching this ID.');
      }

      setBookingResult(data.booking);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to query booking. Please try again.');
      }
      setBookingResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
          Real-Time Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
          Track Your Service Booking
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-2">
          Enter your Coolo Booking Reference Number to view arrival window, technician assignment, and job progress.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="e.g. COOLO-2026-000001"
              value={bookingIdInput}
              onChange={(e) => setBookingIdInput(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 text-sm font-mono uppercase font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="h-12 text-sm"
          >
            Track Status
          </Button>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your Booking ID was displayed upon confirmation and sent via SMS.</span>
        </div>
      </div>

      {/* Result Display */}
      {bookingResult && (
        <div className="animate-fade-in">
          <BookingStatusTracker booking={bookingResult} />
        </div>
      )}
    </div>
  );
}

export default function TrackBookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading tracker...</div>}>
      <TrackBookingContent />
    </Suspense>
  );
}
