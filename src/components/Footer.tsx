import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 sm:pt-12 pb-0 border-t border-slate-800 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-8 sm:pb-10">

          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Healora HealthCare"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0"
              />
              <span className="font-bold text-lg sm:text-xl text-white tracking-tight">Healora <span className="text-teal-400">HealthCare</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Your trusted online health & wellness products. We deliver quality health & wellness products right to your doorstep.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Instant Delivery Active
            </div>
          </div>

          {/* Column 2 — STORE */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Store
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-teal-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/category/cirrhosis-liver-care" className="hover:text-teal-400 transition">
                  Cirrhosis
                </Link>
              </li>
              <li>
                <Link href="/category/intimate-care" className="hover:text-teal-400 transition">
                  Intimate
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-teal-400 transition">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — SUPPORT */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/support/contact" className="hover:text-teal-400 transition">
                  Help &amp; Contact
                </Link>
              </li>
              <li>
                <Link href="/support/delivery" className="hover:text-teal-400 transition">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/support/cancellation" className="hover:text-teal-400 transition">
                  Cancellation &amp; Refund
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — LEGAL POLICIES */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">
              Legal Policies
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link href="/legal/privacy" className="hover:text-teal-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-teal-400 transition">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/support/delivery" className="hover:text-teal-400 transition">
                  Delivery Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-5 flex items-center justify-center text-xs text-slate-500">
          © {new Date().getFullYear()} Healora HealthCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

