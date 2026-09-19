'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Snowflake,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    totalMrpAmount,
    totalSellingAmount,
    totalDiscountAmount,
    deliveryCharge,
    coldChainFee,
    finalPayableAmount,
    hasColdChainItem,
  } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/cart');
    }
  }, [user, authLoading, router]);

  const handleCheckoutClick = () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        <p className="text-xs text-slate-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have not buy any products to your cart yet.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/category/diabetes-care"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition"
            >
              Browse Products
            </Link>
            <Link
              href="/category/cirrhosis-liver-care"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition"
            >
              Browse Cirrhosis &amp; Intimate Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in your medicine bag
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">

          {/* Cold Chain Notice */}
          {hasColdChainItem && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex items-start gap-3">
              <Snowflake className="w-5 h-5 text-cyan-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-cyan-900 leading-relaxed">
                <strong className="font-bold">Cold Chain (2°C - 8°C) Activated:</strong> Your order contains refrigerated biologicals (e.g. Insulin). A specialized insulated cooler box with thermal gel packs will be included for delivery.
              </div>
            </div>
          )}

          {/* Items Card List */}
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
            {items.map(({ product, quantity }) => {
              let imageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop';
              try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
              } catch (e) {
                // fallback
              }

              return (
                <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <Link href={`/product/${product.slug}`} className="text-sm font-bold text-slate-900 hover:text-teal-700 transition line-clamp-1">
                        {product.name}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Salt: <span className="font-medium text-slate-700">{product.genericSaltName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{product.packSize} • {product.strength}</span>
                        {product.isColdChain && (
                          <span className="text-[10px] text-cyan-700 font-bold bg-cyan-100 px-1.5 py-0.2 rounded">
                            Cold Chain
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Pricing */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <div className="text-sm font-extrabold text-slate-900">
                        ₹{((product.sellingPrice * quantity) / 100).toFixed(2)}
                      </div>
                      <div
                        className="text-[11px] text-red-600 line-through decoration-red-600 font-semibold"
                        style={{ color: '#dc2626' }}
                      >
                        MRP ₹{((product.mrp * quantity) / 100).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Financial Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total MRP</span>
                <span>₹{(totalMrpAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span>Discounted Savings</span>
                <span>- ₹{(totalDiscountAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Medicine Subtotal</span>
                <span className="font-bold text-slate-800">₹{(totalSellingAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="text-emerald-700 font-bold">
                  FREE (Online) / ₹100 (COD)
                </span>
              </div>
              {hasColdChainItem && (
                <div className="flex items-center justify-between text-cyan-800">
                  <span>Cold-Chain Packaging Fee</span>
                  <span>₹{(coldChainFee / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Total Payable</div>
                <div className="text-[10px] text-slate-400">Taxes included</div>
              </div>
              <div className="text-xl font-black text-slate-900">
                ₹{(finalPayableAmount / 100).toFixed(2)}
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
