const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('>>> Verifying PostgreSQL connection and data...');
  const users = await prisma.user.count();
  const categories = await prisma.category.count();
  const subcategories = await prisma.subcategory.count();
  const manufacturers = await prisma.manufacturer.count();
  const products = await prisma.product.count();

  console.log('Verification Results:');
  console.log('  Users:', users);
  console.log('  Categories:', categories);
  console.log('  Subcategories:', subcategories);
  console.log('  Manufacturers:', manufacturers);
  console.log('  Products:', products);

  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    select: { email: true, fullName: true, role: true },
  });
  console.log('  Super Admin:', admin);
  console.log('>>> [SUCCESS] PostgreSQL is 100% working and verified!');
}

main()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
