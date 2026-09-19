'use client';
import React, { useState } from 'react';
import * as fpixel from '@/lib/fpixel';
import { Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    const cleanPhone = form.phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Please enter your mobile phone number.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!form.subject) {
      newErrors.subject = 'Please choose a subject topic.';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Please enter your message or question.';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError('Please fill in all the required fields highlighted below.');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        try {
          fpixel.event('Contact');
        } catch {
          // ignore tracking error
        }
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        setFieldErrors({});
      } else {
        setError(data.error || 'Failed to submit message. Please try again.');
      }
    } catch {
      setError('Network connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Get in Touch</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Help &amp; Contact</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Have a question, feedback, or need help with your order? Fill out the form below and our team will get back to you within 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-teal-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
            <a
              href="mailto:supporthealorahealthcare@gmail.com"
              className="text-sm text-teal-700 hover:underline font-medium break-all"
            >
              supporthealorahealthcare@gmail.com
            </a>
            <p className="text-xs text-slate-400 mt-2">We respond within 24 hours</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-teal-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Support Hours</h3>
            <p className="text-sm text-slate-600">Mon–Sat, 9 AM – 6 PM IST</p>
            <p className="text-xs text-slate-400 mt-1">Available for order &amp; product inquiries</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-teal-600" />
              <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-slate-500 max-w-sm">Thank you for reaching out. Our team will respond to you within 24 hours.</p>
              <button onClick={() => setSuccess(false)} className="mt-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Send Us a Message</h2>

              {/* Attractive Red Error Banner */}
              {error && (
                <div className="bg-rose-50/90 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-all mb-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-rose-900">
                      Please Check Required Fields
                    </p>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Full Name <span className="text-rose-500">*</span></label>
                    {fieldErrors.name && (
                      <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.name}
                      </span>
                    )}
                  </div>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition font-medium ${
                      fieldErrors.name
                        ? 'border-2 border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                        : 'border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                    {fieldErrors.email && (
                      <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition font-medium ${
                      fieldErrors.email
                        ? 'border-2 border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                        : 'border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Phone Number <span className="text-rose-500">*</span></label>
                    {fieldErrors.phone && (
                      <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.phone}
                      </span>
                    )}
                  </div>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98XXXXXXXX"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition font-medium ${
                      fieldErrors.phone
                        ? 'border-2 border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                        : 'border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Subject / Topic <span className="text-rose-500">*</span></label>
                    {fieldErrors.subject && (
                      <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {fieldErrors.subject}
                      </span>
                    )}
                  </div>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition font-medium cursor-pointer ${
                      fieldErrors.subject
                        ? 'border-2 border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                        : 'border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white'
                    }`}
                  >
                    <option value="">Select a topic</option>
                    <option value="Order Issue">Order Issue</option>
                    <option value="Payment Problem">Payment Problem</option>
                    <option value="Delivery Inquiry">Delivery Inquiry</option>
                    <option value="Product Information">Product Information</option>
                    <option value="Return / Refund">Return / Refund</option>
                    <option value="Account Help">Account Help</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Message Details <span className="text-rose-500">*</span></label>
                  {fieldErrors.message && (
                    <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.message}
                    </span>
                  )}
                </div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition resize-none font-medium ${
                    fieldErrors.message
                      ? 'border-2 border-rose-400 bg-rose-50/40 text-slate-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                      : 'border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white'
                  }`}
                />
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-sm px-10 py-3 rounded-xl transition shadow-lg shadow-teal-700/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}