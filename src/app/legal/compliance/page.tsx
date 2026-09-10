import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, FileText, AlertOctagon, Snowflake, Lock } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
          Regulatory &amp; Pharmaceutical Compliance
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Pharmacy Licensing, Safety &amp; Legal Framework
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Operating in strict compliance with the Drugs and Cosmetics Act, 1940, Drugs and Cosmetics Rules, 1945, and Pharmacy Act, 1948.
        </p>
      </div>

      {/* Licenses Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-700" />
          1. Statutory Drug Sales Licenses
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          MediCare Chronic platform processes orders through a licensed physical retail and wholesale pharmacy licensed under the State Drugs Control Administration:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800">Form 20B Retail Drug License</div>
            <div className="font-mono text-teal-800 font-bold mt-1">DL-20B-MH-89421</div>
            <div className="text-[11px] text-slate-500 mt-1">Authorized for Schedule C, C1, and general medicines.</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800">Form 21B Retail Drug License</div>
            <div className="font-mono text-teal-800 font-bold mt-1">DL-21B-MH-89422</div>
            <div className="text-[11px] text-slate-500 mt-1">Authorized for retail distribution of healthcare products.</div>
          </div>
        </div>
      </div>

      {/* Cold Chain Assurance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-cyan-700" />
          2. Cold-Chain Thermal Integrity (2°C – 8°C)
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Biologic medications including Insulin Glargine, Insulin Aspart, and allied therapies undergo continuous temperature surveillance. Packaging consists of expanded polystyrene (EPS) insulated chambers, chilled phase-change gel packs, and transit temperature monitor tags. Orders destined for non-serviceable pincodes with transit times &gt; 48 hours are automatically blocked at checkout to guarantee therapeutic efficacy.
        </p>
      </div>

      {/* Non-Returnable Medicine Policy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 text-rose-800">
          <AlertOctagon className="w-5 h-5 text-rose-600" />
          3. Non-Returnable Medicine Policy
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Under national pharmaceutical safety standards, medicines once delivered cannot be returned or restocked under any circumstances. In case of demonstrable transit damage, wrong medicine delivery, or defective seal, a replacement or full refund is provided within 24 hours of delivery following photographic proof submitted to our grievance officer.
        </p>
      </div>
    </div>
  );
}
