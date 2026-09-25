'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AccountPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'addresses'>('bookings');

  // Customer sample bookings state
  const bookings = [
    {
      id: 'COOLO-2026-881204',
      service: 'AC Regular Service',
      acType: 'Split (1.5 Ton)',
      scheduledDate: '2026-09-27',
      slot: '10:00 AM – 12:00 PM',
      status: 'CONFIRMED' as const,
      area: 'Indiranagar',
      amount: 399,
    },
    {
      id: 'COOLO-2026-773190',
      service: 'AC Deep Cleaning',
      acType: 'Split (2 Ton)',
      scheduledDate: '2026-08-14',
      slot: '02:00 PM – 04:00 PM',
      status: 'COMPLETED' as const,
      area: 'Indiranagar',
      amount: 699,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <div className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-slate-200/90 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Anand Sharma
              </h1>
              <Badge variant="sky" size="sm">
                Customer
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              +91 98765 43210 • anand.sharma@example.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/book-service" size="sm" variant="primary">
            New AC Booking
          </Button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pt-6 border-b border-slate-200/80 mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Service Bookings ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'addresses'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved Addresses (1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Account Profile
        </button>
      </div>

      {/* Tab: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold text-slate-900">
              Active & Past Service Requests
            </h2>
            <Link
              href="/track"
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Lookup any Booking ID →
            </Link>
          </div>

          {bookings.map((b) => (
            <Card key={b.id} className="p-5 border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-sky-600">
                    {b.id}
                  </span>
                  <Badge
                    variant={b.status === 'COMPLETED' ? 'emerald' : 'sky'}
                    size="sm"
                  >
                    {b.status}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {b.service}
                </h3>
                <p className="text-xs text-slate-500">
                  {b.acType} • {b.area}, Bangalore • {b.scheduledDate} ({b.slot})
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right sm:pr-4 sm:border-r border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Amount
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{b.amount}
                  </span>
                </div>

                <Button
                  href={`/track?id=${b.id}`}
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
                >
                  Live Status
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold text-slate-900">
              Saved Bangalore Addresses
            </h2>
            <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add New Address
            </Button>
          </div>

          <Card className="p-5 border-slate-200 max-w-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-sm text-slate-900">Home (Default)</span>
              </div>
              <Badge variant="emerald" size="sm">Primary</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Flat 302, Palm Heights, 12th Main Road, Indiranagar, Bangalore, Karnataka - 560038
            </p>
          </Card>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-xl">
          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Profile Settings
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800">
                <User className="w-4 h-4 text-slate-400" />
                <span>Anand Sharma</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 98765 43210</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>anand.sharma@example.com</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Customer profile backed by Supabase Row Level Security</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
