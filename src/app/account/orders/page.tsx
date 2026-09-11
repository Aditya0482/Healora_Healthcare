'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Package, ArrowRight, Clock, ShieldCheck, Loader2, CheckCircle2, Settings, User } from 'lucide-react';
import RetryPaymentButton from '@/components/RetryPaymentButton';
import ReceiptActionButtons from '@/components/ReceiptActionButtons';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/account/orders');
      return;
    }

    if (user) {
      fetch('/api/orders/user')
        .then((res) => res.json())
        .then((data) => {
          setOrders(data.orders || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">My Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">Track current and past orders</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div>
                    <div className="text-xs text-slate-500">Order Placed on {dateStr}</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : order.orderStatus === 'PENDING_PAYMENT'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {order.orderStatus === 'PENDING_PAYMENT' ? 'Pending Payment' : order.orderStatus.replace(/_/g, ' ')}
                    </span>
                    {order.orderStatus === 'PENDING_PAYMENT' && user && (
                      <RetryPaymentButton
                        orderNumber={order.orderNumber}
                        customerInfo={{
                          name: user.fullName || 'Customer',
                          email: user.email || '',
                          phone: user.phone || '',
                        }}
                        variant="compact"
                        onSuccess={() => {
                          setOrders((prev) =>
                            prev.map((o) =>
                              o.id === order.id ? { ...o, orderStatus: 'PROCESSING' } : o
                            )
                          );
                        }}
                      />
                    )}
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
                      >
                        View Details &amp; Track →
                      </Link>
                      {order.orderStatus !== 'PENDING_PAYMENT' && (
                        <ReceiptActionButtons order={order} variant="compact" />
                      )}
                    </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{item.productNameSnapshot}</span>
                        <span className="text-slate-500 ml-2">({item.strengthSnapshot})</span>
                        <span className="text-slate-400 ml-2">Qty: {item.quantity}</span>
                      </div>
                      <div className="font-bold text-slate-900">₹{(item.totalPrice / 100).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {order.orderStatus === 'CANCELLED' ? (
                      <span className="bg-rose-50 text-rose-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-rose-200">
                        Order Cancelled
                      </span>
                    ) : order.orderStatus === 'PENDING_PAYMENT' ? (
                      <span className="bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Payment Incomplete — Click &quot;Pay Now&quot; to confirm &amp; dispatch
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Order Confirmed
                      </span>
                    )}
                    {order.isColdChain && (
                      <span className="bg-cyan-50 text-cyan-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-cyan-200">
                        Cold-Chain Handled
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Total: ₹{(order.finalPayableAmount / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500">
            Browse our cirrhosis & Intimate products and place your first order.
          </p>
          <Link
            href="/"
            className="inline-block mt-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition"
          >
            Start Browsing
          </Link>
        </div>
      )}
    </div>
  );
}
