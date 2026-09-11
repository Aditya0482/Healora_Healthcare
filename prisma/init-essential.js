const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('>>> [DB Init] Checking and seeding essential categories, subcategories, and admin...');

  // 1. Ensure Super Admin users exist
  const admins = [
    {
      fullName: 'Aditya Paswan',
      email: 'adityapaswan280@gmail.com',
      phone: '8506803821',
      role: 'SUPER_ADMIN',
    },
    {
      fullName: 'Dr. Rajesh Sharma',
      email: 'admin@medicare.com',
      phone: '9820011223',
      role: 'SUPER_ADMIN',
    },
  ];

  for (const adm of admins) {
    const existing = await prisma.user.findUnique({
      where: { email: adm.email },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash('Password@123', 10);
      await prisma.user.create({
        data: {
          fullName: adm.fullName,
          email: adm.email,
          phone: adm.phone,
          passwordHash,
          role: adm.role,
          isActive: true,
        },
      });
      console.log('  ✔ Super Admin account created:', adm.email);
    } else {
      if (existing.role !== 'SUPER_ADMIN' || !existing.isActive) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: 'SUPER_ADMIN', isActive: true },
        });
      }
      console.log('  ✔ Super Admin account verified:', adm.email);
    }
  }

  // 2. Ensure Manufacturers exist
  const manufacturers = [
    { name: 'Sun Pharmaceutical Industries Ltd.', licenseNumber: 'MH-DRUG-SP-101', countryOfOrigin: 'India' },
    { name: 'Cipla Ltd.', licenseNumber: 'MH-DRUG-CIP-202', countryOfOrigin: 'India' },
    { name: 'Abbott Healthcare Pvt. Ltd.', licenseNumber: 'DL-DRUG-AB-303', countryOfOrigin: 'India' },
    { name: 'Novo Nordisk India Pvt. Ltd.', licenseNumber: 'KA-DRUG-NN-404', countryOfOrigin: 'Denmark / India' },
    { name: 'Sanofi India Ltd.', licenseNumber: 'MH-DRUG-SN-505', countryOfOrigin: 'France / India' },
    { name: 'Lupin Pharmaceuticals Ltd.', licenseNumber: 'MH-DRUG-LP-606', countryOfOrigin: 'India' },
    { name: "Dr. Reddy's Laboratories", licenseNumber: 'TS-DRUG-DR-707', countryOfOrigin: 'India' },
  ];

  for (const m of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
  }
  console.log('  ✔ Manufacturers verified/seeded.');

  // 3. Categories & Subcategories
  const categoriesData = [
    {
      name: 'Diabetes Care',
      slug: 'diabetes-care',
      description: 'Comprehensive chronic therapies, oral hypoglycemics, insulins, and continuous monitoring equipment.',
      displayOrder: 1,
      subcategories: [
        {
          name: 'Oral Hypoglycemics',
          slug: 'oral-hypoglycemics',
          description: 'Metformin, Sulfonylureas, DPP-4 inhibitors, SGLT-2 inhibitors.',
        },
        {
          name: 'Insulins & Cold-Chain Biologics',
          slug: 'insulins-cold-chain',
          description: 'Basal and bolus insulins requiring strict 2°C to 8°C temperature control.',
        },
        {
          name: 'Blood Glucose Monitors & Strips',
          slug: 'monitors-and-strips',
          description: 'Digital glucometers, test strips, lancets, and continuous glucose monitoring sensors.',
        },
        {
          name: 'Diabetic Nutrition & Foot Care',
          slug: 'nutrition-and-footcare',
          description: 'Diabetic-safe nutrition formulations and neuropathy protection.',
        },
      ],
    },
    {
      name: 'Cirrhosis & Liver Care',
      slug: 'cirrhosis-liver-care',
      description: 'Specialized clinical therapies for liver cirrhosis, hepatic encephalopathy, ascites, and portal hypertension.',
      displayOrder: 2,
      subcategories: [
        {
          name: 'Hepatic Encephalopathy Management',
          slug: 'hepatic-encephalopathy',
          description: 'Non-absorbable antibiotics and synthetic disaccharides for ammonia reduction.',
        },
        {
          name: 'Ascites & Fluid Management',
          slug: 'ascites-diuretics',
          description: 'Aldosterone antagonists and loop diuretics for abdominal fluid retention.',
        },
        {
          name: 'Portal Hypertension & Bleed Prevention',
          slug: 'portal-hypertension',
          description: 'Non-selective beta blockers to reduce portal pressure and prevent variceal bleeding.',
        },
        {
          name: 'Hepatoprotective & Bile Acid Therapies',
          slug: 'hepatoprotective-bile-acids',
          description: 'Ursodeoxycholic acid, Silymarin, and amino acid conjugates for liver restoration.',
        },
      ],
    },
    {
      name: 'Intimate Care',
      slug: 'intimate-care',
      description: 'Specialized intimate hygiene, wellness, personal care, and comfort essentials.',
      displayOrder: 3,
      subcategories: [
        {
          name: 'Personal Hygiene',
          slug: 'personal-hygiene',
          description: 'Everyday personal cleanliness and gentle hygiene products.',
        },
        {
          name: 'Sexual Wellness',
          slug: 'sexual-wellness',
          description: 'Wellness, intimacy enhancers, and care lubricants.',
        },
        {
          name: 'Feminine Care',
          slug: 'feminine-care',
          description: 'pH-balanced feminine washes and intimate soothing gels.',
        },
        {
          name: "Men's Wellness",
          slug: 'mens-wellness',
          description: 'Specialized intimate hygiene and vitality products for men.',
        },
      ],
    },
  ];

  for (const catData of categoriesData) {
    const { subcategories, ...catFields } = catData;
    const cat = await prisma.category.upsert({
      where: { slug: catFields.slug },
      update: {
        name: catFields.name,
        description: catFields.description,
        displayOrder: catFields.displayOrder,
        isActive: true,
      },
      create: {
        ...catFields,
        isActive: true,
      },
    });

    for (const sub of subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {
          categoryId: cat.id,
          name: sub.name,
          description: sub.description,
          isActive: true,
        },
        create: {
          categoryId: cat.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          isActive: true,
        },
      });
    }
  }

  console.log('  ✔ Categories & Subcategories verified/seeded (Cirrhosis, Intimate, Diabetes).');
  console.log('>>> [DB Init] Complete! No dummy products were added.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error during DB essential init:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
