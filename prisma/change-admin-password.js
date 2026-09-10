const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.argv[2];

  if (!newPassword || newPassword.length < 6) {
    console.log('\n❌ ERROR: Kripya naya password provide karein (kam se kam 6 characters).');
    console.log('Usage example:');
    console.log('   node prisma/change-admin-password.js MyNewPass@2026\n');
    process.exit(1);
  }

  // Find super admin
  const admin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!admin) {
    console.log('❌ Koi Super Admin user nahi mila.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  console.log('\n======================================================');
  console.log('✅ Admin Password Safalta-purvak Change Ho Gaya!');
  console.log('======================================================');
  console.log(`👤 Admin Email:    ${admin.email}`);
  console.log(`📱 Admin Phone:    ${admin.phone}`);
  console.log(`🔑 New Password:   ${newPassword}`);
  console.log('======================================================');
  console.log('Ab aap http://localhost:3000/auth/login par jakar naye password se login kar sakte hain.\n');
}

main()
  .catch((e) => {
    console.error('Error changing password:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
