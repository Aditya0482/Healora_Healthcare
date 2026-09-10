import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment verification parameters' }, { status: 400 });
    }

    // Signature verification
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      console.warn('Invalid payment signature for order', razorpayOrderId);
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment || !payment.order) {
      return NextResponse.json({ error: 'Payment or order record not found' }, { status: 404 });
    }

    // If already captured, return success idempotently
    if (payment.paymentStatus === 'CAPTURED') {
      return NextResponse.json({
        success: true,
        orderNumber: payment.order.orderNumber,
        status: payment.order.orderStatus,
        message: 'Payment already verified.',
      });
    }

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod: paymentMethod || 'ONLINE_UPI_CARD',
        paymentStatus: 'CAPTURED',
        capturedAt: new Date(),
      },
    });

    // Update order status directly to PROCESSING (Order Confirmed)
    const updatedOrder = await prisma.order.update({
      where: { id: payment.order.id },
      data: {
        orderStatus: 'PROCESSING',
        confirmedAt: new Date(),
      },
    });

    // Decrement stock
    for (const item of payment.order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: payment.order.userId,
        actionType: 'PAYMENT_CAPTURED',
        targetEntityType: 'Order',
        targetEntityId: payment.order.id,
        newPayload: JSON.stringify({
          razorpayPaymentId,
          amountPaise: payment.amountPaise,
          status: 'PROCESSING',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      status: 'PROCESSING',
      message: 'Payment verified and order confirmed successfully.',
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 500 });
  }
}
