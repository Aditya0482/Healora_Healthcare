import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createRazorpayOrder, RAZORPAY_PUBLIC_KEY } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to complete your order' }, { status: 401 });
    }

    const { items, addressId, customerNotes, paymentMethod = 'ONLINE' } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Please select a delivery address' }, { status: 400 });
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!address) {
      return NextResponse.json({ error: 'Delivery address not found' }, { status: 404 });
    }

    // Fetch live product details from DB
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { error: 'One or more products in your cart are currently unavailable.' },
        { status: 400 }
      );
    }

    let calculatedMrp = 0;
    let calculatedSelling = 0;
    const validatedOrderItems: any[] = [];

    for (const item of items) {
      const p = dbProducts.find((dbP) => dbP.id === item.productId);
      if (!p) continue;

      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${p.name}. Only ${p.stock} available.` },
          { status: 400 }
        );
      }

      const lineSelling = p.sellingPrice * item.quantity;
      const lineMrp = p.mrp * item.quantity;

      calculatedSelling += lineSelling;
      calculatedMrp += lineMrp;

      validatedOrderItems.push({
        productId: p.id,
        productNameSnapshot: p.name,
        genericSaltSnapshot: p.genericSaltName,
        strengthSnapshot: p.strength,
        formSnapshot: p.form,
        unitPricePaid: p.sellingPrice,
        quantity: item.quantity,
        totalPrice: lineSelling,
      });
    }

    // Delivery fee rule: Free delivery for ONLINE payment, ₹100 (10,000 paise) for Cash on Delivery (COD)
    const deliveryCharge = paymentMethod === 'COD' ? 10000 : 0;
    const finalPayable = calculatedSelling + deliveryCharge;
    const totalDiscount = Math.max(0, calculatedMrp - calculatedSelling);

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // If CASH ON DELIVERY (COD)
    if (paymentMethod === 'COD') {
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          addressId: address.id,
          orderStatus: 'PROCESSING',
          totalMrpAmount: calculatedMrp,
          totalDiscountAmount: totalDiscount,
          deliveryCharge,
          finalPayableAmount: finalPayable,
          customerNotes: customerNotes || 'Cash on Delivery',
          confirmedAt: new Date(),
          items: {
            create: validatedOrderItems,
          },
          payment: {
            create: {
              razorpayOrderId: `COD-${orderNumber}-${Date.now().toString().slice(-4)}`,
              paymentMethod: 'COD',
              paymentStatus: 'PENDING_ON_DELIVERY',
              amountPaise: finalPayable,
            },
          },
        },
      });

      // Atomically decrement stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return NextResponse.json({
        success: true,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        isCod: true,
      });
    }

    // ONLINE PAYMENT (Razorpay / Instant Sandbox Modal)
    const razorpayRes = await createRazorpayOrder({
      amountPaise: finalPayable,
      receipt: orderNumber,
      notes: {
        userId: user.id,
        userEmail: user.email,
      },
    });

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: address.id,
        orderStatus: 'PENDING_PAYMENT',
        totalMrpAmount: calculatedMrp,
        totalDiscountAmount: totalDiscount,
        deliveryCharge,
        finalPayableAmount: finalPayable,
        customerNotes: customerNotes || null,
        items: {
          create: validatedOrderItems,
        },
        payment: {
          create: {
            razorpayOrderId: razorpayRes.id,
            paymentMethod: 'ONLINE',
            paymentStatus: 'INITIATED',
            amountPaise: finalPayable,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      razorpayOrderId: razorpayRes.id,
      amountPaise: finalPayable,
      keyId: RAZORPAY_PUBLIC_KEY,
      isMock: Boolean((razorpayRes as any).isMock),
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  }
}
