import React from 'react';
import { Truck, Clock, MapPin, Package, ShieldCheck, AlertCircle } from 'lucide-react';

export default function DeliveryPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Support</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Delivery Policy</h1>
        <p className="text-slate-500">Last updated: September 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[{ icon: Truck, title: 'Express Delivery', desc: '2–4 business days across India' },
          { icon: Clock, title: 'Same Day Dispatch', desc: 'Orders placed before 2 PM IST' },
          { icon: MapPin, title: 'Pan-India Coverage', desc: 'Delivery to 27,000+ pin codes' }].map((item) => (
          <div key={item.title} className="bg-teal-50 border border-teal-100 rounded-2xl p-5 text-center">
            <item.icon className="w-7 h-7 text-teal-700 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {[{
          title: '1. Delivery Timelines',
          content: `Standard Delivery: 3–5 business days. Express Delivery: 1–2 business days (select cities). Rural / Tier-3 locations may require 5–7 business days. All timelines are from the date of order confirmation, not order placement. Sundays and national holidays are excluded from business day counts.`
        }, {
          title: '2. Shipping Charges',
          content: `Free shipping on all orders above ₹499. Orders below ₹499: ₹49 flat shipping fee. Express delivery charges: ₹99 additional (where available). Remote location surcharge may apply for select pin codes.`
        }, {
          title: '3. Order Tracking',
          content: `Once your order is dispatched, you will receive an SMS and email with a tracking link. You can also track your order from My Orders section after logging in. Our logistics partner will attempt delivery up to 3 times before returning the shipment.`
        }, {
          title: '4. Delivery Attempt & Re-Delivery',
          content: `If you are unavailable at the time of delivery, our courier partner will attempt re-delivery on the next working day. After 3 failed attempts, the order will be returned to our warehouse. You may contact our support team to reschedule delivery or request a refund.`
        }, {
          title: '5. Damaged / Missing Items',
          content: `If you receive a damaged package or find items missing, please do not accept the delivery or immediately take a photo/video of the package condition. Report the issue within 48 hours of delivery to support@healora.in. We will initiate a replacement or full refund within 3–5 business days.`
        }, {
          title: '6. International Shipping',
          content: `Currently, we only ship within India. International orders are not accepted at this time. We plan to expand to select countries in 2027.`
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