import React from 'react';
import { Calendar, UserCheck, Wrench, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Book in 30 Seconds',
      description: 'Choose your AC service, select your Bangalore locality, and pick your preferred 2-hour arrival window.',
      icon: Calendar,
    },
    {
      step: '02',
      title: 'Technician Assigned',
      description: 'A verified local cooling specialist is assigned with clear tracking and phone coordination before arrival.',
      icon: UserCheck,
    },
    {
      step: '03',
      title: 'Diagnosis & Approval',
      description: 'Technician inspects the unit on-site. Any extra repair or part replacement requires your upfront consent.',
      icon: Wrench,
    },
    {
      step: '04',
      title: 'Completion & Record',
      description: 'Work is tested for optimal cooling delta-T. Receive a digital service summary and warranty receipt.',
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            Streamlined Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            How Coolo Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Simple, transparent, and technology-backed from initial booking to completed job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-sky-200">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-sky-600">
                  <span>Step {item.step}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
