'use client';

import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building, X, AlertCircle, Loader2 } from 'lucide-react';

interface RazorpayModalProps {
  orderData: {
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amountPaise: number;
    keyId: string;
    isMock?: boolean;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentDetails: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string; paymentMethod: string }) => void;
  onFailure: (errorMsg: string) => void;
  onClose: () => void;
}

export default function RazorpayModal({
  orderData,
  customerInfo,
  onSuccess,
  onFailure,
  onClose,
}: RazorpayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState(`${customerInfo.phone}@okhdfcbank`);
  const [sdkLoading, setSdkLoading] = useState(!orderData.isMock);

  const amountRupees = (orderData.amountPaise / 100).toFixed(2);

  // When real keys are active (not mock mode), load official Razorpay SDK
  React.useEffect(() => {
    if (!orderData.isMock) {
      setSdkLoading(true);
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && (window as any).Razorpay) {
        setSdkLoading(false);
        openOfficialRazorpay();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setSdkLoading(false);
        openOfficialRazorpay();
      };
      script.onerror = () => {
        setSdkLoading(false);
        alert('Could not load Razorpay gateway. Please check your network connection.');
      };
      document.body.appendChild(script);
    }
  }, [orderData.isMock]);

  const openOfficialRazorpay = () => {
    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      alert('Razorpay SDK is not ready yet. Please try again.');
      return;
    }

    try {
      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: 'INR',
        name: 'MediCare Chronic Health',
        description: `Order Payment for ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          contact: customerInfo.phone || '',
        },
        theme: {
          color: '#0f766e',
        },
        handler: function (response: any) {
          onSuccess({
            razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentMethod: 'ONLINE_RAZORPAY',
          });
        },
        modal: {
          ondismiss: function () {
            onClose();
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (response: any) {
        onFailure(response.error?.description || 'Payment was unsuccessful');
      });
      rzpInstance.open();
    } catch (e: any) {
      console.error('Failed to open Razorpay modal:', e);
      alert('Error opening Razorpay checkout: ' + e.message);
    }
  };

  const handleSimulatedPay = async () => {
    setProcessing(true);
    // Simulate gateway hand-shake
    await new Promise((r) => setTimeout(r, 1200));

    const mockPaymentId = `pay_rzp_${Date.now()}`;
    const mockSignature = `simulated_valid_hmac_signature_${Date.now()}`;

    onSuccess({
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSignature,
      paymentMethod: selectedMethod,
    });
    setProcessing(false);
  };

  const handleSimulatedFailure = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 800));
    setProcessing(false);
    onFailure('Payment declined by issuing bank (Insufficient funds / authentication timeout).');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Razorpay Branded Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center font-black text-xl tracking-tighter">
              R
            </div>
            <div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Razorpay Gateway</div>
              <div className="text-sm font-bold">MediCare Chronic Health</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-500">Order Reference</div>
            <div className="font-bold text-slate-800">{orderData.orderNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500">Total Payable</div>
            <div className="font-black text-base text-slate-900">₹{amountRupees}</div>
          </div>
        </div>

        {/* Payment Content */}
        {!orderData.isMock ? (
          <div className="p-6 text-center space-y-4">
            {sdkLoading ? (
              <div className="py-8 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Connecting to Razorpay Secure Gateway...</p>
                <p className="text-xs text-slate-500">Please wait while the official payment window loads.</p>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Razorpay Payment Window</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    If the official checkout popup did not appear, click the button below to pay ₹{amountRupees}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openOfficialRazorpay}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-teal-700/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Open Payment Gateway (₹{amountRupees})
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Cancel &amp; Return
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Payment Method</div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-semibold ${
                  selectedMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-indigo-600" />
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-semibold ${
                  selectedMethod === 'CARD'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('NETBANKING')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-semibold ${
                  selectedMethod === 'NETBANKING'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Building className="w-5 h-5 text-indigo-600" />
                NetBanking
              </button>
            </div>

            {/* Method Sub-panel */}
            {selectedMethod === 'UPI' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 block">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="name@okhdfcbank"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
                <span className="text-[10px] text-slate-400 block">Simulating prompt on customer phone</span>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-mono text-slate-700 font-bold">•••• •••• •••• 4242</div>
                <div className="text-[11px] text-slate-500">Test Visa / Mastercard (Instant Verification)</div>
              </div>
            )}

            {selectedMethod === 'NETBANKING' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                <div className="font-semibold text-slate-700">Supported Retail Banks</div>
                <div className="text-slate-500 text-[11px]">HDFC Bank, ICICI Bank, SBI, Axis Bank, Kotak Mahindra Bank.</div>
              </div>
            )}

            {/* Primary Pay Action */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulatedPay}
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authorizing Payment with Bank...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Pay ₹{amountRupees} Securely
                  </>
                )}
              </button>

              {/* Test Controls */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Sandbox Test Mode</span>
                <button
                  onClick={handleSimulatedFailure}
                  disabled={processing}
                  className="text-rose-600 hover:underline font-semibold"
                >
                  Simulate Bank Failure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="bg-slate-100 p-3 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PCI-DSS Level 1 Compliant • 256-Bit SSL End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}
