import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { AlertCircle, PackageOpen } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">HEALTH &amp; WELLNESS ESSENTIALS</div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 break-words">{category.name}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{category.description}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-xl px-3 sm:px-4 py-3 text-xs mb-6 gap-3">
        <span className="font-semibold text-slate-600">Showing <strong className="text-slate-900">{products.length}</strong> products</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <div className="flex items-center gap-1 font-semibold">
            <Link href={`/category/${category.slug}?sort=price_asc`} className={`px-2 py-1 rounded hover:bg-slate-100 ${sort === 'price_asc' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-600'}`}>Price: Low to High</Link>
            <Link href={`/category/${category.slug}?sort=price_desc`} className={`px-2 py-1 rounded hover:bg-slate-100 ${sort === 'price_desc' ? 'text-teal-700 font-bold bg-teal-50' : 'text-slate-600'}`}>Price: High to Low</Link>
          </div>
        </div>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (<ProductCard key={p.id} product={p} />))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 sm:p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm my-6 sm:my-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
            <PackageOpen className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900">No {category.name} Products Available Yet</div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            There are currently no products listed under this category. New products will be added soon. Please check back later!
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/" className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-sm">
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}