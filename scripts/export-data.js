const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('>>> Exporting data from SQLite...');
  const data = {};

  const models = [
    { key: 'users', client: prisma.user },
    { key: 'addresses', client: prisma.address },
    { key: 'categories', client: prisma.category },
    { key: 'subcategories', client: prisma.subcategory },
    { key: 'manufacturers', client: prisma.manufacturer },
    { key: 'products', client: prisma.product },
    { key: 'batches', client: prisma.inventoryBatch },
    { key: 'orders', client: prisma.order },
    { key: 'orderItems', client: prisma.orderItem },
    { key: 'payments', client: prisma.payment },
    { key: 'refunds', client: prisma.refund },
    { key: 'shipments', client: prisma.shipment },
    { key: 'auditLogs', client: prisma.auditLog },
    { key: 'contactInquiries', client: prisma.contactInquiry },
  ];

  for (const m of models) {
    if (m.client && typeof m.client.findMany === 'function') {
      data[m.key] = await m.client.findMany();
      console.log(`  ✔ Exported ${data[m.key].length} ${m.key}`);
    } else {
      data[m.key] = [];
      console.log(`  ⚠ Skipped ${m.key} (not defined)`);
    }
  }

  const outPath = path.join(__dirname, '../prisma/data-backup.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`>>> Exported successfully to ${outPath}!`);
}

main()
  .catch((e) => {
    console.error('Export error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
