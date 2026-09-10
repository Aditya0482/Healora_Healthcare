import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createRazorpayOrder, RAZORPAY_PUBLIC_KEY } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to continue' }, { status: 401 });
    }

    const { orderNumber } = await req.json();
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId: user.id,
      },
      include: {
        payment: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.orderStatus !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: `This order is currently in ${order.orderStatus} status and cannot be paid again.` },
        { status: 400 }
      );
    }

    // Generate fresh Razorpay order for this retry
    const razorpayRes = await createRazorpayOrder({
      amountPaise: order.finalPayableAmount,
      receipt: order.orderNumber,
      notes: {
        userId: user.id,
        userEmail: user.email,
        retry: 'true',
      },
    });

    // Update payment record with new razorpayOrderId
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          razorpayOrderId: razorpayRes.id,
          paymentStatus: 'INITIATED',
          amountPaise: order.finalPayableAmount,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          razorpayOrderId: razorpayRes.id,
          paymentMethod: 'ONLINE',
          paymentStatus: 'INITIATED',
          amountPaise: order.finalPayableAmount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayRes.id,
      amountPaise: order.finalPayableAmount,
      keyId: RAZORPAY_PUBLIC_KEY,
      isMock: Boolean((razorpayRes as any).isMock),
    });
  } catch (err: any) {
    console.error('Retry payment error:', err);
    return NextResponse.json({ error: err.message || 'Failed to re-initiate payment' }, { status: 500 });
  }
}
