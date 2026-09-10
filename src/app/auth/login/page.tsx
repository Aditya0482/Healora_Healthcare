'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  // Mode: Regular Login vs Forgot Password
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Regular Email & Password Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password States (Email only)
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [fpStep, setFpStep] = useState<'INPUT' | 'VERIFY'>('INPUT');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login({
      emailOrPhone: email.trim(),
      password,
    });

    setLoading(false);
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Authentication failed. Please check your email and password.');
    }
  };

  // Forgot Password - Step 1: Send OTP to Email
  const handleFpSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');
    setFpSuccess('');

    if (!fpEmail.trim()) {
      setFpError('Kripya apna registered Email enter karein');
      return;
    }

    setFpLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_OTP', email: fpEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setFpSuccess('OTP aapke email par bhej diya gaya hai! (Verification code: 123456)');
        setFpOtp('123456'); // Pre-fill test code for convenience
        setFpStep('VERIFY');
      } else {
        setFpError(data.error || 'Is email se account nahi mila.');
      }
    } catch {
      setFpError('Server se connect nahi ho paya. Kripya punah prayas karein.');
    } finally {
      setFpLoading(false);
    }
  };

  // Forgot Password - Step 2: Reset Password
  const handleFpReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');
    setFpSuccess('');

    if (!fpOtp) {
      setFpError('Kripya 6-digit OTP enter karein');
      return;
    }

    if (fpNewPassword.length < 6) {
      setFpError('Naya password kam se kam 6 characters ka hona chahiye');
      return;
    }

    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('New password aur Confirm password match nahi ho rahe hain');
      return;
    }

    setFpLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          email: fpEmail.trim(),
          otp: fpOtp,
          newPassword: fpNewPassword,
          confirmPassword: fpConfirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFpSuccess('✓ Password safalta-purvak reset ho gaya hai!');
        setTimeout(() => {
          setIsForgotPassword(false);
          setEmail(fpEmail);
          setFpSuccess('');
          setFpError('');
        }, 1500);
      } else {
        setFpError(data.error || 'Password reset karne me samasya aayi.');
      }
    } catch {
      setFpError('Server error aayi. Kripya punah prayas karein.');
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-lg space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <img
          src="/logo.png"
          alt="Healora HealthCare"
          className="w-14 h-14 object-contain mx-auto mb-2"
        />
        <h1 className="text-2xl font-extrabold text-slate-900">
          {isForgotPassword ? 'Reset Password' : 'Sign In to Healora'}
        </h1>
        <p className="text-xs text-slate-500">
          {isForgotPassword
            ? 'Enter email to reset your password.'
            : 'Access your medications, account, and order tracking.'}
        </p>
      </div>

      {redirectUrl === '/cart' && !isForgotPassword && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 text-xs p-3.5 rounded-xl flex items-center gap-2.5 font-medium shadow-sm">
          <ShoppingCart className="w-4 h-4 text-teal-700 flex-shrink-0" />
          <span>Please sign in to view and manage your shopping cart.</span>
        </div>
      )}

      {/* ================= FORGOT PASSWORD FLOW (EMAIL ONLY) ================= */}
      {isForgotPassword ? (
        <div className="space-y-4 text-xs">
          {fpError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fpError}</span>
            </div>
          )}

          {fpSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{fpSuccess}</span>
            </div>
          )}

          {fpStep === 'INPUT' ? (
            <form onSubmit={handleFpSendOtp} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  placeholder="e.g. admin@medicare.com or patient@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-teal-700 text-xs font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Enter email to reset your password
                </p>
              </div>

              <button
                type="submit"
                disabled={fpLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
              >
                {fpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification OTP to Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFpReset} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enter 6-Digit OTP <span className="text-teal-700 font-semibold">(Verification code: 123456)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={fpOtp}
                  onChange={(e) => setFpOtp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-center font-mono text-base tracking-widest outline-none focus:border-teal-700 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={fpNewPassword}
                  onChange={(e) => setFpNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={fpConfirmPassword}
                  onChange={(e) => setFpConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 outline-none focus:border-teal-700"
                />
              </div>

              <button
                type="submit"
                disabled={fpLoading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
              >
                {fpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password & Save'}
              </button>

              <button
                type="button"
                onClick={() => setFpStep('INPUT')}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 font-semibold pt-1"
              >
                Change Email Address
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setFpError('');
                setFpSuccess('');
              }}
              className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </div>
        </div>
      ) : (
        /* ================= REGULAR SIGN IN FLOW (EMAIL & PASSWORD ONLY) ================= */
        <>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medicare.com ya patient@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-teal-700 text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 outline-none focus:border-teal-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>

            {/* Forgot Password Button - Below Sign In & Above Register, Right Aligned */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setFpEmail(email);
                  setFpStep('INPUT');
                  setFpError('');
                  setFpSuccess('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don&apos;t have an account yet?{' '}
            <Link
              href={`/auth/register${redirectUrl && redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-bold text-teal-700 hover:underline"
            >
              Register for Free
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-teal-700" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
