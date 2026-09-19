'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import * as fpixel from '@/lib/fpixel';
import RazorpayModal from '@/components/RazorpayModal';
import {
  MapPin,
  ShieldCheck,
  Check,
  Plus,
  AlertCircle,
  Loader2,
  Lock,
  CreditCard,
  Banknote,
  Truck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    clearCart,
    totalItemsCount,
    totalMrpAmount,
    totalSellingAmount,
    totalDiscountAmount,
    deliveryCharge,
    finalPayableAmount,
  } = useCart();

  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address form
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress1, setNewAddress1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');

  // Payment method selection ('ONLINE' | 'COD')
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Razorpay Modal state
  const [activeRazorpayOrder, setActiveRazorpayOrder] = useState<any | null>(null);

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/checkout');
    }
    if (!authLoading && items.length === 0 && !activeRazorpayOrder) {
      router.push('/cart');
    }
  }, [user, authLoading, items, router, activeRazorpayOrder]);

  // Track Meta Pixel InitiateCheckout
  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (!checkoutTrackedRef.current && items.length > 0) {
      try {
        fpixel.event('InitiateCheckout', {
          num_items: totalItemsCount,
          content_ids: items.map((i) => i.product.id),
          content_type: 'product',
          value: finalPayableAmount / 100,
          currency: 'INR',
        });
        checkoutTrackedRef.current = true;
      } catch {
        // ignore tracking errors
      }
    }
  }, [items, totalItemsCount, finalPayableAmount]);

  // Load user addresses
  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      try {
        const addrRes = await fetch('/api/addresses');
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          const list = addrData.addresses || [];
          setAddresses(list);
          if (list.length > 0) {
            const def = list.find((a: any) => a.isDefault) || list[0];
            setSelectedAddressId(def.id);
          } else {
            setShowNewAddressForm(true);
            setNewRecipientName(user.fullName || '');
            setNewPhone(user.phone || '');
          }
        }
      } catch (e) {
        console.error('Error fetching addresses:', e);
      }
    };

    fetchAddresses();
  }, [user]);

  // Handle Save New Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPhone = (newPhone || user?.phone || '').trim().replace(/[^0-9]/g, '');
    if (!targetPhone || targetPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number for delivery contact.');
      return;
    }

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: newRecipientName || user?.fullName,
          phone: targetPhone,
          addressLine1: newAddress1,
          city: newCity,
          state: newState,
          pincode: newPincode,
          isDefault: addresses.length === 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses([data.address, ...addresses]);
        setSelectedAddressId(data.address.id);
        setShowNewAddressForm(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save address');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving address');
    }
  };

  // Trigger Order Creation & Payment
  const handlePlaceOrder = async () => {
    setErrorMessage('');
    if (!selectedAddressId) {
      setErrorMessage('Please select or add a delivery address.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          addressId: selectedAddressId,
          customerNotes,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // If CASH ON DELIVERY: Order is placed immediately!
      if (data.isCod) {
        clearCart();
        router.push(`/order-confirmation/${data.orderNumber}`);
        return;
      }

      // If ONLINE PAYMENT: Open Razorpay simulation modal
      setActiveRazorpayOrder({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        razorpayOrderId: data.razorpayOrderId,
        amountPaise: data.amountPaise,
        keyId: data.keyId,
        isMock: data.isMock,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to complete order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Callback on Razorpay Online Payment Success
  const handlePaymentSuccess = async (paymentDetails: any) => {
    try {
      const res = await fetch('/api/orders/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        router.push('/account/orders');
      } else {
        alert(data.error || 'Payment verification failed');
      }
    } catch (e: any) {
      alert('Network error verifying payment. Our team will verify and update your order.');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-teal-700" />
          Checkout &amp; Place Order
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your delivery address, choose your payment mode, and place your order.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Address & Payment selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. DELIVERY ADDRESS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-extrabold text-slate-900">Delivery Address</h2>
              </div>
              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Address
                </button>
              )}
            </div>

            {/* Saved Address Cards */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-teal-700 bg-teal-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs">
                          {addr.recipientName}
                        </span>
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="w-4 h-4 text-teal-700 focus:ring-teal-700"
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-2">
                      Phone: {addr.phone}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            {showNewAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs"
              >
                <div className="font-bold text-slate-800 text-xs mb-2">Enter Shipping Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Recipient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rajesh Kumar"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Street Address / House No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No, Street name, Area"
                    value={newAddress1}
                    onChange={(e) => setNewAddress1(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pincode <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="6-digit pincode"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-teal-700"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded-xl transition"
                  >
                    Save &amp; Deliver Here
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-slate-500 hover:text-slate-700 font-semibold px-3 py-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* 2. PAYMENT METHOD SELECTION */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-extrabold text-slate-900">Select Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Online Payment */}
              <label
                className={`border-2 rounded-2xl p-4 cursor-pointer transition flex items-start gap-3.5 ${
                  paymentMethod === 'ONLINE'
                    ? 'border-teal-700 bg-teal-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="w-4 h-4 text-teal-700 mt-1 focus:ring-teal-700"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-teal-700" />
                      <span className="font-extrabold text-slate-900 text-xs">
                        Online Payment (UPI, Card, NetBanking)
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      FREE Delivery
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Instant &amp; secure payment. Fast-track order processing with zero delivery charge.
                  </p>
                </div>
              </label>

              {/* Option B: Cash on Delivery */}
              <label
                className={`border-2 rounded-2xl p-4 cursor-pointer transition flex items-start gap-3.5 ${
                  paymentMethod === 'COD'
                    ? 'border-teal-700 bg-teal-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-teal-700 mt-1 focus:ring-teal-700"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span className="font-extrabold text-slate-900 text-xs">
                        Cash on Delivery (Pay on Delivery)
                      </span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      +₹100 COD Fee
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Pay with cash or UPI when your parcel arrives. (₹100 COD delivery charge applies).
                  </p>
                </div>
              </label>
            </div>

            {/* Optional Delivery instructions */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Leave with security, call before arrival..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-teal-700"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Action */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary ({totalItemsCount} items)
            </h2>

            {/* Item list snapshot */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="truncate">
                    <div className="font-bold text-slate-800 truncate">{item.product.name}</div>
                    <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-slate-900 whitespace-nowrap">
                    ₹{((item.product.sellingPrice * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            {(() => {
              const currentDeliveryFee = paymentMethod === 'COD' ? 10000 : 0; // 10000 paise = ₹100
              const currentPayable = totalSellingAmount + currentDeliveryFee;

              return (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total MRP:</span>
                      <span className="line-through">₹{(totalMrpAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Price Discount:</span>
                      <span>- ₹{(totalDiscountAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Charges:</span>
                      <span>
                        {currentDeliveryFee === 0 ? (
                          <span className="text-emerald-700 font-bold">FREE (Online)</span>
                        ) : (
                          <span className="text-slate-900 font-bold">₹100.00 (COD)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Final Amount */}
                  <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-600">Total Payable</span>
                      <div className="text-[10px] text-slate-400">Inclusive of all taxes</div>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      ₹{(currentPayable / 100).toFixed(2)}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submittingOrder || !selectedAddressId}
              className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                submittingOrder || !selectedAddressId
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
              }`}
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Order...
                </>
              ) : paymentMethod === 'COD' ? (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Cash on Delivery Order
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ₹{(finalPayableAmount / 100).toFixed(2)} Securely
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              100% Genuine Medicines • Safe Checkout
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY PAYMENT MODAL */}
      {activeRazorpayOrder && user && (
        <RazorpayModal
          orderData={activeRazorpayOrder}
          customerInfo={{
            name: user.fullName,
            email: user.email,
            phone: user.phone,
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={(errMsg) => alert(errMsg || 'Payment was unsuccessful')}
          onClose={() => setActiveRazorpayOrder(null)}
        />
      )}
    </div>
  );
}
