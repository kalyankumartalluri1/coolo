'use client';

import React, { useState } from 'react';
import { Calculator, ArrowRight, Check, Tag } from 'lucide-react';
import { SERVICES } from '@/lib/constants/services';
import { AC_TYPES } from '@/lib/constants/areas';
import { Button } from '@/components/ui/Button';

export const CostEstimator: React.FC = () => {
  const [selectedServiceSlug, setSelectedServiceSlug] = useState('ac-service');
  const [selectedAcType, setSelectedAcType] = useState<string>('Split');
  const [unitCount, setUnitCount] = useState<number>(1);

  const selectedService = SERVICES.find((s) => s.slug === selectedServiceSlug) || SERVICES[0];

  // Base price modifier by AC type
  const typeMultiplier: Record<string, number> = {
    Split: 1.0,
    Window: 0.9,
    Cassette: 1.6,
    Ducted: 2.0,
    Other: 1.2,
  };

  const multiplier = typeMultiplier[selectedAcType] || 1.0;
  const singleUnitBase = Math.round(selectedService.startingPrice * multiplier);

  // Multi-unit discount calculation: 10% off for 2 units, 15% off for 3+ units
  const discountRate = unitCount === 1 ? 0 : unitCount === 2 ? 0.1 : 0.15;
  const grossTotal = singleUnitBase * unitCount;
  const discountAmount = Math.round(grossTotal * discountRate);
  const netEstimatedPrice = grossTotal - discountAmount;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Instant Price Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Estimate Your Service Charges
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Transparent starting estimates with volume discounts for multi-unit servicing in Bangalore homes and offices.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Select Service */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  1. Choose Service
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SERVICES.slice(0, 6).map((service) => (
                    <button
                      key={service.slug}
                      type="button"
                      onClick={() => setSelectedServiceSlug(service.slug)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        selectedServiceSlug === service.slug
                          ? 'border-sky-500 bg-sky-50/70 text-sky-900 ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-semibold block truncate">{service.name}</span>
                      <span className="text-[10px] text-slate-500">From ₹{service.startingPrice}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select AC Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  2. AC Unit Architecture
                </label>
                <div className="flex flex-wrap gap-2">
                  {AC_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedAcType(type)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedAcType === type
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Count Selector */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    3. Number of AC Units
                  </label>
                  {unitCount > 1 && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Tag className="w-3 h-3" />
                      {discountRate * 100}% Multi-Unit Discount Applied
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setUnitCount(num)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        unitCount === num
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {num} {num === 1 ? 'Unit' : 'Units'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Box */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/90 text-left flex flex-col justify-between h-full space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Estimated Starting Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">
                    ₹{netEstimatedPrice}
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-sm line-through text-slate-400 font-semibold">
                      ₹{grossTotal}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  *Indicative service fee. Spare parts and refrigerant gas (if required) are quoted on-site after diagnosis.
                </p>

                <div className="mt-5 space-y-2 pt-4 border-t border-slate-200 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-semibold text-slate-900">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AC Model:</span>
                    <span className="font-semibold text-slate-900">{selectedAcType} AC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-semibold text-slate-900">{unitCount} {unitCount === 1 ? 'Unit' : 'Units'}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Multi-Unit Savings:</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                <ul className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-500">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>No advance payment needed</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Digital service warranty certificate</span>
                  </li>
                </ul>
              </div>

              <Button
                href={`/book-service?service=${selectedService.slug}`}
                variant="primary"
                size="lg"
                className="w-full text-xs sm:text-sm"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Book at Estimated Price
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
