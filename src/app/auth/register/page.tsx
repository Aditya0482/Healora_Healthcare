'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Mobile phone number is required.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || !trimmedEmail.endsWith('@gmail.com')) {
      newErrors.email = 'Please enter a valid Gmail address (must end with @gmail.com).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please fill in all mandatory fields highlighted in red below.');
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const res = await register({
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: trimmedEmail,
      password,
    });

    setLoading(false);
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Healora HealthCare"
            className="w-14 h-14 object-contain mx-auto mb-2"
          />
          <h1 className="text-2xl font-extrabold text-slate-900">Create Account</h1>
          <p className="text-xs text-slate-500">
            Register to manage your orders and receive fast deliveries.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-all">
            <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-xs text-rose-900">
                Registration Incomplete
              </p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">Full Name <span className="text-rose-500">*</span></label>
              {fieldErrors.fullName && (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.fullName}
                </span>
              )}
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                if (error) setError('');
              }}
              placeholder="e.g. Anil Kumar Verma"
              className={`w-full rounded-xl p-3 text-slate-900 outline-none transition font-medium ${
                fieldErrors.fullName
                  ? 'border-2 border-rose-400 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                  : 'bg-slate-50 border border-slate-300 focus:border-teal-700'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">Mobile Phone <span className="text-rose-500">*</span></label>
              {fieldErrors.phone && (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.phone}
                </span>
              )}
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                if (error) setError('');
              }}
              placeholder="10-digit mobile number"
              className={`w-full rounded-xl p-3 text-slate-900 outline-none font-mono transition font-medium ${
                fieldErrors.phone
                  ? 'border-2 border-rose-400 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                  : 'bg-slate-50 border border-slate-300 focus:border-teal-700'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">Email Address <span className="text-rose-500">*</span></label>
              {fieldErrors.email && (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </span>
              )}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                if (error) setError('');
              }}
              placeholder="demo@gmail.com"
              className={`w-full rounded-xl p-3 text-slate-900 outline-none transition font-medium ${
                fieldErrors.email
                  ? 'border-2 border-rose-400 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                  : 'bg-slate-50 border border-slate-300 focus:border-teal-700'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">Password <span className="text-rose-500">*</span></label>
              {fieldErrors.password && (
                <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  if (error) setError('');
                }}
                placeholder="Minimum 6 characters"
                className={`w-full rounded-xl p-3 pr-11 text-slate-900 outline-none font-medium transition ${
                  fieldErrors.password
                    ? 'border-2 border-rose-400 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                    : 'bg-slate-50 border border-slate-300 focus:border-teal-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition focus:outline-none p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link
            href={`/auth/login${redirectUrl && redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="font-bold text-teal-700 hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
