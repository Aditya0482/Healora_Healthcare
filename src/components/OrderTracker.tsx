import React from 'react';
import { CheckCircle2, Package, Truck, Home, XCircle } from 'lucide-react';

interface OrderTrackerProps {
  orderStatus: string;
  isColdChain?: boolean;
  courierPartner?: string | null;
  awbNumber?: string | null;
  trackingUrl?: string | null;
}

export default function OrderTracker({
  orderStatus,
  isColdChain,
  courierPartner,
  awbNumber,
  trackingUrl,
}: OrderTrackerProps) {
  // Handle Cancellation or Refund
  if (orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900">
        <div className="flex items-center gap-2 font-bold text-sm">
          <XCircle className="w-5 h-5 text-rose-600" />
          Order Cancelled {orderStatus === 'REFUNDED' ? '& 100% Refund Completed' : ''}
        </div>
        <p className="text-xs text-rose-700 mt-1">
          This order was cancelled. Any processed payment has been refunded to your original payment method.
        </p>
      </div>
    );
  }

  // Define standard steps
  const steps = [
    {
      key: 'CONFIRMED',
      label: orderStatus === 'PENDING_PAYMENT' ? 'Payment Pending' : 'Order Confirmed',
      icon: CheckCircle2,
      detail: orderStatus === 'PENDING_PAYMENT' ? 'Awaiting payment completion' : 'Payment verified & order placed',
    },
    {
      key: 'PROCESSING',
      label: 'Packed & Prepared',
      icon: Package,
      detail: 'Quality check & parcel packaging',
    },
    {
      key: 'SHIPPED',
      label: 'Dispatched / In Transit',
      icon: Truck,
      detail: awbNumber ? `${courierPartner || 'Courier'}: AWB ${awbNumber}` : 'Handed over to delivery courier',
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      icon: Home,
      detail: 'Delivered to your address',
    },
  ];

  // Determine active step index
  let activeIndex = 0;
  if (orderStatus === 'PENDING_PAYMENT' || orderStatus === 'PAYMENT_CONFIRMED') activeIndex = 0;
  if (orderStatus === 'PROCESSING' || orderStatus === 'PACKED') activeIndex = 1;
  if (orderStatus === 'SHIPPED' || orderStatus === 'OUT_FOR_DELIVERY') activeIndex = 2;
  if (orderStatus === 'DELIVERED') activeIndex = 3;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center justify-between">
        <span>Order Tracking &amp; Delivery Status</span>
        {isColdChain && (
          <span className="text-[11px] bg-cyan-100 text-cyan-800 font-semibold px-2 py-0.5 rounded-full">
            Cold-Chain Transit
          </span>
        )}
      </h3>

      <div className="relative">
        {/* Progress Line for Desktop */}
        <div className="hidden md:block absolute top-5 left-12 right-12 h-1 bg-slate-200 -translate-y-1/2 z-0">
          <div
            className="h-full bg-teal-600 transition-all duration-500 rounded"
            style={{
              width: `${(activeIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 text-center relative">
                {/* Mobile vertical line connecting steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={`md:hidden absolute left-5 top-10 w-0.5 h-10 -ml-px ${
                      idx < activeIndex ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  />
                )}

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ring-4 ring-white ${
                    isCompleted
                      ? 'bg-teal-700 text-white shadow-teal-700/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="text-left md:text-center flex-1">
                  <div
                    className={`text-xs font-bold ${
                      isCurrent ? 'text-teal-800 font-extrabold' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.detail && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
