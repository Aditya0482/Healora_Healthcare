import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const subcategorySlug = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const coldChain = searchParams.get('cold_chain');
    const sort = searchParams.get('sort') || 'featured';

    const where: any = { isActive: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (subcategorySlug) {
      where.subcategory = { slug: subcategorySlug };
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { genericSaltName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { medicalUses: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (coldChain === 'true') {
      where.isColdChain = true;
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { sellingPrice: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: { select: { name: true, slug: true } },
        subcategory: { select: { name: true, slug: true } },
        manufacturer: { select: { name: true } },
      },
    });

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error('Products API error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
