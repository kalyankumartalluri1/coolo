'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Wind,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  RefreshCw,
  Star,
  Truck,
  ClipboardList,
  Plus,
  Trash2,
  Receipt,
  FileCheck2,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookingStatus, PaymentMethod } from '@/lib/types/database.types';

interface TechJob {
  id: string;
  booking_number: string;
  status: BookingStatus;
  customer_name: string;
  customer_mobile: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  address_snapshot: { area?: string; city?: string; line1?: string };
  ac_type: string;
  ac_brand?: string;
  problem_description?: string;
}

type EstimateItemType = 'PART' | 'LABOUR' | 'GAS' | 'OTHER';

interface EstimateItemDraft {
  id: string;
  item_type: EstimateItemType;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const STATUS_COLORS: Record<string, 'sky' | 'teal' | 'amber' | 'emerald' | 'rose' | 'slate'> = {
  ASSIGNED: 'sky',
  TECHNICIAN_ON_THE_WAY: 'teal',
  IN_PROGRESS: 'amber',
  WAITING_FOR_APPROVAL: 'amber',
  COMPLETED: 'emerald',
};

const TECH_NEXT_STATUS: Record<string, { label: string; status: BookingStatus } | null> = {
  ASSIGNED: { label: 'Start Journey', status: 'TECHNICIAN_ON_THE_WAY' },
  TECHNICIAN_ON_THE_WAY: { label: 'Begin Service', status: 'IN_PROGRESS' },
  IN_PROGRESS: null,
  WAITING_FOR_APPROVAL: null,
  COMPLETED: null,
};

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const TAX_RATE = 0.18;

export default function TechnicianPortal() {
  const router = useRouter();
  const [jobs, setJobs] = useState<TechJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [submittingEstimateId, setSubmittingEstimateId] = useState<string | null>(null);
  const [submittingRecordId, setSubmittingRecordId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [estimateItems, setEstimateItems] = useState<Record<string, EstimateItemDraft[]>>({});
  const [estimateNotes, setEstimateNotes] = useState<Record<string, string>>({});
  const [recordNotes, setRecordNotes] = useState<Record<string, { diagnosis: string; work: string; amount: number; paymentMethod: PaymentMethod }>>({});

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/technician/jobs');
      const data = await res.json();
      if (data.success) setJobs(data.jobs || []);
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(fetchJobs);
  }, []);

