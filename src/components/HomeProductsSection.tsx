'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ChevronDown, ChevronUp, Sparkles, PackageOpen } from 'lucide-react';

interface Product {
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
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  manufacturer?: { name: string } | null;
}

interface HomeProductsSectionProps {
  initialProducts: Product[];
}

export default function HomeProductsSection({ initialProducts }: HomeProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'cirrhosis-liver-care' | 'diabetes-care' | 'intimate-care'
  >('all');
  const [showAll, setShowAll] = useState(false);

  const filteredProducts = initialProducts.filter((product) => {
    if (selectedCategory === 'all') return true;
    return product.category?.slug === selectedCategory;
  });

  const INITIAL_COUNT = 8;
  const displayedProducts = showAll ? filteredProducts : filteredProducts.slice(0, INITIAL_COUNT);
  const hasMore = filteredProducts.length > INITIAL_COUNT;

  return (
    <section id="products-section" className="max-w-7xl mx-auto px-3 sm:px-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4 border-b border-slate-200 pb-5 sm:pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Specialized Health &amp; Wellness
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
          Shop a wide range of trusted healthcare and wellness products, thoughtfully selected for quality, convenience, and your everyday needs.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setShowAll(false);
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-teal-700 text-white shadow-teal-700/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Products ({initialProducts.length})
          </button>
          <button
            onClick={() => {
              setSelectedCategory('cirrhosis-liver-care');
              setShowAll(false);
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-sm ${
              selectedCategory === 'cirrhosis-liver-care'
                ? 'bg-amber-600 text-white shadow-amber-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cirrhosis &amp; Liver Care
          </button>
          <button
            onClick={() => {
              setSelectedCategory('diabetes-care');
              setShowAll(false);
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-sm ${
              selectedCategory === 'diabetes-care'
                ? 'bg-blue-600 text-white shadow-blue-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Diabetes Care
          </button>
          <button
            onClick={() => {
              setSelectedCategory('intimate-care');
              setShowAll(false);
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-sm ${
              selectedCategory === 'intimate-care'
                ? 'bg-rose-600 text-white shadow-rose-600/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Intimate Care
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-dashed border-slate-300 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {selectedCategory === 'all'
              ? 'No Products Available in Store'
              : selectedCategory === 'cirrhosis-liver-care'
              ? 'No Cirrhosis & Liver Care Products Available'
              : selectedCategory === 'intimate-care'
              ? 'No Intimate Care Products Available'
              : 'No Products Found in this Category'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            There are currently no products listed in this section. New products will be added and updated soon. Please check back later!
          </p>
        </div>
      )}

      {/* View All / Show Less CTA */}
      {hasMore && (
        <div className="mt-10 flex flex-col items-center justify-center gap-3">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-teal-700/20 hover:shadow-xl transition-all duration-200 text-sm"
          >
            {showAll ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                View All Products ({filteredProducts.length})
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-500">
            {showAll
              ? `Showing all ${filteredProducts.length} products`
              : `Showing ${INITIAL_COUNT} of ${filteredProducts.length} products`}
          </p>
        </div>
      )}
    </section>
  );
}
