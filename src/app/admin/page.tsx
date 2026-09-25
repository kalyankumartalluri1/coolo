'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Wrench,
  LogOut,
  Wind,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookingStatus } from '@/lib/types/database.types';
import { DEFAULT_SITE_CONFIG, type SiteConfig } from '@/lib/config/site-config';

interface BookingRow {
  id: string;
  booking_number: string;
  status: BookingStatus;
  customer_name: string;
  customer_mobile: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  address_snapshot: { area?: string; city?: string };
  ac_type: string;
  created_at: string;
  assignedTechnicianId?: string | null;
}

interface TechnicianOption {
  id: string;
  name: string;
  employeeCode: string;
  rating: number;
  skills: string[];
}

const MOCK_TECHNICIANS: TechnicianOption[] = [
  {
    id: 'tech-uuid-001',
    name: 'Ramesh Kumar',
    employeeCode: 'COOLO-T001',
    rating: 4.8,
    skills: ['Split AC', 'Window AC', 'Cassette'],
  },
  {
    id: 'tech-uuid-002',
    name: 'Suresh Patel',
    employeeCode: 'COOLO-T002',
    rating: 4.9,
    skills: ['Gas Charging', 'Installation', 'Split AC'],
  },
  {
    id: 'tech-uuid-003',
    name: 'Arjun Reddy',
    employeeCode: 'COOLO-T003',
    rating: 4.7,
    skills: ['Ducted', 'Cassette', 'Commercial HVAC'],
  },
  {
    id: 'tech-uuid-004',
    name: 'Vikram Singh',
    employeeCode: 'COOLO-T004',
    rating: 4.6,
    skills: ['Deep Cleaning', 'AMC', 'Repair'],
  },
  {
    id: 'tech-uuid-005',
    name: 'Karthik Gowda',
    employeeCode: 'COOLO-T005',
    rating: 4.9,
    skills: ['Uninstallation', 'Installation', 'Gas Charging'],
  },
];

const STATUS_COLORS: Record<string, 'sky' | 'teal' | 'amber' | 'emerald' | 'rose' | 'slate'> = {
  REQUESTED: 'amber',
  CONFIRMED: 'sky',
  ASSIGNED: 'teal',
  TECHNICIAN_ON_THE_WAY: 'teal',
  IN_PROGRESS: 'sky',
  WAITING_FOR_APPROVAL: 'amber',
  COMPLETED: 'emerald',
  CANCELLED: 'rose',
  NO_SHOW: 'slate',
};

