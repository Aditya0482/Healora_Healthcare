import React from 'react';
import { RefreshCw, XCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';

export default function CancellationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Support</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Cancellation &amp; Refund Policy</h1>
        <p className="text-slate-500">Last updated: September 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[{ icon: CheckCircle, title: 'Easy Cancellations', desc: 'Cancel before dispatch — no questions asked', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { icon: RefreshCw, title: 'Quick Refunds', desc: 'Refunds processed within 5–7 business days', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' }].map((item) => (
          <div key={item.title} className={`border rounded-2xl p-5 ${item.bg}`}>
            <item.icon className={`w-7 h-7 ${item.color} mb-2`} />
            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {[{
          title: '1. Order Cancellation',
          content: `You may cancel your order at any time before it has been dispatched from our warehouse. Once the order is dispatched (you will receive a dispatch notification), cancellation is no longer possible. To cancel, go to My Orders → Select Order → Cancel Order. Alternatively, contact our support team at support@healora.in or call +91 98200 11223 with your order number.`
        }, {
          title: '2. Refund Eligibility',
          content: `Refunds are applicable in the following cases: (a) Order cancelled before dispatch. (b) Wrong product delivered. (c) Damaged or defective product received. (d) Order not delivered within 10 business days of confirmed dispatch. Refunds are NOT applicable for: products that have been used or opened, orders where the delivery address was incorrect (customer error), or orders where the customer was unavailable for all 3 delivery attempts.`
        }, {
          title: '3. Refund Timeline',
          content: `Once your refund is approved, the amount will be credited within 5–7 business days. For UPI and Net Banking payments, refund reflects instantly after processing. For Credit/Debit Cards, the refund may take up to 7–10 business days depending on your bank's processing time. COD orders are refunded via bank transfer; please share your bank account details with our support team.`
        }, {
          title: '4. Return Process',
          content: `For eligible returns (damaged/wrong product), our delivery partner will schedule a pickup from your address. Please ensure: the product is unused and in original packaging, all tags and accessories are intact, and you have the original invoice. Once the return is received and inspected at our warehouse, your refund will be initiated within 2 business days.`
        }, {
          title: '5. Contact for Disputes',
          content: `If your refund or cancellation request is not resolved within 10 business days, please escalate to: grievance@healora.in | Subject: Refund Dispute — [Order Number]. We aim to resolve all disputes within 15 working days as per consumer protection guidelines.`
        }].map((section) => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3">{section.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}