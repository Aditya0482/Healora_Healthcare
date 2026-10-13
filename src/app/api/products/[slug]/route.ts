import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        manufacturer: true,
        batches: {
          where: { quantityAvailable: { gt: 0 } },
          select: {
            batchNumber: true,
            expiryDate: true,
            quantityAvailable: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Find clinically related substitutes with similar generic salt name
    const substitutes = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        isActive: true,
        OR: [
          { genericSaltName: { contains: product.genericSaltName.split(' ')[0] } },
          { categoryId: product.categoryId },
        ],
      },
      take: 4,
      include: {
        category: { select: { name: true } },
        manufacturer: { select: { name: true } },
      },
    });

    return NextResponse.json({ product, substitutes });
  } catch (err: any) {
    console.error('Product details error:', err);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}
