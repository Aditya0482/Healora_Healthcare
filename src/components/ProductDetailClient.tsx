'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, CartProduct } from '@/context/CartContext';
import {
  Snowflake,
  Check,
  ShoppingCart,
  Plus,
  Minus,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: any;
  substitutes: any[];
}

export default function ProductDetailClient({ product, substitutes }: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  let imageList: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed)) imageList = parsed.filter(Boolean);
    else if (typeof parsed === 'string') imageList = [parsed];
  } catch (e) {
    if (product.images) imageList = [product.images];
  }
  if (imageList.length === 0) {
    imageList = ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'];
  }

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const existingInCart = items.find((i) => i.product.id === product.id);
  const discountPercent = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  const handleAddToCart = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/product/${product.slug}`)}`);
      return;
    }
    if (product.stock <= 0) return;

    const cartProd: CartProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      genericSaltName: product.genericSaltName,
      strength: product.strength,
      form: product.form,
      packSize: product.packSize,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      scheduleType: product.scheduleType,
      isColdChain: product.isColdChain,
      maxOrderQuantity: product.maxOrderQuantity,
      images: product.images,
    };

    addToCart(cartProd, quantity);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  return (
    <div className="space-y-12">
      {/* Top Product Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Product Image Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative pt-[85%] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageList[selectedImgIdx] || imageList[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain p-6 transition-all duration-200"
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-teal-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Genuine Product
                </span>

                {product.isColdChain && (
                  <span className="bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Snowflake className="w-3.5 h-3.5" />
                    Cold Chain (2°C - 8°C)
                  </span>
                )}
              </div>
            </div>

            {/* Multiple Thumbnails Row */}
            {imageList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {imageList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImgIdx(i)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-white p-1 transition flex-shrink-0 ${
                      selectedImgIdx === i
                        ? 'border-teal-700 shadow-md scale-105'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Cold Chain Notice Banner */}
            {product.isColdChain && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3.5 text-xs text-cyan-900 flex items-start gap-2.5">
                <Snowflake className="w-4 h-4 text-cyan-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Temperature Sensitive Storage:</strong> Must be maintained between 2°C and 8°C. This medicine will be shipped in an insulated cold box with certified ice packs.
                </div>
              </div>
            )}
          </div>

          {/* Product Purchasing Info Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              {product.category?.name && (
                <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                  {product.category.name}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{(product.sellingPrice / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    MRP ₹{(product.mrp / 100).toFixed(2)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Inclusive of all applicable GST taxes</div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {product.stock > 0 ? '● In Stock' : '● Out of Stock'}
                </span>
                <div className="text-[11px] text-slate-500 mt-1">
                  Max {product.maxOrderQuantity} units per order
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden self-start">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.maxOrderQuantity, product.stock, quantity + 1))}
                    className="p-3 text-slate-600 hover:bg-slate-100 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition shadow-md ${
                    addedAnim
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
                  }`}
                >
                  {addedAnim ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added {quantity} to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart (₹{((product.sellingPrice * quantity) / 100).toFixed(2)})
                    </>
                  )}
                </button>

                <Link
                  href="/cart"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      router.push('/auth/login?redirect=/cart');
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3.5 px-5 rounded-xl text-center transition"
                >
                  View Cart
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-xl text-center text-xs font-semibold text-slate-500">
                Currently Out of Stock at warehouse. Restocking in progress.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details & Full Description */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info className="w-4 h-4 text-teal-700" />
              Product Details &amp; Overview
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description || 'No additional description provided for this product.'}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Related Products */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Related Products
            </h3>

            {substitutes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {substitutes.map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/product/${sub.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-teal-700 transition line-clamp-1"
                      >
                        {sub.name}
                      </Link>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        ₹{(sub.sellingPrice / 100).toFixed(2)}
                      </div>
                      <Link
                        href={`/product/${sub.slug}`}
                        className="text-[10px] text-teal-700 hover:underline font-semibold"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No other products in this category.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
