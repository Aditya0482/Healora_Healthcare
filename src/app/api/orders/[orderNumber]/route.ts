import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderNumber } = params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        address: true,
        items: {
          include: {
            product: {
              select: {
                slug: true,
                images: true,
              },
            },
          },
        },
        payment: true,
        shipment: true,
        refunds: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ensure only the owner or staff can view
    const isStaff = ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(user.role);
    if (order.userId !== user.id && !isStaff) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('Order fetch error:', err);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}
