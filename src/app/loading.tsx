import React from 'react';
import { Snowflake } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-sky-100" />
          <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Snowflake className="w-7 h-7 text-sky-400 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
