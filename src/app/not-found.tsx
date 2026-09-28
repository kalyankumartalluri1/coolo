import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200/80 shadow-xs text-xs font-semibold text-sky-800">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          COOLO · Air &amp; Cooling Solutions
        </span>

        <h1 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight mt-6">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
          This page took an unscheduled day off
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back to something cool.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm border border-sky-600 transition-all"
          >
            Return to Home
          </Link>
          <Link
            href="/book-service"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-300 hover:border-slate-400 transition-all"
          >
            Book an AC Service
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-transparent text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
