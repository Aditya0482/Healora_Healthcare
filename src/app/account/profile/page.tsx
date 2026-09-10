'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAvatarUrl, CARTOON_AVATARS } from '@/lib/avatars';
import {
  User,
  Briefcase,
  MapPin,
  Package,
  Settings,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AccountProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/account/profile');
      return;
    }

    if (user) {
      Promise.all([
        fetch('/api/addresses').then((r) => (r.ok ? r.json() : { addresses: [] })),
        fetch('/api/orders/user').then((r) => (r.ok ? r.json() : { orders: [] })),
      ])
        .then(([addrData, orderData]) => {
          setAddresses(addrData.addresses || []);
          setOrderCount((orderData.orders || []).length);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading || !user) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
      </div>
    );
  }

  const avatarInfo = CARTOON_AVATARS.find((a) => a.id === user.avatar);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-teal-700 flex items-center gap-1 font-semibold">
              <ArrowLeft className="w-3 h-3" /> Back to Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-bold">My Profile</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your comprehensive profile card, verified details, and account summary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/account/orders"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <Package className="w-4 h-4 text-teal-700" />
            My Orders ({orderCount})
          </Link>
          <Link
            href="/account/settings"
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            Edit in Settings
          </Link>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 relative px-6 flex items-end justify-between">
          <div className="absolute right-6 top-4 opacity-15">
            <ShieldCheck className="w-24 h-24 text-white" />
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.fullName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 border-4 border-white shadow-lg object-cover"
                />
                <Link
                  href="/account/settings?tab=avatar"
                  className="absolute bottom-1 right-1 bg-teal-700 hover:bg-teal-800 text-white p-1.5 rounded-full shadow-md transition"
                  title="Change Avatar"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h2>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-slate-500 text-xs">{user.email}</span>
                  {avatarInfo && (
                    <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                      Avatar: {avatarInfo.name} ({avatarInfo.category})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/account/settings"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition border border-slate-200 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-700" />
              Edit Profile
            </Link>
          </div>

          {user.bio && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed italic mb-6">
              "{user.bio}"
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400">Total Orders</div>
              <div className="text-lg font-black text-slate-900">{orderCount} Placed</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400">Saved Addresses</div>
              <div className="text-lg font-black text-slate-900">{addresses.length} Locations</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400">Account Status</div>
              <div className="text-lg font-black text-emerald-600">Active &amp; Verified</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400">Member Since</div>
              <div className="text-lg font-black text-slate-900">
                {user.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid: Personal & Professional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Personal Details Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-700" />
                  Personal Details
                </h3>
                <Link
                  href="/account/settings?tab=personal"
                  className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  Edit
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Full Name:
                  </span>
                  <span className="font-bold text-slate-900">{user.fullName}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Email:
                  </span>
                  <span className="font-semibold text-slate-900">{user.email}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone:
                  </span>
                  <span className="font-semibold text-slate-900">{user.phone}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-semibold text-slate-900">{user.gender || 'Not specified'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Birth:
                  </span>
                  <span className="font-semibold text-slate-900">{user.dateOfBirth || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Professional Details Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-700" />
                  Professional Details
                </h3>
                <Link
                  href="/account/settings?tab=professional"
                  className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  Edit
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Profession:
                  </span>
                  <span className="font-bold text-slate-900">{user.profession || 'Not added'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" /> Organization:
                  </span>
                  <span className="font-semibold text-slate-900">{user.organization || 'Not added'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Designation / Role:</span>
                  <span className="font-semibold text-slate-900">{user.designation || 'Not added'}</span>
                </div>
              </div>

              {!user.profession && !user.organization && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-teal-800">
                  Tip: Add your profession and workplace in Settings to get verified healthcare badges.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Addresses Snapshot */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700" />
              Saved Delivery Addresses ({addresses.length})
            </h3>
            <Link
              href="/account/settings?tab=addresses"
              className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1"
            >
              Manage Addresses
            </Link>
          </div>

        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{addr.recipientName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-black px-2 py-0.5 rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-slate-600">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                </div>
                <div className="text-slate-600 font-semibold">
                  {addr.city}, {addr.state} - {addr.pincode}
                </div>
                <div className="text-[11px] text-slate-400">Phone: {addr.phone}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            No delivery addresses saved yet.{' '}
            <Link href="/account/settings" className="text-teal-700 font-bold hover:underline">
              Add your address in Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
