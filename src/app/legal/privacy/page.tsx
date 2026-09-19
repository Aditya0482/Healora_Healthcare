import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Bell } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Legal</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: September 2026 | Effective immediately</p>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-10">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-teal-700 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-teal-900 mb-1">Our Commitment to Your Privacy</h3>
            <p className="text-sm text-teal-800 leading-relaxed">HealorHealthcare ("we", "our", "us") is committed to protecting the privacy and confidentiality of all personal and health-related information you share with us. This policy explains how we collect, use, store, and protect your data.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {[{
          icon: Database,
          title: '1. Information We Collect',
          content: `We collect the following types of information: (a) Personal Information: Name, email address, phone number, and delivery address provided during registration or checkout. (b) Transaction Data: Order history, payment method (no card details stored — handled by Razorpay), and delivery status. (c) Health Information: Any medical conditions or product preferences you voluntarily share with us. (d) Device & Usage Data: IP address, browser type, pages visited, and session data collected automatically via cookies. (e) Communication Data: Messages or queries submitted through our contact form or customer support.`
        }, {
          icon: Eye,
          title: '2. How We Use Your Information',
          content: `Your information is used to: process and deliver your orders, send order confirmations and delivery updates, respond to customer support requests, improve our products and services based on usage patterns, send promotional offers and newsletters (with your consent — you may unsubscribe anytime), comply with legal obligations under Indian law, and prevent fraud and ensure platform security.`
        }, {
          icon: Lock,
          title: '3. Data Security',
          content: `We implement industry-standard security measures to protect your data: (a) All data is transmitted using 256-bit SSL/TLS encryption. (b) Payment processing is handled by Razorpay (PCI-DSS Level 1 certified) — we never store your card details. (c) Passwords are hashed using bcrypt with salting — we cannot view your password. (d) Our servers are hosted on secure, access-controlled cloud infrastructure. (e) Regular security audits are conducted by our technical team.`
        }, {
          icon: UserCheck,
          title: '4. Sharing Your Information',
          content: `We do NOT sell your personal information to third parties. We may share data with: (a) Logistics partners (e.g., Blue Dart, Delhivery) solely for delivery purposes. (b) Payment gateways (Razorpay) for processing transactions. (c) Government or law enforcement agencies if required by Indian law. All third-party partners are bound by their own privacy policies and are prohibited from using your data for any other purpose.`
        }, {
          icon: Bell,
          title: '5. Your Rights',
          content: `You have the right to: (a) Access your personal data at any time by logging into your account. (b) Request correction of inaccurate information. (c) Request deletion of your account and associated data (subject to legal retention requirements). (d) Opt out of marketing communications at any time. (e) Lodge a complaint with us at supporthealorahealthcare@gmail.com if you believe your data has been mishandled. We will respond to all privacy requests within 30 days.`
        }, {
          icon: Shield,
          title: '6. Cookies Policy',
          content: `We use cookies to enhance your browsing experience. Cookies help us remember your preferences, keep you logged in, and understand how you use our website. You can control cookie settings through your browser. Disabling cookies may affect certain features of our website. We use both session cookies (deleted when you close the browser) and persistent cookies (stored for up to 1 year).`
        }].map((section) => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-5 h-5 text-teal-700" />
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-slate-900 text-slate-300 rounded-2xl p-6">
        <h3 className="font-bold text-white mb-2">Contact our Privacy Team</h3>
        <p className="text-sm">For any privacy-related queries: <span className="text-teal-400">supporthealorahealthcare@gmail.com</span></p>
      </div>
    </div>
  );
}