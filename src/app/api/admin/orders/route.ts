import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { triggerRazorpayRefund } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { fullName: { contains: search } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, phone: true, email: true } },
        address: true,
        items: true,
        payment: true,
        shipment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('Admin orders API error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { orderId, newStatus, courierPartner, awbNumber, trackingUrl, cancellationReason } = await req.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Order ID and new status are required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = { orderStatus: newStatus };

    if (newStatus === 'SHIPPED') {
      const courier = courierPartner || 'Standard Express Delivery';
      const awb = awbNumber || `TRK-${Date.now().toString().slice(-8)}`;

      await prisma.shipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          courierPartnerName: courier,
          awbNumber: awb,
          trackingUrl: trackingUrl || `https://track.courier.in/${awb}`,
          isTemperatureControlled: order.isColdChain,
          shippedAt: new Date(),
        },
        update: {
          courierPartnerName: courier,
          awbNumber: awb,
          trackingUrl: trackingUrl || `https://track.courier.in/${awb}`,
          shippedAt: new Date(),
        },
      });
    } else if (newStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (newStatus === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason || 'Cancelled by admin';

      // Restore inventory on cancellation
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // If online paid, trigger simulated refund
      if (order.payment && order.payment.paymentStatus === 'CAPTURED' && order.payment.razorpayPaymentId) {
        await triggerRazorpayRefund({
          paymentId: order.payment.razorpayPaymentId,
          amountPaise: order.payment.amountPaise,
        });

        await prisma.payment.update({
          where: { id: order.payment.id },
          data: { paymentStatus: 'REFUNDED' },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'ORDER_STATUS_UPDATED',
        targetEntityType: 'Order',
        targetEntityId: order.id,
        oldPayload: JSON.stringify({ status: order.orderStatus }),
        newPayload: JSON.stringify({ status: newStatus, awbNumber }),
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Admin order update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
