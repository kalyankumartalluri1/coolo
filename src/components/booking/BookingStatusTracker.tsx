'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Truck,
  Wrench,
  Award,
  Phone,
  MessageCircle,
  Star,
  Send,
  ImagePlus,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { BookingStatus } from '@/lib/types/database.types';
import { BRAND } from '@/lib/constants/brand';
import { Badge } from '@/components/ui/Badge';

interface TrackingData {
  id: string;
  booking_number: string;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time_slot: string;
  ac_type: string;
  customer_name: string;
  customer_mobile: string;
  address_snapshot: {
    area?: string;
    city?: string;
    state?: string;
    serviceSlug?: string;
  };
  technician?: {
    name: string;
    rating: number;
    phone: string;
  };
  created_at: string;
}

interface BookingStatusTrackerProps {
  booking: TrackingData;
}

export const BookingStatusTracker: React.FC<BookingStatusTrackerProps> = ({ booking }) => {
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewPhotoUrls, setReviewPhotoUrls] = useState<string[]>(['', '', '']);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (reviewRating < 1) {
      setReviewError('Please select a star rating before submitting.');
      return;
    }
    setReviewError(null);
    setReviewSubmitting(true);
    try {
      const photoUrls = reviewPhotoUrls.filter((u) => u.trim().length > 0);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
          photo_urls: photoUrls.length > 0 ? photoUrls : null,
          customerName: booking.customer_name,
          customerMobile: booking.customer_mobile,
          serviceSlug: booking.address_snapshot?.serviceSlug,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setReviewError(json.error || 'Something went wrong. Please try again.');
      } else {
        setReviewSubmitted(true);
      }
    } catch {
      setReviewError('Network error. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const lifecycleSteps: { key: BookingStatus; label: string; icon: React.ElementType; desc: string }[] = [
    {
      key: 'REQUESTED',
      label: 'Requested',
      icon: Clock,
      desc: 'Booking received in system. Service coordinator reviewing slot.',
    },
    {
      key: 'CONFIRMED',
      label: 'Confirmed',
      icon: CheckCircle2,
      desc: 'Arrival slot confirmed. Preparing certified technician dispatch.',
    },
    {
      key: 'ASSIGNED',
      label: 'Technician Assigned',
      icon: UserCheck,
      desc: 'A verified cooling technician is assigned with diagnostic checklist.',
    },
    {
      key: 'TECHNICIAN_ON_THE_WAY',
      label: 'On The Way',
      icon: Truck,
      desc: 'Technician is en route to your Bangalore location.',
    },
    {
      key: 'IN_PROGRESS',
      label: 'Service In Progress',
      icon: Wrench,
      desc: 'Unit diagnosis and servicing is currently underway.',
    },
    {
      key: 'COMPLETED',
      label: 'Service Completed',
      icon: Award,
      desc: 'Cooling verified, digital warranty issued, job complete.',
    },
  ];

  // Helper to determine status progress index
  const getStatusIndex = (currentStatus: BookingStatus) => {
    switch (currentStatus) {
      case 'REQUESTED':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'ASSIGNED':
        return 2;
      case 'TECHNICIAN_ON_THE_WAY':
        return 3;
      case 'IN_PROGRESS':
        return 4;
      case 'WAITING_FOR_APPROVAL':
        return 4;
      case 'COMPLETED':
        return 5;
      case 'CANCELLED':
      case 'NO_SHOW':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(booking.status);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Booking Reference
          </span>
          <h2 className="text-2xl font-black font-mono text-sky-600 tracking-tight mt-0.5">
            {booking.booking_number}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              booking.status === 'COMPLETED'
                ? 'emerald'
                : booking.status === 'CANCELLED'
                ? 'rose'
                : 'sky'
            }
            size="md"
          >
            ● Status: {booking.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {lifecycleSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-500/20'
                    : isCompleted
                    ? 'border-slate-200 bg-emerald-50/40 text-slate-800'
                    : 'border-slate-100 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isCurrent
                        ? 'bg-sky-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 mb-1">
                  {step.label}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled Date:</span>
            <span className="font-semibold text-slate-900">{booking.scheduled_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Time Window:</span>
            <span className="font-semibold text-slate-900">{booking.scheduled_time_slot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AC Specification:</span>
            <span className="font-semibold text-slate-900">{booking.ac_type} AC</span>
          </div>
        </div>

        <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
          <div className="flex justify-between">
            <span className="text-slate-500">Service Location:</span>
            <span className="font-semibold text-slate-900">
              {booking.address_snapshot.area || 'Bangalore'}, Karnataka
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Contact:</span>
            <span className="font-semibold text-slate-900">+91 {booking.customer_mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Technician:</span>
            <span className="font-semibold text-slate-900">
              {booking.technician ? booking.technician.name : 'Dispatch in progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Support & Quick Contact actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 gap-4">
        <span>Need to reschedule or update instructions?</span>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href={`tel:${BRAND.contact.phone}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            <span>Call Coordinator</span>
          </a>
          <a
            href={`https://wa.me/${BRAND.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(
              `Hi Coolo, inquiry regarding my booking ${booking.booking_number}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Post-Completion Review Form */}
      {booking.status === 'COMPLETED' && (
        <div className="pt-6 border-t border-slate-100">
          {reviewSubmitted ? (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Thank you for your review!</h4>
                <p className="text-xs text-emerald-800/80 mt-1">
                  Your feedback helps us improve and helps other Bangalore customers book with confidence. Your review has been submitted and will appear on our service pages shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-sky-50/60 border border-amber-200/60 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">How was your service experience?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Share your feedback and help other Bangalore customers make the right choice.
                  </p>
                </div>
              </div>

              {/* Star selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Your Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (reviewHoverRating || reviewRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            active
                              ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  {reviewRating > 0 && (
                    <span className="ml-2 text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      {reviewRating === 1 && 'Poor'}
                      {reviewRating === 2 && 'Fair'}
                      {reviewRating === 3 && 'Good'}
                      {reviewRating === 4 && 'Great'}
                      {reviewRating === 5 && 'Excellent!'}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment textarea */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Your Comments (optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Tell us how it went — what did we do well, and how can we improve for your next service?"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none placeholder:text-slate-400"
                  maxLength={2000}
                />
                <div className="text-[10px] text-slate-400 mt-1 text-right">
                  {reviewComment.length}/2000
                </div>
              </div>

              {/* Photo URL placeholders */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2 flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Attach Service Photos (optional — paste image URLs)
                </label>
                <div className="space-y-2">
                  {reviewPhotoUrls.map((url, idx) => (
                    <input
                      key={idx}
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const next = [...reviewPhotoUrls];
                        next[idx] = e.target.value;
                        setReviewPhotoUrls(next);
                      }}
                      placeholder={`Photo ${idx + 1} — e.g. https://photos.example.com/img${idx + 1}.jpg`}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 placeholder:text-slate-400"
                    />
                  ))}
                </div>
              </div>

              {/* Error message */}
              {reviewError && (
                <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Submit button */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-slate-500">
                  Reviews are moderated and published typically within 24 hours.
                </span>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  {reviewSubmitting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
