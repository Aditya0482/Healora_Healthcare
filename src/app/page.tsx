import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import HomeProductsSection from '@/components/HomeProductsSection';
import {
  ShieldCheck,
  Snowflake,
  Upload,
  HeartPulse,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  FileCheck2,
  ShoppingCart,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getHomeProducts() {
  try {
    const [diabetesProducts, cirrhosisProducts, intimateProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          category: { slug: 'diabetes-care' },
          isActive: true,
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: { manufacturer: true, category: true },
      }),
      prisma.product.findMany({
        where: {
          category: { slug: 'cirrhosis-liver-care' },
          isActive: true,
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: { manufacturer: true, category: true },
      }),
      prisma.product.findMany({
        where: {
          category: { slug: 'intimate-care' },
          isActive: true,
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: { manufacturer: true, category: true },
      }),
    ]);

    // Interleave cirrhosis, intimate, and diabetes products so the top 8 is a balanced mix
    const combined = [];
    const maxLen = Math.max(cirrhosisProducts.length, intimateProducts.length, diabetesProducts.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < cirrhosisProducts.length) combined.push(cirrhosisProducts[i]);
      if (i < intimateProducts.length) combined.push(intimateProducts[i]);
      if (i < diabetesProducts.length) combined.push(diabetesProducts[i]);
    }

    return combined;
  } catch (err: any) {
    console.warn('Could not fetch home products:', err?.message);
    return [];
  }
}

export default async function HomePage() {
  const products = await getHomeProducts();

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-teal-900 via-teal-950 to-slate-900 text-white pt-10 sm:pt-16 pb-16 sm:pb-24 px-3 sm:px-4 overflow-hidden w-full">
        {/* Subtle background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-[700px] h-[250px] sm:h-[350px] bg-teal-500/20 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-teal-800/60 border border-teal-600/40 rounded-full px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs text-teal-300 font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Specialized Health &amp; Wellness Store
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight break-words">
                Ayurvedic &amp; wellness for <br className="hidden sm:inline" />
                <span className="text-teal-400">Cirrhosis</span> &amp; <span className="text-cyan-400">Intimate</span> Care.
              </h1>

              <p className="text-slate-300 text-xs sm:text-base max-w-xl leading-relaxed">
                Explore our specialized range of Cirrhosis Care and Intimate Wellness products, thoughtfully selected to support your everyday health, comfort, and personal well-being. 
                Shop trusted products with convenience, privacy, and care.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <Link
                  href="/category/cirrhosis-liver-care"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 text-center"
                >
                  <HeartPulse className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span>Explore Cirrhosis Products</span>
                </Link>
                <Link
                  href="/category/intimate-care"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 text-center"
                >
                  <Sparkles className="w-4 h-4 text-rose-200 flex-shrink-0" />
                  <span>Explore Intimate Products</span>
                </Link>
                <Link
                  href="/cart"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-center"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-950 flex-shrink-0" />
                  <span>View Your Cart</span>
                </Link>
              </div>

              {/* Assurance Bullets */}
              <div className="pt-5 sm:pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>Quality Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Easy Ordering</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Secure Payments</span>
                </div>
              </div>
            </div>

            {/* Hero Quick Card Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-6 shadow-2xl text-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-300">How It Works</div>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">3 Simple Steps</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-white">Browse & Choose Products</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">Explore products and select what you need.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-white">Order Online</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">Add to cart and complete your purchase securely.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-white">Delivered to You</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">Get your order conveniently delivered to your doorstep.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    Your Order <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Specialized Products (Both Categories, 8 initially, View All on click) */}
      <HomeProductsSection initialProducts={products} />

      {/* 4. Cold-Chain Logistics Assurance Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-r from-sky-900 to-teal-900 rounded-2xl text-white p-5 sm:p-8 md:p-10 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 sm:space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-sky-500/30 text-sky-200 text-xs font-bold px-3 py-1 rounded-full border border-sky-400/30">
              <Snowflake className="w-3.5 h-3.5 text-sky-300" />
              Trusted Shopping Experience
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Shop Genuine Health &amp; Wellness Products
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              We carefully select and securely pack every product to ensure you receive quality healthcare and wellness products in perfect condition.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-300" />
                <span>Safe Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-300" />
                <span>Quick Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
