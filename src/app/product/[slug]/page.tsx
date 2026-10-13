import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from '@/components/ProductDetailClient';
import MetaViewContentTracker from '@/components/MetaViewContentTracker';

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      manufacturer: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Find substitutes with matching/similar salt
  const substitutes = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      isActive: true,
      categoryId: product.categoryId,
    },
    take: 4,
    include: { manufacturer: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <MetaViewContentTracker
        id={product.id}
        name={product.name}
        category={product.category?.name}
        price={product.sellingPrice / 100}
      />
      <ProductDetailClient product={product} substitutes={substitutes} />
    </div>
  );
}
