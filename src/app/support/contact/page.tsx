'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }
      else setError(data.error || 'Something went wrong');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
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
            <p className="text-sm text-slate-500">support@healora.in</p>
            <p className="text-xs text-slate-400 mt-1">We respond within 24 hours</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-teal-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
            <p className="text-sm text-slate-500">+91 98200 11223</p>
            <p className="text-xs text-slate-400 mt-1">Mon–Sat, 9 AM – 6 PM IST</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-teal-700" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Our Office</h3>
            <p className="text-sm text-slate-500">Sector 4, Metro Pharma Hub, Mumbai, MH – 400001</p>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Anil Kumar" className="w-full border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-lg px-3 py-2.5 text-sm outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="w-full border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-lg px-3 py-2.5 text-sm outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98XXXXXXXX" className="w-full border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-lg px-3 py-2.5 text-sm outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange} className="w-full border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-lg px-3 py-2.5 text-sm outline-none transition bg-white">
                    <option value="">Select a topic</option>
                    <option>Order Issue</option>
                    <option>Payment Problem</option>
                    <option>Delivery Inquiry</option>
                    <option>Product Information</option>
                    <option>Return / Refund</option>
                    <option>Account Help</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message *</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Describe your issue or question in detail..." className="w-full border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-lg px-3 py-2.5 text-sm outline-none transition resize-none" />
              </div>
              {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-4 py-3">{error}</div>}
              <div className="flex justify-center pt-2">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold text-sm px-10 py-3 rounded-lg transition shadow-md">
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