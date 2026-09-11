'use client';

import React, { useState, useRef, Suspense } from 'react';
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
  Eye,
  EyeOff,
  Sparkles,
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot Password States (Email only)
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [showFpNewPassword, setShowFpNewPassword] = useState(false);
  const [showFpConfirmPassword, setShowFpConfirmPassword] = useState(false);
  const [fpStep, setFpStep] = useState<'INPUT' | 'VERIFY' | 'SUCCESS'>('INPUT');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBackToLogin = (prefillEmail?: string) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setIsForgotPassword(false);
    setFpStep('INPUT');
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
    setPassword('');
    setFpOtp('');
    setFpNewPassword('');
    setFpConfirmPassword('');
    setFpSuccess('');
    setFpError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || !trimmedEmail.endsWith('@gmail.com')) {
      newErrors.email = 'Please enter a valid Gmail address (must end with @gmail.com).';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please fill in the required fields correctly.');
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const res = await login({
      emailOrPhone: trimmedEmail,
      password,
    });

    setLoading(false);
    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Incorrect email or password. Please check your credentials and try again.');
      setFieldErrors({
        email: 'Check this email address',
        password: 'Or verify your password',
      });
    }
  };

  // Forgot Password - Step 1: Send OTP to Email
  const handleFpSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError('');
    setFpSuccess('');

    const trimmedFpEmail = fpEmail.trim().toLowerCase();
    if (!trimmedFpEmail) {
      setFpError('Please enter your registered Gmail address.');
      return;
    }

    if (!trimmedFpEmail.endsWith('@gmail.com') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedFpEmail)) {
      setFpError('Please enter a valid Gmail address (must end with @gmail.com).');
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
        const receivedOtp = data.otp;
        if (data.emailSent) {
          setFpSuccess('Verification OTP has been sent to your email! Please check your inbox / spam folder.');
          setFpOtp('');
        } else {
          setFpSuccess(`OTP generated successfully! (Verification code: ${receivedOtp})`);
          setFpOtp(receivedOtp || '');
        }
        setFpStep('VERIFY');
      } else {
        setFpError(data.error || 'This email is not registered.');
      }
    } catch {
      setFpError('Does not connect to server.Please try again.');
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
      setFpError('Please enter 6 digit OTP....');
      return;
    }

    if (fpNewPassword.length < 6) {
      setFpError('New password should be minimum 6 characters');
      return;
    }

    if (fpNewPassword !== fpConfirmPassword) {
      setFpError('New password and old passeword does not match');
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
        setFpStep('SUCCESS');
        setFpSuccess('');
        setFpError('');
        const updatedEmail = fpEmail.trim();
        resetTimerRef.current = setTimeout(() => {
          handleBackToLogin(updatedEmail);
        }, 3000);
      } else {
        setFpError(data.error || 'Some error during reset password.');
      }
    } catch {
      setFpError('Server error. Please retry.');
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
          {isForgotPassword
            ? fpStep === 'SUCCESS'
              ? 'Password Reset'
              : 'Reset Password'
            : 'Sign In to Healora'}
        </h1>
        <p className="text-xs text-slate-500">
          {isForgotPassword
            ? fpStep === 'SUCCESS'
              ? 'Your password has been updated securely'
              : ''
            : 'Access your products, account and order tracking.'}
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
          {fpStep === 'SUCCESS' ? (
            <div className="py-6 px-3 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              {/* Glowing Green Light Aura Container */}
              <div className="relative flex items-center justify-center my-3">
                {/* Outer pulsing emerald-green light glow */}
                <div className="absolute -inset-4 bg-emerald-400/40 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 via-green-400 to-teal-400 rounded-full blur-lg opacity-75 animate-pulse" />

                {/* Center Badge with Emerald Gradient & Ring */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/50 ring-4 ring-emerald-100">
                  <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 bg-white text-emerald-600 rounded-full p-1 shadow-md border border-emerald-100">
                    <Sparkles className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  </span>
                </div>
              </div>

              {/* Status Badge & Text */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Password Reset Successfully!
                </div>

                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Password Updated!
                </h2>

                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your password has been updated securely. Redirecting to sign in page...
                </p>
              </div>

              {/* Glowing animated progress line */}
              <div className="w-full max-w-[200px] bg-emerald-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-full rounded-full animate-pulse w-full" />
              </div>

              {/* Immediate action button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleBackToLogin(fpEmail.trim())}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline inline-flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-teal-50 transition cursor-pointer"
                >
                  Click here to Sign In now &rarr;
                </button>
              </div>
            </div>
          ) : (
            <>
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
                      placeholder="e.g demo@gmail.com"
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
                      Enter 6-Digit OTP <span className="text-teal-700 font-semibold">(Sent to your email)</span>
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
                    <div className="relative">
                      <input
                        type={showFpNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pr-10 text-slate-900 outline-none focus:border-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFpNewPassword(!showFpNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition focus:outline-none p-1 cursor-pointer"
                        aria-label={showFpNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showFpNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showFpConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter new password"
                        value={fpConfirmPassword}
                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pr-10 text-slate-900 outline-none focus:border-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFpConfirmPassword(!showFpConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition focus:outline-none p-1 cursor-pointer"
                        aria-label={showFpConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showFpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                  onClick={() => handleBackToLogin()}
                  className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ================= REGULAR SIGN IN FLOW (EMAIL & PASSWORD ONLY) ================= */
        <>
          {error && (
            <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-all">
              <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-xs text-rose-900">
                  Unable to Sign In
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
                <label className="font-bold text-slate-700 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
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
                placeholder="name@example.com"
                className={`w-full rounded-xl p-3 text-slate-900 outline-none text-xs font-medium transition ${
                  fieldErrors.email
                    ? 'border-2 border-rose-400 bg-rose-50/40 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                    : 'bg-slate-50 border border-slate-300 focus:border-teal-700'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 block">
                  Password <span className="text-rose-500">*</span>
                </label>
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
                  placeholder="Enter your password"
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