  const handleStatusUpdate = async (jobId: string, status: BookingStatus) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch('/api/technician/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status } : j))
        );
      }
    } catch (e) {
      console.error('Job update failed', e);
    } finally {
      setUpdatingId(null);
    }
  };

  function estimateTotals(jobId: string) {
    const items = estimateItems[jobId] || [];
    const subtotal = items.reduce((s, i) => s + (i.total_price || 0), 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, discount: 0, total };
  }

  function addEstimateItem(jobId: string) {
    setEstimateItems((prev) => ({
      ...prev,
      [jobId]: [
        ...(prev[jobId] || []),
        {
          id: makeId(),
          item_type: 'PART',
          description: '',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    }));
  }

  function removeEstimateItem(jobId: string, itemId: string) {
    setEstimateItems((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] || []).filter((i) => i.id !== itemId),
    }));
  }

  function updateEstimateItem(
    jobId: string,
    itemId: string,
    patch: Partial<EstimateItemDraft>
  ) {
    setEstimateItems((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] || []).map((i) => {
        if (i.id !== itemId) return i;
        const merged = { ...i, ...patch };
        const qty = Number(merged.quantity) || 0;
        const price = Number(merged.unit_price) || 0;
        merged.total_price = Math.round(qty * price * 100) / 100;
        return merged;
      }),
    }));
  }

  async function handleSubmitEstimate(jobId: string) {
    const items = estimateItems[jobId] || [];
    if (!items.length) return;
    const { subtotal, tax, discount, total } = estimateTotals(jobId);
    setSubmittingEstimateId(jobId);
    try {
      const res = await fetch('/api/technician/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          items,
          subtotal,
          taxAmount: tax,
          discountAmount: discount,
          totalAmount: total,
          notes: estimateNotes[jobId] || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'WAITING_FOR_APPROVAL' as BookingStatus } : j))
        );
        setEstimateItems((prev) => ({ ...prev, [jobId]: [] }));
        setEstimateNotes((prev) => ({ ...prev, [jobId]: '' }));
      }
    } catch (e) {
      console.error('Estimate submit failed', e);
    } finally {
      setSubmittingEstimateId(null);
    }
  }

  function updateRecordForm(
    jobId: string,
    patch: Partial<{ diagnosis: string; work: string; amount: number; paymentMethod: PaymentMethod }>
  ) {
    setRecordNotes((prev) => ({
      ...prev,
      [jobId]: {
        diagnosis: prev[jobId]?.diagnosis || '',
        work: prev[jobId]?.work || '',
        amount: prev[jobId]?.amount || 0,
        paymentMethod: (prev[jobId]?.paymentMethod || 'CASH') as PaymentMethod,
        ...patch,
      },
    }));
  }

  async function handleSubmitRecord(jobId: string) {
    const form = recordNotes[jobId];
    if (!form || !form.work.trim() || !form.amount) return;
    setSubmittingRecordId(jobId);
    try {
      const res = await fetch('/api/technician/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          action: 'submitRecord',
          diagnosisNotes: form.diagnosis || undefined,
          workPerformed: form.work,
          finalAmount: Number(form.amount),
          paymentMethod: form.paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'COMPLETED' as BookingStatus } : j))
        );
        setRecordNotes((prev) => {
          const copy = { ...prev };
          delete copy[jobId];
          return copy;
        });
      }
    } catch (e) {
      console.error('Record submit failed', e);
    } finally {
      setSubmittingRecordId(null);
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const activeJobs = jobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const displayJobs = activeTab === 'active' ? activeJobs : completedJobs;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center">
            <Wind className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight">COOLO</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Technician Portal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-900/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Technician Profile Strip */}
        <Card className="p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
              SG
            </div>
            <div>
              <p className="font-bold text-slate-900">Suresh Gowda</p>
              <p className="text-xs text-slate-500">Lead AC Technician · EMP-001</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold text-slate-700">4.9</span>
                <span className="text-xs text-slate-400">· {completedJobs.length} jobs done</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active Jobs ({activeJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed ({completedJobs.length})
          </button>
          <div className="ml-auto pb-3">
            <button
              type="button"
              onClick={fetchJobs}
              aria-label="Refresh jobs"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Jobs list */}
        {isLoading ? (
          <div className="text-center py-16 text-sm text-slate-500">Loading assigned jobs...</div>
        ) : displayJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {activeTab === 'active' ? 'No active jobs assigned.' : 'No completed jobs yet.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayJobs.map((job) => {
              const nextAction = TECH_NEXT_STATUS[job.status];
              const isUpdating = updatingId === job.id;
              const isExpanded = expandedId === job.id;

              return (
                <Card key={job.id} className="overflow-hidden">
                  <div className="p-5">
                    {/* Job header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sky-600 text-sm">
                            {job.booking_number}
                          </span>
                          <Badge variant={STATUS_COLORS[job.status] || 'slate'} size="sm">
                            {job.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="font-bold text-slate-900">{job.customer_name}</p>
                      </div>
                      {job.status === 'TECHNICIAN_ON_THE_WAY' && (
                        <div className="shrink-0 w-9 h-9 rounded-full bg-teal-50 border-2 border-teal-400 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-teal-600" />
                        </div>
                      )}
                      {job.status === 'IN_PROGRESS' && (
                        <div className="shrink-0 w-9 h-9 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-amber-600" />
                        </div>
                      )}
                      {job.status === 'COMPLETED' && (
                        <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                    </div>

                    {/* Key details */}
                    <div className="space-y-2 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.scheduled_date} · {job.scheduled_time_slot}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.address_snapshot?.area || 'Bangalore'}, Karnataka</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.ac_type} AC{job.ac_brand ? ` · ${job.ac_brand}` : ''}</span>
                      </div>
                    </div>

                    {isExpanded && job.problem_description && (
                      <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                        <span className="font-semibold block mb-1">Customer Notes:</span>
                        {job.problem_description}
                      </div>
                    )}

                    {isExpanded && (job.status === 'IN_PROGRESS' || job.status === 'WAITING_FOR_APPROVAL') && (
                      <div className="space-y-5 mb-4">
                        <section className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                              <Calculator className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Service Estimate</h4>
                              <p className="text-[11px] text-slate-500">
                                Add line items and send for customer approval
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            {(estimateItems[job.id] || []).map((item) => (
                              <div
                                key={item.id}
                                className="grid grid-cols-12 gap-2 items-center bg-white border border-slate-200 rounded-xl p-2.5"
                              >
                                <div className="col-span-3">
                                  <select
                                    value={item.item_type}
                                    onChange={(e) =>
                                      updateEstimateItem(job.id, item.id, {
                                        item_type: e.target.value as EstimateItemType,
                                      })
                                    }
                                    className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                                  >
                                    <option value="PART">Part</option>
                                    <option value="LABOUR">Labour</option>
                                    <option value="GAS">Gas</option>
                                    <option value="OTHER">Other</option>
                                  </select>
                                </div>
                                <input
                                  type="text"
                                  placeholder="Description"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateEstimateItem(job.id, item.id, { description: e.target.value })
                                  }
                                  className="col-span-4 text-[11px] px-2 py-1.5 rounded-lg border border-slate-200"
                                />
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity || ''}
                                  placeholder="Qty"
                                  onChange={(e) =>
                                    updateEstimateItem(job.id, item.id, {
                                      quantity: Number(e.target.value) || 0,
                                    })
                                  }
                                  className="col-span-1 text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 w-full text-center"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  value={item.unit_price || ''}
                                  placeholder="₹ Rate"
                                  onChange={(e) =>
                                    updateEstimateItem(job.id, item.id, {
                                      unit_price: Number(e.target.value) || 0,
                                    })
                                  }
                                  className="col-span-2 text-[11px] px-2 py-1.5 rounded-lg border border-slate-200"
                                />
                                <div className="col-span-1 text-[11px] font-semibold text-slate-900 text-right pr-1">
                                  ₹{item.total_price.toFixed(2)}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeEstimateItem(job.id, item.id)}
                                  className="col-span-1 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => addEstimateItem(job.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:border-sky-500 hover:text-sky-600 hover:bg-white transition-colors mb-3"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Estimate Item
                          </button>

                          <textarea
                            value={estimateNotes[job.id] || ''}
                            onChange={(e) =>
                              setEstimateNotes((p) => ({ ...p, [job.id]: e.target.value }))
                            }
                            placeholder="Estimate notes (optional)..."
                            rows={2}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 mb-3 resize-none"
                          />

                          <div className="flex flex-col gap-1.5 bg-white rounded-xl border border-slate-200 p-3 text-xs mb-3">
                            {(() => {
                              const { subtotal, tax, total } = estimateTotals(job.id);
                              return (
                                <>
                                  <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-600">
                                    <span>GST (18%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
                                    <span>Total Payable</span>
                                    <span className="text-sky-600">₹{total.toFixed(2)}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={submittingEstimateId === job.id}
                            disabled={!(estimateItems[job.id] || []).length}
                            onClick={() => handleSubmitEstimate(job.id)}
                            className="w-full text-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1.5" />
                            Send Estimate for Approval
                          </Button>
                        </section>

                        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                              <FileCheck2 className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Complete Service Record</h4>
                              <p className="text-[11px] text-slate-500">
                                Finalize work details and mark job as completed
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <textarea
                              value={recordNotes[job.id]?.diagnosis || ''}
                              onChange={(e) =>
                                updateRecordForm(job.id, { diagnosis: e.target.value })
                              }
                              placeholder="Diagnosis notes (e.g. found faulty blower motor, gas leak at flare)"
                              rows={2}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 resize-none"
                            />
                            <textarea
                              value={recordNotes[job.id]?.work || ''}
                              onChange={(e) => updateRecordForm(job.id, { work: e.target.value })}
                              placeholder="Work performed (required): parts replaced, gas filled, testing done"
                              rows={3}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 resize-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Final Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="e.g. 2499"
                                  value={recordNotes[job.id]?.amount || ''}
                                  onChange={(e) =>
                                    updateRecordForm(job.id, { amount: Number(e.target.value) || 0 })
                                  }
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Payment Method
                                </label>
                                <select
                                  value={(recordNotes[job.id]?.paymentMethod || 'CASH') as PaymentMethod}
                                  onChange={(e) =>
                                    updateRecordForm(job.id, {
                                      paymentMethod: e.target.value as PaymentMethod,
                                    })
                                  }
                                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                                >
                                  <option value="CASH">Cash</option>
                                  <option value="UPI">UPI</option>
                                  <option value="CARD">Card</option>
                                  <option value="RAZORPAY">Razorpay</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-xl p-2.5 mb-3">
                            💡 Submitting creates a permanent digital service record and a payment
                            entry for the customer.
                          </div>

                          <Button
                            size="sm"
                            variant="primary"
                            isLoading={submittingRecordId === job.id}
                            disabled={
                              !recordNotes[job.id]?.work?.trim() || !recordNotes[job.id]?.amount
                            }
                            onClick={() => handleSubmitRecord(job.id)}
                            className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Mark Job Completed &amp; Close
                          </Button>
                        </section>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {nextAction && (
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={isUpdating}
                          onClick={() => handleStatusUpdate(job.id, nextAction.status)}
                          className="text-xs flex-1 min-w-[140px]"
                        >
                          {nextAction.label}
                        </Button>
                      )}
                      <a
                        href={`tel:${job.customer_mobile}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                        aria-label={`Call ${job.customer_name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        <span>Call</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : job.id)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
                      >
                        {isExpanded ? 'Collapse' : 'Open Workspace'}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
