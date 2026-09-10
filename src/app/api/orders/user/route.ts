import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('User orders error:', err);
    return NextResponse.json({ error: 'Failed to retrieve order history' }, { status: 500 });
  }
}
