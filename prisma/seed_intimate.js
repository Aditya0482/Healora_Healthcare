const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedIntimate() {
  const intimateCat = await prisma.category.findUnique({
    where: { slug: 'intimate-care' },
  });

  if (!intimateCat) {
    console.error('intimate-care category not found');
    return;
  }

  const sunPharma = await prisma.manufacturer.findFirst({ where: { name: { contains: 'Sun' } } });
  const cipla = await prisma.manufacturer.findFirst({ where: { name: { contains: 'Cipla' } } });
  const abbott = await prisma.manufacturer.findFirst({ where: { name: { contains: 'Abbott' } } });
  const drReddys = await prisma.manufacturer.findFirst({ where: { name: { contains: 'Reddy' } } });

  // Subcategories
  const subPersonal = await prisma.subcategory.upsert({
    where: { slug: 'personal-hygiene' },
    update: {},
    create: {
      name: 'Personal Hygiene',
      slug: 'personal-hygiene',
      categoryId: intimateCat.id,
      description: 'Everyday personal cleanliness and gentle hygiene products.',
    },
  });

  const subSexual = await prisma.subcategory.upsert({
    where: { slug: 'sexual-wellness' },
    update: {},
    create: {
      name: 'Sexual Wellness',
      slug: 'sexual-wellness',
      categoryId: intimateCat.id,
      description: 'Wellness, intimacy enhancers, and care lubricants.',
    },
  });

  const subFeminine = await prisma.subcategory.upsert({
    where: { slug: 'feminine-care' },
    update: {},
    create: {
      name: 'Feminine Care',
      slug: 'feminine-care',
      categoryId: intimateCat.id,
      description: 'pH-balanced feminine washes and intimate soothing gels.',
    },
  });

  const subMens = await prisma.subcategory.upsert({
    where: { slug: 'mens-wellness' },
    update: {},
    create: {
      name: "Men's Wellness",
      slug: 'mens-wellness',
      categoryId: intimateCat.id,
      description: 'Specialized intimate hygiene and vitality products for men.',
    },
  });

  const products = [
    {
      sku: 'INT-VWASH-100',
      name: 'V-Wash Plus Expert Intimate Hygiene Wash 100ml',
      slug: 'v-wash-plus-expert-intimate-hygiene-wash-100ml',
      genericSaltName: 'Lactic Acid & Tea Tree Oil (pH 3.5 Formulation)',
      categoryId: intimateCat.id,
      subcategoryId: subFeminine.id,
      manufacturerId: cipla?.id || null,
      form: 'Liquid Wash',
      strength: '100ml',
      packSize: 'Bottle of 100ml',
      mrp: 22000,
      sellingPrice: 18000,
      stock: 250,
      scheduleType: 'OTC',
      isColdChain: false,
      maxOrderQuantity: 5,
      description: 'V-Wash Plus is an expert intimate hygiene wash enriched with tea tree oil and sea buckthorn oil. Its unique lactic acid formulation helps maintain the natural pH balance of 3.5 to prevent irritation, itching, and dryness.',
      medicalUses: 'Daily intimate cleansing and odor prevention.',
      sideEffects: 'None reported when used as directed.',
      contraindications: 'Do not ingest. Discontinue use if allergic rash occurs.',
      storageInstructions: 'Store in a cool, dry place away from direct sunlight.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'INT-PEESAFE-MEN',
      name: 'Pee Safe Natural Intimate Wash for Men 100ml',
      slug: 'pee-safe-natural-intimate-wash-men-100ml',
      genericSaltName: 'Tea Tree Essential Oil & Witch Hazel Extract',
      categoryId: intimateCat.id,
      subcategoryId: subMens.id,
      manufacturerId: drReddys?.id || null,
      form: 'Foam Wash',
      strength: '100ml',
      packSize: 'Foaming Bottle of 100ml',
      mrp: 34900,
      sellingPrice: 28900,
      stock: 180,
      scheduleType: 'OTC',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Specially formulated intimate wash for men crafted with natural tea tree essential oil, witch hazel, and calendula extract to protect against bacterial buildup, chafing, and unpleasant odor.',
      medicalUses: 'Daily male hygiene, anti-chafing, and moisture balance.',
      sideEffects: 'None.',
      contraindications: 'For external use only.',
      storageInstructions: 'Store at room temperature below 30°C.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'INT-DUREX-PLAY',
      name: 'Durex Play Feel Intimate Lubricant Gel 50ml',
      slug: 'durex-play-feel-intimate-lubricant-gel-50ml',
      genericSaltName: 'Water-Based Hypoallergenic Lubricant Solution',
      categoryId: intimateCat.id,
      subcategoryId: subSexual.id,
      manufacturerId: sunPharma?.id || null,
      form: 'Gel',
      strength: '50ml',
      packSize: 'Dispenser Bottle of 50ml',
      mrp: 45000,
      sellingPrice: 38500,
      stock: 150,
      scheduleType: 'OTC',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Durex Play Feel is a light, smooth, water-based lubricant designed to enhance intimate comfort and reduce friction without stains or stickiness.',
      medicalUses: 'Intimate moisture supplement and comfort enhancement.',
      sideEffects: 'None noted.',
      contraindications: 'Not a contraceptive. Does not contain spermicide.',
      storageInstructions: 'Store in a cool dry place away from sunlight. Use within 3 months of opening.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'INT-SEBAMED-38',
      name: 'Sebamed Feminine Intimate Wash pH 3.8 (200ml)',
      slug: 'sebamed-feminine-intimate-wash-ph-38-200ml',
      genericSaltName: 'Alpha Bisabolol & Aloe Barbadensis Leaf Extract',
      categoryId: intimateCat.id,
      subcategoryId: subFeminine.id,
      manufacturerId: abbott?.id || null,
      form: 'Liquid Wash',
      strength: '200ml',
      packSize: 'Bottle of 200ml',
      mrp: 71000,
      sellingPrice: 62000,
      stock: 120,
      scheduleType: 'OTC',
      isColdChain: false,
      maxOrderQuantity: 3,
      description: 'Dermatologist-recommended clinical feminine intimate wash formulated at exact pH 3.8 to support the natural microflora balance and protect against pathogenic microorganisms.',
      medicalUses: 'Gentle cleansing and barrier protection for sensitive intimate skin.',
      sideEffects: 'None.',
      contraindications: 'Avoid contact with eyes.',
      storageInstructions: 'Store below 25°C.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const created = await prisma.product.create({ data: prod });
      await prisma.inventoryBatch.create({
        data: {
          productId: created.id,
          batchNumber: `BT-${Math.floor(100000 + Math.random() * 900000)}`,
          manufacturingDate: new Date('2026-02-01'),
          expiryDate: new Date('2028-08-31'),
          quantityOnHand: created.stock,
          quantityAllocated: 0,
          quantityAvailable: created.stock,
          costPrice: Math.round(created.sellingPrice * 0.7),
        },
      });
      console.log('Created product:', created.name);
    } else {
      console.log('Product already exists:', prod.name);
    }
  }

  console.log('Done seeding intimate products!');
}

seedIntimate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
