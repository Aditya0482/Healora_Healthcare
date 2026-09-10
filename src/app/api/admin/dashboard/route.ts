import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const [
      totalOrders,
      processingCount,
      deliveredCount,
      lowStockProducts,
      recentOrders,
      revenueResult,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'PROCESSING' } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.product.findMany({
        where: { stock: { lte: 50 }, isActive: true },
        select: { id: true, name: true, stock: true, genericSaltName: true },
        take: 10,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, phone: true } },
          items: true,
          payment: true,
        },
      }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'CAPTURED' },
        _sum: { amountPaise: true },
      }),
    ]);

    const totalRevenuePaise = revenueResult._sum.amountPaise || 0;

    return NextResponse.json({
      metrics: {
        totalRevenuePaise,
        totalRevenueRupees: totalRevenuePaise / 100,
        totalOrders,
        processingCount,
        deliveredCount,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
    });
  } catch (err: any) {
    console.error('Admin dashboard error:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
