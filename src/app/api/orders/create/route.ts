import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login to complete your order' }, { status: 401 });
    }

    const { items, addressId, customerNotes, paymentMethod = 'COD' } = await req.json();

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

    const deliveryCharge = paymentMethod === 'COD' ? 10000 : 0;
    const finalPayable = calculatedSelling + deliveryCharge;
    const totalDiscount = Math.max(0, calculatedMrp - calculatedSelling);

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

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
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  }
}
