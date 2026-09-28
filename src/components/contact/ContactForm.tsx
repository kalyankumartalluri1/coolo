'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContactFormProps {
  initialName?: string;
  initialEmail?: string;
  initialMobile?: string;
}

export function ContactForm({
  initialName = '',
  initialEmail = '',
  initialMobile = '',
}: ContactFormProps) {
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState(initialMobile);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanMobile = mobile.replace(/[\s-]/g, '');
    if (!/^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (message.trim().length < 5) {
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
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to submit inquiry.');

      setIsSuccess(true);
      setMessage('');
      // Keep name/email pre-filled for convenience if they want to send another
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send message. Please call our team directly.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-2 text-xl font-bold text-slate-900">Send Us a Message</h2>
      <p className="mb-6 text-xs text-slate-500">
        Fill out the form below and our coordinator will respond during operating hours.
      </p>

      {isSuccess ? (
        <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h3 className="text-base font-bold text-emerald-900">Message Sent Successfully!</h3>
          <p className="text-xs text-emerald-700">Thank you for contacting Coolo. We will be in touch shortly.</p>
          <Button variant="outline" size="sm" onClick={() => setIsSuccess(false)} className="mt-2">
            Send Another Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-xs font-semibold text-slate-700">
                Your Name *
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh"
                autoComplete="name"
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm"
                required
                minLength={2}
                maxLength={150}
              />
            </div>
            <div>
              <label htmlFor="contact-mobile" className="mb-1 block text-xs font-semibold text-slate-700">
                Mobile Number *
              </label>
              <input
                id="contact-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98765 43210"
                autoComplete="tel"
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm"
                required
                maxLength={15}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-1 block text-xs font-semibold text-slate-700">
              Email Address (Optional)
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@example.com"
              autoComplete="email"
              className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm"
              maxLength={150}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-1 block text-xs font-semibold text-slate-700">
              Message / Requirement *
            </label>
            <textarea
              id="contact-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your AC requirement, unit count, or issue..."
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm"
              required
              minLength={5}
              maxLength={2000}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Submit Request
          </Button>
        </form>
      )}
    </div>
  );
}
