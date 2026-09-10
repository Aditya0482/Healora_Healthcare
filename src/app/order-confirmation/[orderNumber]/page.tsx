import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import OrderTracker from '@/components/OrderTracker';
import { CheckCircle2, Package, ArrowRight, Download } from 'lucide-react';

interface OrderConfirmationPageProps {
  params: { orderNumber: string };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect(`/auth/login?redirect=/order-confirmation/${orderNumber}`);
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      address: true,
      payment: true,
      shipment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const isStaff = ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(currentUser.role);
  if (order.userId !== currentUser.id && !isStaff) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Top Celebration Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Payment Verified via Razorpay</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Order Placed Successfully!</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Order Reference: <strong className="font-mono text-slate-900">{order.orderNumber}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 px-5 rounded-xl transition shadow-md flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Track Order Live
          </Link>
          <Link
            href="/"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-5 rounded-xl transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Visual Live Tracker */}
      <OrderTracker
        orderStatus={order.orderStatus}
        isColdChain={order.isColdChain}
        courierPartner={order.shipment?.courierPartnerName}
        awbNumber={order.shipment?.awbNumber}
        trackingUrl={order.shipment?.trackingUrl}
      />

      {/* Itemized Order Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
          Medicines in this Order
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">{item.productNameSnapshot}</div>
                <div className="text-slate-500 mt-0.5">
                  Salt: {item.genericSaltSnapshot} • {item.strengthSnapshot} ({item.formSnapshot})
                </div>
                <div className="text-slate-400 mt-0.5">Quantity: {item.quantity}</div>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                ₹{(item.totalPrice / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
          <div className="flex items-center justify-between">
            <span>Delivery</span>
            <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${(order.deliveryCharge / 100).toFixed(2)}`}</span>
          </div>
          {order.coldChainFee > 0 && (
            <div className="flex items-center justify-between text-cyan-800">
              <span>Cold Chain Handling</span>
              <span>₹{(order.coldChainFee / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base font-black text-slate-900">
            <span>Paid via {order.payment?.paymentMethod || 'Razorpay'}</span>
            <span>₹{(order.finalPayableAmount / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="font-bold text-slate-800 mb-1">Delivering To:</div>
          <div>{order.address.recipientName} ({order.address.phone})</div>
          <div>{order.address.addressLine1}, {order.address.city}, {order.address.state} - {order.address.pincode}</div>
        </div>
      </div>
    </div>
  );
}
