const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const backupFile = path.join(__dirname, '../prisma/data-backup.json');
  if (!fs.existsSync(backupFile)) {
    console.log('No backup file found at', backupFile);
    return;
  }

  const data = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));
  console.log('>>> Importing data into PostgreSQL...');

  // 1. Users
  for (const item of data.users || []) {
    await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Users imported');

  // 2. Categories
  for (const item of data.categories || []) {
    await prisma.category.upsert({
      where: { slug: item.slug },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Categories imported');

  // 3. Subcategories
  for (const item of data.subcategories || []) {
    await prisma.subcategory.upsert({
      where: { slug: item.slug },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Subcategories imported');

  // 4. Manufacturers
  for (const item of data.manufacturers || []) {
    await prisma.manufacturer.upsert({
      where: { name: item.name },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Manufacturers imported');

  // 5. Products
  for (const item of data.products || []) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Products imported');

  // 6. Batches
  for (const item of data.batches || []) {
    await prisma.inventoryBatch.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        manufacturingDate: new Date(item.manufacturingDate),
        expiryDate: new Date(item.expiryDate),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
  console.log('  ✔ Inventory batches imported');

  // 7. Addresses
  for (const item of data.addresses || []) {
    await prisma.address.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Addresses imported');

  // 8. Orders
  for (const item of data.orders || []) {
    await prisma.order.upsert({
      where: { orderNumber: item.orderNumber },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        confirmedAt: item.confirmedAt ? new Date(item.confirmedAt) : null,
        deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : null,
        cancelledAt: item.cancelledAt ? new Date(item.cancelledAt) : null,
      },
    });
  }
  console.log('  ✔ Orders imported');

  // 9. OrderItems
  for (const item of data.orderItems || []) {
    await prisma.orderItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }
  console.log('  ✔ OrderItems imported');

  // 10. Payments
  for (const item of data.payments || []) {
    await prisma.payment.upsert({
      where: { orderId: item.orderId },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        capturedAt: item.capturedAt ? new Date(item.capturedAt) : null,
      },
    });
  }
  console.log('  ✔ Payments imported');

  // 11. Shipments
  for (const item of data.shipments || []) {
    await prisma.shipment.upsert({
      where: { orderId: item.orderId },
      update: {},
      create: {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        shippedAt: item.shippedAt ? new Date(item.shippedAt) : null,
        estimatedDeliveryDate: item.estimatedDeliveryDate ? new Date(item.estimatedDeliveryDate) : null,
        deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : null,
      },
    });
  }
  console.log('  ✔ Shipments imported');

  // 12. Inquiries
  for (const item of data.contactInquiries || []) {
    await prisma.contactInquiry.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
    });
  }
  console.log('  ✔ Contact inquiries imported');

  console.log('>>> All data successfully imported into PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
