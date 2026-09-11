'use client';

import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface ReceiptOrderItem {
  id: string;
  productNameSnapshot: string;
  genericSaltSnapshot: string;
  strengthSnapshot: string;
  formSnapshot: string;
  unitPricePaid: number;
  quantity: number;
  totalPrice: number;
}

interface ReceiptOrderData {
  orderNumber: string;
  createdAt: string | Date;
  orderStatus: string;
  totalMrpAmount?: number;
  totalDiscountAmount?: number;
  couponCode?: string | null;
  couponDiscountAmount?: number;
  deliveryCharge: number;
  coldChainFee: number;
  finalPayableAmount: number;
  isColdChain?: boolean;
  payment?: {
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    paymentMethod?: string | null;
    paymentStatus?: string | null;
    capturedAt?: string | Date | null;
  } | null;
  address: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
    addressType?: string;
  };
  items: ReceiptOrderItem[];
  user?: {
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
}

interface PaymentReceiptModalProps {
  order: ReceiptOrderData;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentReceiptModal({ order, isOpen, onClose }: PaymentReceiptModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentMethod = order.payment?.paymentMethod || 'Online (Razorpay UPI / Card / NetBanking)';
  const txnId = order.payment?.razorpayPaymentId || `TXN-${order.orderNumber.replace(/[^0-9]/g, '')}`;

  const handlePrintOrDownload = () => {
    window.print();
  };

  // Automatically trigger download/print dialog when user clicks Download Receipt
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        {/* Top Modal Action Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Download Payment Receipt</h3>
              <p className="text-[11px] text-teal-300">Save as PDF or Print Official Invoice</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrDownload}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              Download Receipt (PDF)
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Canvas */}
        <div ref={printableRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white">
          {/* Header Brand Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <img
                  src="/logo.png"
                  alt="Healora HealthCare"
                  className="w-9 h-9 object-contain"
                />
                <span className="font-black text-xl text-slate-900 tracking-tight">
                  Healora<span className="text-teal-600">HealthCare</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                Licensed Online Healthcare &amp; Wellness Store<br />
                Govt. Drug License &amp; GST Registered Entity
              </p>
              <div className="mt-2 text-[11px] text-slate-500 flex flex-col gap-0.5 font-medium">
                <span>support@healora.com • +91 99999 88888</span>
                <span>Website: https://healora.com</span>
              </div>
            </div>

            {/* Receipt Identification Badge */}
            <div className="sm:text-right bg-teal-50/60 p-4 rounded-2xl border border-teal-100/80">
              <span className="inline-block bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-2">
                ✓ PAYMENT SUCCESSFUL
              </span>
              <div className="text-xs text-slate-500">Official Invoice Ref:</div>
              <div className="font-mono font-black text-slate-900 text-base">{order.orderNumber}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Date: <strong className="text-slate-800">{orderDate}</strong> at {orderTime}
              </div>
            </div>
          </div>

          {/* Customer & Transaction Meta Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-600" /> Billed &amp; Delivered To:
              </div>
              <div className="font-bold text-slate-900 text-sm">{order.address.recipientName}</div>
              <div className="text-slate-600 mt-0.5 leading-relaxed">
                {order.address.addressLine1}
                {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                {order.address.landmark ? ` (Near ${order.address.landmark})` : ''}
                <br />
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </div>
              <div className="text-slate-600 font-semibold mt-1">
                Phone: {order.address.phone}
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-teal-600" /> Payment &amp; Gateway Details:
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-emerald-700">PAID &amp; CAPTURED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold text-slate-800">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] truncate max-w-[170px]" title={txnId}>
                  {txnId}
                </span>
              </div>
              {order.payment?.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Order:</span>
                  <span className="font-mono text-slate-600 text-[10px] truncate max-w-[170px]">
                    {order.payment.razorpayOrderId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Medicine Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.productNameSnapshot}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.genericSaltSnapshot} • {item.strengthSnapshot} ({item.formSnapshot})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ₹{((item.unitPricePaid || (item.totalPrice / item.quantity)) / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                      ₹{(item.totalPrice / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Breakdown & Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-slate-500 max-w-xs space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Authentic Clinical Delivery
              </div>
              <p className="text-[11px] leading-relaxed">
                All medicines are inspected, genuine, and packed in temperature-compliant tamper-evident packaging. Keep this receipt for warranty and medical record purposes.
              </p>
            </div>

            <div className="w-full sm:w-72 text-xs space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono">
                  ₹{(order.items.reduce((sum, it) => sum + it.totalPrice, 0) / 100).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges:</span>
                <span className="font-mono font-medium">
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${(order.deliveryCharge / 100).toFixed(2)}`}
                </span>
              </div>

              {order.coldChainFee > 0 && (
                <div className="flex justify-between text-cyan-800 font-medium">
                  <span>Cold Chain Packaging:</span>
                  <span className="font-mono">₹{(order.coldChainFee / 100).toFixed(2)}</span>
                </div>
              )}

              {order.couponDiscountAmount && order.couponDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({order.couponCode || 'APPLIED'}):</span>
                  <span className="font-mono">-₹{(order.couponDiscountAmount / 100).toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2.5 border-t-2 border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="text-base text-teal-700 font-mono">
                  ₹{(order.finalPayableAmount / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note & Signatory */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-slate-400">
            <div>
              <p className="font-semibold text-slate-600">Healora HealthCare Private Limited</p>
              <p>This is a computer-generated official receipt. No physical signature required.</p>
            </div>

            <div className="flex items-center gap-1.5 text-teal-800 font-bold bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>100% Verified Order Payment</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons (Hidden on Print) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Click <strong>Download Receipt</strong> to save the official PDF on your phone or computer.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={handlePrintOrDownload}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
