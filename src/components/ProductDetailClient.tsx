'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  Building2,
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
  // Keep only valid, non-empty, unique images uploaded by admin
  imageList = Array.from(new Set(imageList.map((s) => String(s).trim()).filter(Boolean)));
  if (imageList.length === 0) {
    imageList = ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'];
  }

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const nextImage = () => {
    setSelectedImgIdx((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setSelectedImgIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextImage();
    } else if (diff < -45) {
      prevImage();
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, imageList.length]);

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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Image Column */}
          <div className="lg:col-span-5 space-y-3">
            <div
              className="relative pt-[85%] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner group select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Clickable Image -> Opens Fullscreen */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="absolute inset-0 cursor-zoom-in flex items-center justify-center"
                title="Click to view full image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageList[selectedImgIdx] || imageList[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 sm:p-6 transition-all duration-300"
                />
              </div>

              {/* Status Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1.5 z-20 pointer-events-none">
                <span className="bg-teal-700 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Genuine Product
                </span>

                {product.isColdChain && (
                  <span className="bg-cyan-100 border border-cyan-200 text-cyan-800 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Snowflake className="w-3.5 h-3.5" />
                    Cold Chain (2°C - 8°C)
                  </span>
                )}
              </div>

              {/* Full Image / Zoom Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 hover:bg-white text-slate-700 hover:text-teal-700 p-1.5 sm:p-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 text-xs font-bold transition hover:scale-105 active:scale-95 z-20 cursor-pointer"
                title="View Fullscreen Image"
              >
                <ZoomIn className="w-4 h-4 text-teal-700" />
                <span className="hidden sm:inline text-[11px]">Full Image</span>
              </button>

              {/* Slider Arrows (Left & Right) */}
              {imageList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-teal-700 shadow-lg border border-slate-200 flex items-center justify-center transition hover:scale-110 active:scale-95 z-20 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-teal-700 shadow-lg border border-slate-200 flex items-center justify-center transition hover:scale-110 active:scale-95 z-20 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}

              {/* Image Counter Pill */}
              {imageList.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 pointer-events-none">
                  {selectedImgIdx + 1} / {imageList.length}
                </div>
              )}

              {/* Dots Indicator */}
              {imageList.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                  {imageList.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImgIdx(i);
                      }}
                      className={`transition-all duration-200 rounded-full cursor-pointer ${
                        selectedImgIdx === i
                          ? 'w-5 h-1.5 bg-teal-700'
                          : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Multiple Thumbnails Row */}
            {imageList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar touch-pan-x">
                {imageList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImgIdx(i)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 overflow-hidden bg-white p-1 transition flex-shrink-0 cursor-pointer ${
                      selectedImgIdx === i
                        ? 'border-teal-700 shadow-md scale-105 ring-2 ring-teal-700/20'
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
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div>
              {product.category?.name && (
                <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                  {product.category.name}
                </div>
              )}

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight break-words">
                {product.name}
              </h1>

              {/* Manufacturer Information Badge */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
                <span>
                  Manufactured by: <strong className="text-slate-900 font-bold">{product.manufacturer?.name || 'Healora HealthCare Pvt. Ltd.'}</strong>
                </span>
              </div>

              {product.description && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xl sm:text-3xl font-black text-slate-900">
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

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                  {product.stock > 0 ? '● In Stock' : '● Out of Stock'}
                </span>
                <div className="text-[11px] text-slate-500 mt-1">
                  Max {product.maxOrderQuantity} units per order
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="flex items-center justify-between sm:justify-start border border-slate-300 rounded-xl bg-white overflow-hidden w-full sm:w-auto">
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

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Control Bar */}
          <div
            className="flex items-center justify-between text-white pb-3 border-b border-white/10 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base text-white line-clamp-1">
                {product.name}
              </span>
              <span className="bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Photo {selectedImgIdx + 1} of {imageList.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Close Fullscreen (Esc)"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          {/* Center Main High-Res Image Viewport */}
          <div
            className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Previous Floating Button */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-1 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-13 sm:h-13 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition hover:scale-110 active:scale-95 z-30 cursor-pointer shadow-2xl"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageList[selectedImgIdx]}
              alt={`${product.name} full view`}
              className="max-h-[65vh] sm:max-h-[72vh] max-w-[92vw] sm:max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-200"
            />

            {/* Next Floating Button */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-1 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-13 sm:h-13 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition hover:scale-110 active:scale-95 z-30 cursor-pointer shadow-2xl"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {imageList.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 sm:gap-3 py-2 overflow-x-auto z-10 no-scrollbar touch-pan-x"
              onClick={(e) => e.stopPropagation()}
            >
              {imageList.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImgIdx(i)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition p-1 bg-black/50 flex-shrink-0 cursor-pointer ${
                    selectedImgIdx === i
                      ? 'border-teal-400 scale-105 ring-2 ring-teal-400/40 shadow-lg'
                      : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