const NEXT_STATUS: Record<string, BookingStatus | null> = {
  REQUESTED: 'CONFIRMED',
  CONFIRMED: 'ASSIGNED',
  ASSIGNED: 'TECHNICIAN_ON_THE_WAY',
  TECHNICIAN_ON_THE_WAY: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  WAITING_FOR_APPROVAL: 'COMPLETED',
  COMPLETED: null,
  CANCELLED: null,
  NO_SHOW: null,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'settings'>('dashboard');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [settings, setSettings] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [configMessage, setConfigMessage] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== 'ALL'
        ? `/api/admin/bookings?status=${statusFilter}`
        : '/api/admin/bookings';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setBookings(data.bookings || []);
    } catch (e) {
      console.error('Failed to fetch bookings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.success && data.config) {
        setSettings(data.config);
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') queueMicrotask(fetchBookings);
    if (activeTab === 'settings') queueMicrotask(fetchSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter]);

  const handleStatusAdvance = async (bookingId: string, nextStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
        );
      }
    } catch (e) {
      console.error('Status update failed', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignTechnician = async (bookingId: string, technicianId: string) => {
    if (!technicianId) return;
    setAssigningId(bookingId);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, assignTechnicianId: technicianId }),
      });
      const data = await res.json();
      if (data.success) {
        setAssignments((prev) => ({ ...prev, [bookingId]: technicianId }));
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, assignedTechnicianId: technicianId, status: 'ASSIGNED' as BookingStatus }
              : b
          )
        );
      }
    } catch (e) {
      console.error('Technician assignment failed', e);
    } finally {
      setAssigningId(null);
    }
  };

  const handleSaveSettings = async () => {
    setSavingConfig(true);
    setConfigMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }
      setSettings(data.config);
      setConfigMessage('Settings saved successfully.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to save settings.';
      setConfigMessage(message);
    } finally {
      setSavingConfig(false);
    }
  };

  const addCity = () => {
    const newCity = {
      id: `city-${Date.now()}`,
      areaName: 'New City',
      pincode: '000000',
      city: 'New City',
      state: 'India',
      isActive: true,
    };
    setSettings((prev) => ({ ...prev, cities: [...prev.cities, newCity] }));
  };

  const updateCity = (index: number, field: keyof typeof settings.cities[number], value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      cities: prev.cities.map((city, cityIndex) =>
        cityIndex === index ? { ...city, [field]: value } : city
      ),
    }));
  };

  const removeCity = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      cities: prev.cities.filter((_, cityIndex) => cityIndex !== index),
    }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  // KPI stats derived from bookings
  const stats = {
    total: bookings.length,
    requested: bookings.filter((b) => b.status === 'REQUESTED').length,
    inProgress: bookings.filter((b) =>
      ['CONFIRMED', 'ASSIGNED', 'TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS'].includes(b.status)
    ).length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
  };

  const STATUSES = ['ALL', 'REQUESTED', 'CONFIRMED', 'ASSIGNED', 'TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col hidden lg:flex">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center">
              <Wind className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight">COOLO</span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { key: 'bookings', label: 'Booking Manager', icon: CalendarCheck },
            { key: 'settings', label: 'Configuration', icon: UserPlus },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as 'dashboard' | 'bookings' | 'settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/technician"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span>Technician View</span>
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Customer View</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {activeTab === 'dashboard'
                ? 'Operations Dashboard'
                : activeTab === 'settings'
                  ? 'Platform Configuration'
                  : 'Booking Manager'}
            </h1>
            <p className="text-xs text-slate-500">Coolo Admin — Multi-city operations</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'bookings' && (
              <button
                type="button"
                onClick={fetchBookings}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center">
              AD
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings', value: stats.total, icon: CalendarCheck, color: 'text-sky-600', bg: 'bg-sky-50' },
                  { label: 'Awaiting Confirmation', value: stats.requested, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Active Jobs', value: stats.inProgress, icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
                  { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="p-5">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                    </Card>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setActiveTab('bookings')}
                    >
                      Manage All Bookings
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { setActiveTab('bookings'); setStatusFilter('REQUESTED'); }}
                    >
                      View Pending Requests ({stats.requested})
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-600" />
                    Platform Status
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Booking API', status: 'Operational' },
                      { label: 'Supabase DB', status: 'Mock Mode' },
                      { label: 'SMS Notifications', status: 'Configured' },
                      { label: 'WhatsApp Dispatch', status: 'Active' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-semibold text-emerald-600">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Business Settings</h3>
                    <p className="text-xs text-slate-500 mt-1">Configure contact details and cities served by the platform.</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleSaveSettings} isLoading={savingConfig}>
                    Save Settings
                  </Button>
                </div>

                {configMessage && (
                  <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
                    {configMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      value={settings.contact.phone}
                      onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Display</label>
                    <input
                      value={settings.contact.phoneDisplay}
                      onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, phoneDisplay: e.target.value } }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      value={settings.contact.whatsapp}
                      onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, whatsapp: e.target.value } }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
                    <input
                      value={settings.contact.supportEmail}
                      onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, supportEmail: e.target.value } }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Service Address</label>
                    <input
                      value={settings.contact.address}
                      onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Working Hours</label>
                    <input
                      value={settings.contact.workingHours}
                      onChange={(e) => setSettings((prev) => ({ ...prev, contact: { ...prev.contact, workingHours: e.target.value } }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Cities Served</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage city coverage for the booking flow and public site.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addCity}>Add City</Button>
                </div>

                <div className="space-y-4">
                  {settings.cities.map((city, index) => (
                    <div key={city.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">City Name</label>
                          <input
                            value={city.areaName}
                            onChange={(e) => updateCity(index, 'areaName', e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">State</label>
                          <input
                            value={city.state}
                            onChange={(e) => updateCity(index, 'state', e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">PIN</label>
                          <input
                            value={city.pincode}
                            onChange={(e) => updateCity(index, 'pincode', e.target.value)}
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm"
                          />
                        </div>
                        <div className="flex items-end justify-end gap-2">
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={city.isActive}
                              onChange={(e) => updateCity(index, 'isActive', e.target.checked)}
                            />
                            Active
                          </label>
                          <button
                            type="button"
                            onClick={() => removeCity(index)}
                            className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2 pb-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      statusFilter === s
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-sm text-slate-500">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <Card className="p-12 text-center">
                  <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No bookings found for this filter.</p>
                  <p className="text-xs text-slate-400 mt-1">Bookings submitted via the website will appear here.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => {
                    const next = NEXT_STATUS[booking.status];
                    const isUpdating = updatingId === booking.id;
                    const isAssigning = assigningId === booking.id;
                    const assignedTechId = assignments[booking.id] || booking.assignedTechnicianId;
                    const assignedTech = assignedTechId
                      ? MOCK_TECHNICIANS.find((t) => t.id === assignedTechId)
                      : null;
                    const canAssign =
                      booking.status !== 'COMPLETED' &&
                      booking.status !== 'CANCELLED' &&
                      booking.status !== 'NO_SHOW';
                    return (
                      <Card key={booking.id} className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-sky-600 text-sm">
                                {booking.booking_number}
                              </span>
                              <Badge variant={STATUS_COLORS[booking.status] || 'slate'} size="sm">
                                {booking.status.replace(/_/g, ' ')}
                              </Badge>
                              {assignedTech && (
                                <Badge variant="teal" size="sm">
                                  ✦ Assigned: {assignedTech.name}
                                </Badge>
                              )}
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">{booking.customer_name}</p>
                            <p className="text-xs text-slate-500">
                              {booking.customer_mobile} • {booking.ac_type} AC • {booking.address_snapshot?.area}, Bangalore
                            </p>
                            <p className="text-xs text-slate-400">
                              {booking.scheduled_date} · {booking.scheduled_time_slot}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0 w-full sm:w-auto">
                            {canAssign && (
                              <div className="w-full sm:w-60 lg:w-60">
                                <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                  <UserPlus className="w-3 h-3" />
                                  Assign Technician
                                </label>
                                <select
                                  value={assignedTechId || ''}
                                  onChange={(e) => handleAssignTechnician(booking.id, e.target.value)}
                                  disabled={isAssigning}
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none disabled:opacity-60"
                                >
                                  <option value="">-- Select technician --</option>
                                  {MOCK_TECHNICIANS.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.name} · ⭐ {t.rating}
                                    </option>
                                  ))}
                                </select>
                                {assignedTech && (
                                  <p className="mt-1 text-[10px] text-slate-500">
                                    {assignedTech.employeeCode} · {assignedTech.skills.slice(0, 2).join(', ')}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 justify-end">
                              {next && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  isLoading={isUpdating}
                                  onClick={() => handleStatusAdvance(booking.id, next)}
                                  className="text-xs"
                                >
                                  → {next.replace(/_/g, ' ')}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                href={`/track?id=${booking.booking_number}`}
                                className="text-xs"
                              >
                                Track
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
