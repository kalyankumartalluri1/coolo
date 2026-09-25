'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does Coolo pricing work?',
      answer:
        'We believe in complete pricing transparency. Routine services such as filter servicing and foam jet deep cleaning have fixed starting rates. For AC repairs, our technician performs a multi-point diagnosis first and provides an itemized estimate for parts and labour. No repair work begins without your explicit approval.',
    },
    {
      question: 'Do I need to pay online while booking?',
      answer:
        'No upfront payment is required during booking. You only pay after our technician visits your premises, performs the requested service or diagnostic, and you are satisfied with the cooling performance.',
    },
    {
      question: 'What types and brands of ACs do you service?',
      answer:
        'We service Split, Window, Cassette, and Multi-Split inverter and fixed-speed ACs from all major brands including Daikin, Voltas, LG, Samsung, Hitachi, Blue Star, Carrier, Panasonic, Godrej, Mitsubishi, and others.',
    },
    {
      question: 'How quickly can a technician arrive at my home in Bangalore?',
      answer:
        'You can select any available 2-hour window during our operating hours (8:00 AM to 9:00 PM). In many Bangalore localities like Indiranagar, Whitefield, HSR Layout, and Koramangala, same-day slots are frequently available.',
    },
    {
      question: 'What happens if my AC requires replacement parts?',
      answer:
        'Our technicians carry genuine OEM-compatible spare parts such as capacitors, fan motors, sensors, and flare connectors. If a part replacement is recommended, the technician will show you the worn component, quote the transparent part price, and only proceed upon your approval.',
    },
    {
      question: 'Do you provide a service warranty?',
      answer:
        'Yes. Standard servicing and repairs include a dedicated workmanship warranty period. You receive a digital service summary with technician details and warranty terms directly on your Coolo digital record.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Clear, honest answers about our services, technicians, and pricing.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-sky-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
