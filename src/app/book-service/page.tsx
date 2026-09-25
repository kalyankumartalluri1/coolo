'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { SERVICES } from '@/lib/constants/services';
import { ACTIVE_SERVICE_AREAS, DEFAULT_SERVICE_AREA, TIME_SLOTS, AC_TYPES, AC_BRANDS } from '@/lib/constants/areas';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get('service') || 'ac-service';
  const initialArea = searchParams.get('area') || DEFAULT_SERVICE_AREA;

  const today = new Date().toISOString().split('T')[0];

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [selectedService, setSelectedService] = useState(initialService);
  const [acType, setAcType] = useState<'Split' | 'Window' | 'Cassette' | 'Ducted' | 'Other'>('Split');
  const [acBrand, setAcBrand] = useState('Daikin');
  const [acAge, setAcAge] = useState('1-3 years');
  const [problemDescription, setProblemDescription] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [pincode, setPincode] = useState('560038');
  const [landmark, setLandmark] = useState('');

  const [preferredDate, setPreferredDate] = useState(today);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(TIME_SLOTS[0]);

  // Confirmation state
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  const activeServiceObj = SERVICES.find((s) => s.slug === selectedService) || SERVICES[0];

  // Validation per step
  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!selectedService) {
        setErrorMessage('Please choose a service.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!customerName.trim() || customerName.trim().length < 2) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      const cleanMobile = customerMobile.replace(/[\s-]/g, '');
      const mobileRegex = /^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$/;
      if (!mobileRegex.test(cleanMobile)) {
        setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
        return;
      }
      if (!addressLine1.trim() || addressLine1.trim().length < 5) {
        setErrorMessage('Please enter your house/flat number and street address.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!preferredDate) {
        setErrorMessage('Please select a service date.');
        return;
      }
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceSlug: selectedService,
          areaName: selectedArea,
          preferredDate,
          preferredTimeSlot,
          customerName: customerName.trim(),
          customerMobile: customerMobile.replace(/[\s-]/g, ''),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setConfirmedBookingId(data.bookingNumber || `COOLO-${new Date().getFullYear()}-000001`);
      setCurrentStep(6);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    'Service',
    'AC Details',
    'Address',
    'Schedule',
    'Review',
    'Confirmed',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
          Transparent Cooling Booking
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
          Schedule Your AC Service Visit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Zero upfront advance • Pay after service • Certified local technicians
        </p>
      </div>

      {/* Stepper progress indicator */}
      {currentStep < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            {stepLabels.slice(0, 5).map((label, index) => {
              const stepNumber = index + 1;
              const isCompleted = currentStep > stepNumber;
              const isCurrent = currentStep === stepNumber;

              return (
                <div key={label} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-sm'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-sky-600' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Step Content */}
      <Card className="p-6 sm:p-8 border-slate-200/90 shadow-md">
        {/* STEP 1: Select Service */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Step 1: Choose Your Service
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select the air and cooling solution required for your unit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {SERVICES.map((service) => {
                const isSelected = selectedService === service.slug;
                return (
                  <div
                    key={service.slug}
                    onClick={() => setSelectedService(service.slug)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {service.name}
                      </span>
                      <span className="text-xs font-semibold text-sky-700">
                        From ₹{service.startingPrice}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {service.shortDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Enter AC Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Step 2: Tell Us About Your AC
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Helps our technician carry the right diagnostic tools and spare components.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  AC Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {AC_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAcType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        acType === type
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Brand
                  </label>
                  <select
                    value={acBrand}
                    onChange={(e) => setAcBrand(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                  >
                    {AC_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approximate Age of AC
                  </label>
                  <select
                    value={acAge}
                    onChange={(e) => setAcAge(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                  >
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-3 years">1 – 3 years</option>
                    <option value="3-5 years">3 – 5 years</option>
                    <option value="More than 5 years">More than 5 years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe Problem / Service Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="e.g. Not cooling properly, ice on outdoor pipes, water dripping inside, loud noise..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Customer Details & Address */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Step 3: Service Location & Contact
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your service address and phone number for dispatch verification.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Anand Sharma"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full h-11 pl-12 pr-3.5 rounded-xl border border-slate-200 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (Optional for digital invoice copy)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="anand@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line 1 (Flat, House No, Building Name) *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Flat 302, Palm Heights, 12th Main"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line 2 (Street, Block, Wing - Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. 4th Cross, B-Wing"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service City *
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      const matched = ACTIVE_SERVICE_AREAS.find((a) => a.areaName === e.target.value);
                      if (matched && matched.pincode) setPincode(matched.pincode);
                    }}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  >
                    {ACTIVE_SERVICE_AREAS.map((a) => (
                      <option key={a.id} value={a.areaName}>
                        {a.areaName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Metro Station"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Schedule */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Step 4: Pick Arrival Slot
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Technician will arrive within the chosen 2-hour window.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select 2-Hour Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = preferredTimeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPreferredTimeSlot(slot)}
                        className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-600" />
                          <span>{slot}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Confirm */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Step 5: Review Booking Details
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please verify your service information before confirming.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Service</span>
                <span className="font-bold text-sm text-slate-900">
                  {activeServiceObj.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Indicative Charge</span>
                <span className="font-bold text-sm text-sky-600">
                  Starting from ₹{activeServiceObj.startingPrice}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-500">AC Specification</span>
                <span className="text-slate-800">
                  {acType} AC • {acBrand} • {acAge}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Customer</span>
                <span className="text-slate-800">
                  {customerName} (+91 {customerMobile})
                </span>
              </div>
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Address</span>
                <span className="text-slate-800 text-right max-w-xs">
                  {addressLine1}, {selectedArea} - {pincode || 'PIN not provided'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Scheduled Slot</span>
                <span className="font-semibold text-slate-900">
                  {preferredDate} ({preferredTimeSlot})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-2.5 text-xs text-sky-800">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
              <span>
                Zero advance payment. You pay only after service inspection and testing.
              </span>
            </div>
          </div>
        )}

        {/* STEP 6: Confirmation State */}
        {currentStep === 6 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
              Status: REQUESTED
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Your service request has been received.
            </h2>

            <p className="text-sm text-slate-600 max-w-md mx-auto">
              A Coolo coordinator is assigning your technician for the selected slot. You will receive a call or SMS before arrival.
            </p>

            <div className="bg-slate-50 max-w-md mx-auto rounded-2xl p-5 border border-slate-200/90 text-left space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-semibold">Booking ID</span>
                <span className="font-mono font-bold text-sky-600 text-sm">
                  {confirmedBookingId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-800">{activeServiceObj.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date</span>
                <span className="font-semibold text-slate-800">{preferredDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Slot</span>
                <span className="font-semibold text-slate-800">{preferredTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-800">{selectedArea}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button href="/" variant="primary">
                Return to Home
              </Button>
              <Button href="/services" variant="outline">
                Browse Services
              </Button>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        {currentStep < 6 && (
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="md"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
                rightIcon={<CheckCircle2 className="w-4 h-4 ml-1" />}
              >
                Confirm Booking
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading booking wizard...</div>}>
      <BookingFlowContent />
    </Suspense>
  );
}
