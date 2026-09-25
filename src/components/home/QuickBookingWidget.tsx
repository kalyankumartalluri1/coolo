'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Wrench, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { SERVICES } from '@/lib/constants/services';
import { SERVICE_CITIES, TIME_SLOTS } from '@/lib/constants/areas';
import { Button } from '@/components/ui/Button';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    bookingNumber: string;
    serviceName: string;
    area: string;
    date: string;
    time: string;
    customerName: string;
  } | null;
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  bookingData,
}) => {
  if (!isOpen || !bookingData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-3">
          Status: REQUESTED
        </span>

        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Service Request Received!
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Your booking is confirmed in our system. A service coordinator is assigning a certified technician for your slot.
        </p>

        {/* Booking Card Details */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 mb-6 space-y-2.5 text-xs text-slate-700">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="font-semibold text-slate-500 uppercase tracking-wide">Booking ID</span>
            <span className="font-mono font-bold text-sky-600 text-sm">
              {bookingData.bookingNumber}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Service</span>
            <span className="font-medium text-slate-900">{bookingData.serviceName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Area</span>
            <span className="font-medium text-slate-900">{bookingData.area}, Bangalore</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Date & Slot</span>
            <span className="font-medium text-slate-900">
              {bookingData.date} ({bookingData.time})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Customer</span>
            <span className="font-medium text-slate-900">{bookingData.customerName}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          You will receive a confirmation call or message before the technician visits your premises. No upfront payment required.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
          <Button
            href={`/services`}
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Explore Services
          </Button>
        </div>
      </div>
    </div>
  );
};

export const QuickBookingWidget: React.FC = () => {
  // Format today's date for minimum input (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const [serviceSlug, setServiceSlug] = useState('ac-service');
  const [areaName, setAreaName] = useState('Bangalore');
  const [preferredDate, setPreferredDate] = useState(today);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(TIME_SLOTS[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successModalData, setSuccessModalData] = useState<{
    bookingNumber: string;
    serviceName: string;
    area: string;
    date: string;
    time: string;
    customerName: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Quick client-side validations
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanMobile = customerMobile.replace(/[\s-]/g, '');
    const mobilePattern = /^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$/;
    if (!mobilePattern.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!preferredDate) {
      setErrorMessage('Please pick your preferred service date.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug,
          areaName,
          preferredDate,
          preferredTimeSlot,
          customerName: customerName.trim(),
          customerMobile: cleanMobile,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking request.');
      }

      const selectedService = SERVICES.find((s) => s.slug === serviceSlug);

      setSuccessModalData({
        bookingNumber: data.bookingNumber || `COOLO-${new Date().getFullYear()}-000001`,
        serviceName: selectedService ? selectedService.name : 'AC Service',
        area: areaName,
        date: preferredDate,
        time: preferredTimeSlot,
        customerName: customerName.trim(),
      });

      // Clear form inputs
      setCustomerName('');
      setCustomerMobile('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/90 relative overflow-hidden">
        {/* Decorative cooling accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Fast 2-Hour Arrival Slot</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quick Service Booking
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Book now in 30 seconds. No payment required until diagnosis is completed.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Service & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="service-select"
                className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-sky-600" />
                <span>Select Service</span>
              </label>
              <select
                id="service-select"
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              >
                {SERVICES.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} (from ₹{s.startingPrice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="area-select"
                className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>City</span>
              </label>
              <select
                id="area-select"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              >
                {SERVICE_CITIES.map((city) => (
                  <option key={city.id} value={city.areaName}>
                    {city.areaName} ({city.state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="date-input"
                className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Preferred Date</span>
              </label>
              <input
                id="date-input"
                type="date"
                min={today}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="slot-select"
                className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Preferred Slot</span>
              </label>
              <select
                id="slot-select"
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="name-input"
                className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Your Name</span>
              </label>
              <input
                id="name-input"
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="mobile-input"
                className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-sky-600" />
                <span>Mobile Number</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  +91
                </span>
                <input
                  id="mobile-input"
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  className="w-full h-11 pl-12 pr-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Confirm Service Booking
            </Button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              🔒 Instant confirmation • Pay after service diagnosis • Digital bill provided
            </p>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <BookingSuccessModal
        isOpen={!!successModalData}
        onClose={() => setSuccessModalData(null)}
        bookingData={successModalData}
      />
    </>
  );
};
