import React from 'react';
import { ShieldCheck, SearchCheck, Clock, FileCheck, Award, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const WhyChooseCoolo: React.FC = () => {
  const differentiators = [
    {
      title: 'Verified & Background-Checked',
      description: 'Every technician is verified, trained in modern inverter AC protocols, and equipped with calibrated diagnostic tools.',
      icon: ShieldCheck,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      title: 'Transparent Diagnosis Before Repair',
      description: 'Technicians inspect your unit and explain the exact issue with an upfront estimate before initiating any part replacement.',
      icon: SearchCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Digital Job & Warranty Records',
      description: 'Access your service history, before/after photos, replaced part details, and invoice directly through your Coolo record.',
      icon: FileCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Reliable 2-Hour Scheduling Slots',
      description: 'Pick convenient arrival windows that respect your schedule. On-time dispatch updates keep you informed.',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Genuine OEM-Grade Spares',
      description: 'We source compatible capacitors, sensors, copper coils, and circuit components with transparent part warranties.',
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Standardized Service Protocol',
      description: 'From protective spill sheets to post-service cooling temperature audits, our checklist ensures consistent workmanship.',
      icon: Zap,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            The Coolo Difference
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Engineered for Reliability and Trust
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            We built Coolo to solve the common frustrations of local AC repairs: unexpected charges, delayed technicians, and lack of accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} hoverEffect className="border-slate-200/80">
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
