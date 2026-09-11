import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date).toISOString().replace('T', ' ').slice(0, 19);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'products';
    const today = new Date().toISOString().slice(0, 10);

    // 1. EXPORT PRODUCTS AS EXCEL CSV
    if (type === 'products') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          manufacturer: true,
        },
      });

      const headers = [
        'ID',
        'Product Name',
        'SKU',
        'Slug',
        'Category',
        'Subcategory',
        'Manufacturer',
        'Generic Salt Name',
        'Form',
        'Strength',
        'Pack Size',
        'MRP (INR)',
        'Selling Price (INR)',
        'Discount (%)',
        'Stock Quantity',
        'Schedule Type',
        'Is Cold Chain',
        'Is Top Product',
        'Is Active',
        'Primary Image URL',
        'Medical Uses',
        'Description',
        'Created At',
      ];

      const rows = products.map((p) => {
        const mrpInRupees = (p.mrp / 100).toFixed(2);
        const sellingPriceInRupees = (p.sellingPrice / 100).toFixed(2);
        const discountPercent = p.mrp > 0 ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0;

        let primaryImage = '';
        try {
          const imgs = JSON.parse(p.images || '[]');
          if (Array.isArray(imgs) && imgs.length > 0) primaryImage = imgs[0];
        } catch {
          primaryImage = p.images || '';
        }

        return [
          escapeCsv(p.id),
          escapeCsv(p.name),
          escapeCsv(p.sku),
          escapeCsv(p.slug),
          escapeCsv(p.category?.name || 'Unassigned'),
          escapeCsv(p.subcategory?.name || 'N/A'),
          escapeCsv(p.manufacturer?.name || 'Healora HealthCare'),
          escapeCsv(p.genericSaltName),
          escapeCsv(p.form),
          escapeCsv(p.strength),
          escapeCsv(p.packSize),
          escapeCsv(mrpInRupees),
          escapeCsv(sellingPriceInRupees),
          escapeCsv(discountPercent),
          escapeCsv(p.stock),
          escapeCsv(p.scheduleType),
          escapeCsv(p.isColdChain ? 'Yes' : 'No'),
          escapeCsv(p.isFeatured ? 'Yes' : 'No'),
          escapeCsv(p.isActive ? 'Active' : 'Hidden'),
          escapeCsv(primaryImage),
          escapeCsv(p.medicalUses),
          escapeCsv(p.description),
          escapeCsv(formatDate(p.createdAt)),
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Healora_Products_${today}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // 2. EXPORT ORDERS AS EXCEL CSV
    if (type === 'orders') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          address: true,
          items: true,
          payment: true,
        },
      });

      const headers = [
        'Order Number',
        'Date Placed',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Shipping City',
        'Shipping State',
        'Shipping Pincode',
        'Shipping Address',
        'Total Items',
        'Items Summary',
        'Total MRP (INR)',
        'Discount (INR)',
        'Delivery Charge (INR)',
        'Final Payable (INR)',
        'Order Status',
        'Payment Status',
        'Payment Method',
      ];

      const rows = orders.map((o) => {
        const itemsSummary = o.items.map((it) => `${it.productNameSnapshot} (Qty: ${it.quantity})`).join('; ');

        return [
          escapeCsv(o.orderNumber),
          escapeCsv(formatDate(o.createdAt)),
          escapeCsv(o.address?.recipientName || o.user?.fullName || 'N/A'),
          escapeCsv(o.user?.email || 'N/A'),
          escapeCsv(o.address?.phone || o.user?.phone || 'N/A'),
          escapeCsv(o.address?.city || 'N/A'),
          escapeCsv(o.address?.state || 'N/A'),
          escapeCsv(o.address?.pincode || 'N/A'),
          escapeCsv(`${o.address?.addressLine1 || ''} ${o.address?.addressLine2 || ''}`.trim()),
          escapeCsv(o.items.length),
          escapeCsv(itemsSummary),
          escapeCsv((o.totalMrpAmount / 100).toFixed(2)),
          escapeCsv((o.totalDiscountAmount / 100).toFixed(2)),
          escapeCsv((o.deliveryCharge / 100).toFixed(2)),
          escapeCsv((o.finalPayableAmount / 100).toFixed(2)),
          escapeCsv(o.orderStatus),
          escapeCsv(o.payment?.paymentStatus || 'UNPAID'),
          escapeCsv(o.payment?.paymentMethod || 'N/A'),
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Healora_Orders_${today}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // 3. EXPORT USERS / CUSTOMERS AS EXCEL CSV
    if (type === 'users') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      });

      const headers = [
        'User ID',
        'Full Name',
        'Email',
        'Phone',
        'Role',
        'Total Orders Placed',
        'Saved Addresses Count',
        'Account Status',
        'Joined Date',
      ];

      const rows = users.map((u) => [
        escapeCsv(u.id),
        escapeCsv(u.fullName),
        escapeCsv(u.email),
        escapeCsv(u.phone),
        escapeCsv(u.role),
        escapeCsv(u._count.orders),
        escapeCsv(u._count.addresses),
        escapeCsv(u.isActive ? 'Active' : 'Disabled'),
        escapeCsv(formatDate(u.createdAt)),
      ].join(','));

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Healora_Users_${today}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // 4. EXPORT CONTACT INQUIRIES AS EXCEL CSV
    if (type === 'inquiries') {
      const inquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const headers = [
        'Inquiry ID',
        'Date Received',
        'Name',
        'Email',
        'Phone',
        'Subject',
        'Message',
        'Status',
      ];

      const rows = inquiries.map((iq) => [
        escapeCsv(iq.id),
        escapeCsv(formatDate(iq.createdAt)),
        escapeCsv(iq.name),
        escapeCsv(iq.email),
        escapeCsv(iq.phone),
        escapeCsv(iq.subject || 'General Inquiry'),
        escapeCsv(iq.message),
        escapeCsv(iq.status),
      ].join(','));

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Healora_Inquiries_${today}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // 5. EXPORT COMPLETE DATABASE BACKUP AS JSON
    if (type === 'json' || type === 'backup') {
      const [categories, subcategories, manufacturers, products, orders, users, inquiries] = await Promise.all([
        prisma.category.findMany(),
        prisma.subcategory.findMany(),
        prisma.manufacturer.findMany(),
        prisma.product.findMany(),
        prisma.order.findMany({ include: { items: true, payment: true } }),
        prisma.user.findMany({ select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true } }),
        prisma.contactInquiry.findMany(),
      ]);

      const backupData = {
        meta: {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          totalProducts: products.length,
          totalOrders: orders.length,
          totalUsers: users.length,
        },
        categories,
        subcategories,
        manufacturers,
        products,
        orders,
        users,
        inquiries,
      };

      return new Response(JSON.stringify(backupData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="Healora_Full_Database_Backup_${today}.json"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type specified' }, { status: 400 });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Failed to generate export file' }, { status: 500 });
  }
}
