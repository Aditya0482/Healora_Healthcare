'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2 } from 'lucide-react';
import RazorpayModal from '@/components/RazorpayModal';

interface RetryPaymentButtonProps {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  variant?: 'primary' | 'compact';
  onSuccess?: () => void;
}

export default function RetryPaymentButton({
  orderNumber,
  customerInfo,
  variant = 'primary',
  onSuccess,
}: RetryPaymentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeRazorpayOrder, setActiveRazorpayOrder] = useState<any | null>(null);

  const handleInitiateRetry = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/retry-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment retry');
      }

      setActiveRazorpayOrder({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        razorpayOrderId: data.razorpayOrderId,
        amountPaise: data.amountPaise,
        keyId: data.keyId,
        isMock: data.isMock,
      });
    } catch (err: any) {
      alert(err.message || 'Unable to re-attempt payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      const res = await fetch('/api/orders/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails),
      });

      const data = await res.json();
      if (res.ok) {
        setActiveRazorpayOrder(null);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/account/orders');
        }
      } else {
        alert(data.error || 'Payment verification failed');
      }
    } catch (e: any) {
      alert('Network error verifying payment. Our team will verify and update your order.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInitiateRetry}
        disabled={loading}
        className={
          variant === 'compact'
            ? 'bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm disabled:opacity-50'
            : 'bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50'
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <CreditCard className="w-3.5 h-3.5" />
            Pay Now
          </>
        )}
      </button>

      {activeRazorpayOrder && (
        <RazorpayModal
          orderData={activeRazorpayOrder}
          customerInfo={customerInfo}
          onSuccess={handlePaymentSuccess}
          onFailure={(errMsg) => alert(errMsg || 'Payment was unsuccessful')}
          onClose={() => setActiveRazorpayOrder(null)}
        />
      )}
    </>
  );
}
