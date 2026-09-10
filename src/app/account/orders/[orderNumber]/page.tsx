import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import OrderTracker from '@/components/OrderTracker';
import RetryPaymentButton from '@/components/RetryPaymentButton';
import { ArrowLeft, Download, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

interface OrderDetailPageProps {
  params: { orderNumber: string };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect(`/auth/login?redirect=/account/orders/${orderNumber}`);
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      address: true,
      payment: true,
      shipment: true,
      refunds: true,
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // IDOR Protection: Only the order owner or staff can view details
  const isStaff = ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(currentUser.role);
  if (order.userId !== currentUser.id && !isStaff) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <span className="text-xs text-slate-500">Order Number</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{order.orderNumber}</h1>
        </div>
        <div className="text-sm font-bold text-slate-700">
          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Pending Payment Alert & Pay Now */}
      {order.orderStatus === 'PENDING_PAYMENT' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              Payment Incomplete for this Order
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Your payment was not completed. Click &quot;Pay Now&quot; to finish your payment securely. Once verified, your order will immediately move to Processing.
            </p>
          </div>
          <RetryPaymentButton
            orderNumber={order.orderNumber}
            customerInfo={{
              name: order.user?.fullName || order.address?.recipientName || 'Customer',
              email: order.user?.email || '',
              phone: order.user?.phone || order.address?.phone || '',
            }}
          />
        </div>
      )}

      {/* Live Tracker */}
      <OrderTracker
        orderStatus={order.orderStatus}
        isColdChain={order.isColdChain}
        courierPartner={order.shipment?.courierPartnerName}
        awbNumber={order.shipment?.awbNumber}
        trackingUrl={order.shipment?.trackingUrl}
      />

      {/* Itemized Order Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
          Product &amp; Quantities
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{item.productNameSnapshot}</div>
                <div className="text-slate-500">Salt: {item.genericSaltSnapshot}</div>
                <div className="text-slate-400">
                  Form: {item.formSnapshot} • Strength: {item.strengthSnapshot} • Qty: {item.quantity}
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900">
                ₹{(item.totalPrice / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 max-w-xs ml-auto">
          <div className="flex items-center justify-between">
            <span>Delivery</span>
            <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${(order.deliveryCharge / 100).toFixed(2)}`}</span>
          </div>
          {order.coldChainFee > 0 && (
            <div className="flex items-center justify-between text-cyan-800">
              <span>Cold Chain Packaging</span>
              <span>₹{(order.coldChainFee / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base font-black text-slate-900">
            <span>{order.orderStatus === 'PENDING_PAYMENT' ? 'Amount Due' : 'Total Paid'}</span>
            <span>₹{(order.finalPayableAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            Shipping Destination:
          </div>
          <div>{order.address.recipientName} ({order.address.phone})</div>
          <div>{order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.pincode}</div>
        </div>
      </div>
    </div>
  );
}
