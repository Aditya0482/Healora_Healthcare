import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { AlertCircle } from 'lucide-react';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { sort?: string };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const { sort } = searchParams;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const where: any = { categoryId: category.id, isActive: true };
  let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
  if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
  if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
  if (sort === 'name_asc') orderBy = { name: 'asc' };

  const products = await prisma.product.findMany({ where, orderBy, include: { manufacturer: true } });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Therapeutic Catalog</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{category.name}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{category.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs mb-6">
        <span className="font-semibold text-slate-600">Showing <strong className="text-slate-900">{products.length}</strong> products</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <div className="flex items-center gap-1 font-semibold">
            <Link href={`/category/${category.slug}?sort=price_asc`} className={`px-2 py-1 rounded hover:bg-slate-100 ${sort === 'price_asc' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-600'}`}>Price: Low to High</Link>
            <Link href={`/category/${category.slug}?sort=price_desc`} className={`px-2 py-1 rounded hover:bg-slate-100 ${sort === 'price_desc' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-600'}`}>Price: High to Low</Link>
          </div>
        </div>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-800">No products in this category yet</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Check back soon.</p>
          <Link href="/" className="inline-block mt-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition">Back to Home</Link>
        </div>
      )}
    </div>
  );
}