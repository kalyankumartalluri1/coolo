'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/[\s-]/g, '');
    const mobileRegex = /^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('Please enter a brief message describing your request.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobile,
          email: email.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setIsSuccess(true);
      setName('');
      setMobile('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to send message. Please call our team directly.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Contact Coolo Support
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Have questions regarding residential AC service, corporate quotes, AMC packages, or technician arrival? Our Bangalore team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Business details */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Operational Office
              </h2>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {BRAND.name} ({BRAND.tagline})
                    </span>
                    <span>Bangalore, Karnataka, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Phone Call Support
                    </span>
                    <a
                      href={`tel:${BRAND.contact.phone}`}
                      className="text-sky-600 hover:underline"
                    >
                      {BRAND.contact.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Email Inquiries
                    </span>
                    <a
                      href={`mailto:${BRAND.contact.email}`}
                      className="text-sky-600 hover:underline"
                    >
                      {BRAND.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Working Hours
                    </span>
                    <span>{BRAND.contact.workingHours}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <a
                  href={`https://wa.me/${BRAND.contact.whatsapp.replace('+', '')}?text=${encodeURIComponent(
                    BRAND.whatsappBookingMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill out the form below and our coordinator will respond within 30 minutes during operating hours.
              </p>

              {isSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Thank you for contacting Coolo. We will be in touch shortly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSuccess(false)}
                    className="mt-2"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message / Requirement *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please tell us about your AC requirement, unit count, or issue..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-sm"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Submit Request
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
