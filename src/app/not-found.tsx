import React from 'react';
import Link from 'next/link';
import { PackageOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 sm:p-14 text-center space-y-4 max-w-lg w-full shadow-sm">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
          <PackageOpen className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">Page or Category Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The category or page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
