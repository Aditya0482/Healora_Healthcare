import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import MetaSearchTracker from '@/components/MetaSearchTracker';
import { Search, AlertCircle } from 'lucide-react';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() || '';

  const products = query
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { genericSaltName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { medicalUses: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { manufacturer: true },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {query && <MetaSearchTracker query={query} />}
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              {query ? `Search Results for "${query}"` : 'Medicine Search'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Found {products.length} verified products across Cirrhosis & Intimate categories.
            </p>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We could not find any products matching &quot;{query}&quot;. Try searching by this (e.g. <em>Cirrhosis,Diabetes</em>) or browse our other products.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
            <Link
              href="/search?q=LivoCare"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full transition"
            >
              Liver Care
            </Link>
            <Link
              href="/search?q=LiverVeda"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full transition"
            >
             Health Care
            </Link>
            <Link
              href="/search?q=Purusham"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full transition"
            >
             Personal Hygiene
            </Link>
            <Link
              href="/search?q=Aayumaan"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full transition"
            >
            Intimate Wellness
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
