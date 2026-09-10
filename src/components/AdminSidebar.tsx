'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Pill,
  ArrowLeft,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { href: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Order Management', icon: Package },
    { href: '/admin/products', label: 'Products & Discounts', icon: Pill },
    { href: '/admin?tab=users', label: 'Users & Customers', icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen p-4 flex flex-col justify-between border-r border-slate-800">
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="px-3.5 py-3 bg-slate-800/90 rounded-2xl border border-slate-700">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-teal-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            Website Admin Control
          </div>
          <div className="text-sm font-bold text-white truncate mt-0.5">
            {user?.fullName || 'Administrator'}
          </div>
          <div className="text-[11px] text-slate-400">
            Role: <span className="text-amber-400 font-semibold">{user?.role || 'ADMIN'}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 text-xs font-semibold">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-teal-700 text-white font-bold shadow-md shadow-teal-700/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Storefront */}
      <div className="pt-4 border-t border-slate-800 mt-6 md:mt-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition px-3.5 py-2.5 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          View Live Website
        </Link>
      </div>
    </aside>
  );
}
