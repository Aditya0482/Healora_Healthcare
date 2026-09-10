'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart, CartProduct } from '@/context/CartContext';
import { ShoppingCart, Snowflake, Check } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    genericSaltName: string;
    form: string;
    strength: string;
    packSize: string;
    mrp: number;
    sellingPrice: number;
    stock: number;
    scheduleType: string;
    isColdChain: boolean;
    maxOrderQuantity: number;
    images: string;
    category?: { name: string } | null;
    manufacturer?: { name: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [addedAnim, setAddedAnim] = useState(false);

  let imageUrl = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop';
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
  } catch (e) {
    // fallback
  }

  const existingInCart = items.find((i) => i.product.id === product.id);
  const discountPercent = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
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

    addToCart(cartProd, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col group relative">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
        <div>
          {product.isColdChain && (
            <span className="bg-cyan-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/20">
              <Snowflake className="w-3 h-3" />
              Cold Chain
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="ml-auto">
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md shadow-rose-500/25 flex items-center gap-0.5 border border-white/40 tracking-tight">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/product/${product.slug}`} className="block relative pt-[70%] bg-slate-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <div className="text-[11px] text-teal-700 font-semibold truncate mb-1">
            {product.category?.name || 'Healthcare & Wellness'}
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="text-xs text-slate-400 line-through">
              MRP ₹{(product.mrp / 100).toFixed(2)}
            </div>
            <div className="text-base font-extrabold text-slate-900 leading-none">
              ₹{(product.sellingPrice / 100).toFixed(2)}
            </div>
          </div>

          <div>
            {product.stock > 0 ? (
              <button
                onClick={handleAdd}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                  addedAnim
                    ? 'bg-emerald-600 text-white'
                    : existingInCart
                    ? 'bg-teal-50 text-teal-800 border border-teal-600 hover:bg-teal-100'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                {addedAnim ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Added
                  </>
                ) : existingInCart ? (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    In Cart ({existingInCart.quantity})
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
