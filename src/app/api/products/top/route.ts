import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cirrhosisCategory = await prisma.category.findUnique({
      where: { slug: 'cirrhosis-liver-care' },
    });
    const intimateCategory = await prisma.category.findUnique({
      where: { slug: 'intimate-care' },
    });

    const cirrhosisProducts = cirrhosisCategory
      ? await prisma.product.findMany({
          where: { categoryId: cirrhosisCategory.id, isActive: true, isFeatured: true },
          take: 4,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, slug: true, genericSaltName: true, sellingPrice: true },
        })
      : [];

    const intimateProducts = intimateCategory
      ? await prisma.product.findMany({
          where: { categoryId: intimateCategory.id, isActive: true, isFeatured: true },
          take: 4,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, slug: true, genericSaltName: true, sellingPrice: true },
        })
      : [];

    return NextResponse.json({
      cirrhosis: cirrhosisProducts,
      intimate: intimateProducts,
    });
  } catch (err: any) {
    console.error('Top products fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch top products' }, { status: 500 });
  }
}