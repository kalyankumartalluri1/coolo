import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sky' | 'teal' | 'slate' | 'emerald' | 'amber' | 'rose' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sky',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
  };

  const variantClasses = {
    sky: 'bg-sky-50 text-sky-700 border border-sky-200/80',
    teal: 'bg-teal-50 text-teal-700 border border-teal-200/80',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    outline: 'bg-transparent text-slate-600 border border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
