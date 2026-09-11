const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: 'intimate-care' },
    update: {
      name: 'Intimate Care',
      description: 'Specialized intimate hygiene, wellness, personal care, and comfort essentials.',
      isActive: true,
      displayOrder: 3,
    },
    create: {
      name: 'Intimate Care',
      slug: 'intimate-care',
      description: 'Specialized intimate hygiene, wellness, personal care, and comfort essentials.',
      isActive: true,
      displayOrder: 3,
    },
  });

  console.log('Category created:', cat.name, `(${cat.slug})`);

  const subs = [
    { name: 'Personal Hygiene', slug: 'personal-hygiene', description: 'Everyday personal cleanliness and gentle hygiene products.' },
    { name: 'Sexual Wellness', slug: 'sexual-wellness', description: 'Wellness, intimacy enhancers, and care lubricants.' },
    { name: 'Feminine Care', slug: 'feminine-care', description: 'pH-balanced feminine washes and intimate soothing gels.' },
    { name: "Men's Wellness", slug: 'mens-wellness', description: 'Specialized intimate hygiene and vitality products for men.' }
  ];

  for (const s of subs) {
    await prisma.subcategory.upsert({
      where: { slug: s.slug },
      update: { categoryId: cat.id, name: s.name, description: s.description, isActive: true },
      create: { categoryId: cat.id, name: s.name, slug: s.slug, description: s.description, isActive: true }
    });
  }

  const allCats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  });
  console.log('All DB Categories now:', allCats);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
