const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!admin) {
    console.error('❌ Super Admin user nahi mila!');
    return;
  }

  console.log('Safe Admin Account:', admin.fullName, `(${admin.email})`);

  // 1. Delete test orders & child tables
  const deletedRefunds = await prisma.refund.deleteMany();
  const deletedPayments = await prisma.payment.deleteMany();
  const deletedShipments = await prisma.shipment.deleteMany();
  const deletedOrderItems = await prisma.orderItem.deleteMany();
  const deletedOrders = await prisma.order.deleteMany();

  // 2. Delete test audit logs
  const deletedLogs = await prisma.auditLog.deleteMany();

  // 3. Delete all customer addresses (keep only admin address if any)
  const deletedAddresses = await prisma.address.deleteMany({
    where: { userId: { not: admin.id } }
  });

  // 4. Delete all non-admin users (customers)
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: { not: 'SUPER_ADMIN' } }
  });

  // 5. Delete all products & batches (as requested: start completely fresh from admin panel)
  const deletedBatches = await prisma.inventoryBatch.deleteMany();
  const deletedProducts = await prisma.product.deleteMany();

  console.log('\n================ DATABASE CLEANUP COMPLETE ================');
  console.log(`✅ Deleted Orders:            ${deletedOrders.count}`);
  console.log(`✅ Deleted Payments:          ${deletedPayments.count}`);
  console.log(`✅ Deleted Shipments:         ${deletedShipments.count}`);
  console.log(`✅ Deleted Audit Logs:        ${deletedLogs.count}`);
  console.log(`✅ Deleted Customer Addresses:${deletedAddresses.count}`);
  console.log(`✅ Deleted Customer Users:    ${deletedUsers.count}`);
  console.log(`✅ Deleted Inventory Batches: ${deletedBatches.count}`);
  console.log(`✅ Deleted Products:          ${deletedProducts.count}`);
  console.log('===========================================================');

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, role: true }
  });
  console.log('\nDatabase me sirf yeh Admin user bache hain:');
  remainingUsers.forEach(u => {
    console.log(`- ${u.fullName} | Email: ${u.email} | Role: ${u.role}`);
  });
}

cleanData()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
