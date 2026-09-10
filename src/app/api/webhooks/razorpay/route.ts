import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_sec_medicareWebhookSecret123';

    // In production, verify signature
    if (signature && process.env.NODE_ENV === 'production') {
      const isValid = verifyWebhookSignature({ rawBody, signature, webhookSecret });
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    if (eventType === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { order: { include: { items: true } } },
      });

      if (payment && payment.order && payment.paymentStatus !== 'CAPTURED') {
        const nextStatus = 'PROCESSING';

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId,
            paymentStatus: 'CAPTURED',
            paymentMethod: paymentEntity.method?.toUpperCase() || 'UPI',
            capturedAt: new Date(),
          },
        });

        await prisma.order.update({
          where: { id: payment.order.id },
          data: {
            orderStatus: nextStatus,
            confirmedAt: new Date(),
          },
        });

        // Decrement stock
        for (const item of payment.order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    } else if (eventType === 'refund.processed') {
      const refundEntity = payload.refund.entity;
      const razorpayRefundId = refundEntity.id;
      const paymentId = refundEntity.payment_id;

      const refund = await prisma.refund.findFirst({
        where: { razorpayRefundId },
      });

      if (refund) {
        await prisma.refund.update({
          where: { id: refund.id },
          data: {
            refundStatus: 'PROCESSED',
            processedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
