const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production-grade clinical database for Diabetes & Cirrhosis care...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
    await prisma.inventoryBatch.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.create({
    data: {
      fullName: 'Dr. Rajesh Sharma',
      email: 'admin@medicare.com',
      phone: '9820011223',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      fullName: 'Anil Kumar Verma',
      email: 'patient@example.com',
      phone: '9876543210',
      passwordHash,
      role: 'CUSTOMER',
    },
  });


  // Customer Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: customer.id,
      recipientName: 'Anil Kumar Verma',
      phone: '9876543210',
      addressLine1: 'Flat 402, Shanti Heights, 14th Cross',
      addressLine2: 'Indiranagar 2nd Stage',
      landmark: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      addressType: 'Home',
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: customer.id,
      recipientName: 'Vimla Verma (Mother)',
      phone: '9876543211',
      addressLine1: 'B-12, Green Park Extension',
      landmark: 'Opposite Community Center',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      addressType: 'Patient Home',
      isDefault: false,
    },
  });

  // 2. Create Manufacturers
  const sunPharma = await prisma.manufacturer.create({
    data: { name: 'Sun Pharmaceutical Industries Ltd.', licenseNumber: 'MH-DRUG-SP-101', countryOfOrigin: 'India' },
  });
  const cipla = await prisma.manufacturer.create({
    data: { name: 'Cipla Ltd.', licenseNumber: 'MH-DRUG-CIP-202', countryOfOrigin: 'India' },
  });
  const abbott = await prisma.manufacturer.create({
    data: { name: 'Abbott Healthcare Pvt. Ltd.', licenseNumber: 'DL-DRUG-AB-303', countryOfOrigin: 'India' },
  });
  const novoNordisk = await prisma.manufacturer.create({
    data: { name: 'Novo Nordisk India Pvt. Ltd.', licenseNumber: 'KA-DRUG-NN-404', countryOfOrigin: 'Denmark / India' },
  });
  const sanofi = await prisma.manufacturer.create({
    data: { name: 'Sanofi India Ltd.', licenseNumber: 'MH-DRUG-SN-505', countryOfOrigin: 'France / India' },
  });
  const lupin = await prisma.manufacturer.create({
    data: { name: 'Lupin Pharmaceuticals Ltd.', licenseNumber: 'MH-DRUG-LP-606', countryOfOrigin: 'India' },
  });
  const drReddys = await prisma.manufacturer.create({
    data: { name: "Dr. Reddy's Laboratories", licenseNumber: 'TS-DRUG-DR-707', countryOfOrigin: 'India' },
  });

  // 3. Create Categories & Subcategories
  const diabetesCat = await prisma.category.create({
    data: {
      name: 'Diabetes Care',
      slug: 'diabetes-care',
      description: 'Comprehensive chronic therapies, oral hypoglycemics, insulins, and continuous monitoring equipment.',
      displayOrder: 1,
    },
  });

  const subcatOral = await prisma.subcategory.create({
    data: {
      categoryId: diabetesCat.id,
      name: 'Oral Hypoglycemics',
      slug: 'oral-hypoglycemics',
      description: 'Metformin, Sulfonylureas, DPP-4 inhibitors, SGLT-2 inhibitors.',
    },
  });

  const subcatInsulin = await prisma.subcategory.create({
    data: {
      categoryId: diabetesCat.id,
      name: 'Insulins & Cold-Chain Biologics',
      slug: 'insulins-cold-chain',
      description: 'Basal and bolus insulins requiring strict 2°C to 8°C temperature control.',
    },
  });

  const subcatMonitors = await prisma.subcategory.create({
    data: {
      categoryId: diabetesCat.id,
      name: 'Blood Glucose Monitors & Strips',
      slug: 'monitors-and-strips',
      description: 'Digital glucometers, test strips, lancets, and continuous glucose monitoring sensors.',
    },
  });

  const subcatDiabNutrition = await prisma.subcategory.create({
    data: {
      categoryId: diabetesCat.id,
      name: 'Diabetic Nutrition & Foot Care',
      slug: 'nutrition-and-footcare',
      description: 'Diabetic-safe nutrition formulations and neuropathy protection.',
    },
  });

  const cirrhosisCat = await prisma.category.create({
    data: {
      name: 'Cirrhosis & Liver Care',
      slug: 'cirrhosis-liver-care',
      description: 'Specialized clinical therapies for liver cirrhosis, hepatic encephalopathy, ascites, and portal hypertension.',
      displayOrder: 2,
    },
  });

  const subcatEncephalopathy = await prisma.subcategory.create({
    data: {
      categoryId: cirrhosisCat.id,
      name: 'Hepatic Encephalopathy Management',
      slug: 'hepatic-encephalopathy',
      description: 'Non-absorbable antibiotics and synthetic disaccharides for ammonia reduction.',
    },
  });

  const subcatDiuretics = await prisma.subcategory.create({
    data: {
      categoryId: cirrhosisCat.id,
      name: 'Ascites & Fluid Management',
      slug: 'ascites-diuretics',
      description: 'Aldosterone antagonists and loop diuretics for abdominal fluid retention.',
    },
  });

  const subcatBetaBlockers = await prisma.subcategory.create({
    data: {
      categoryId: cirrhosisCat.id,
      name: 'Portal Hypertension & Bleed Prevention',
      slug: 'portal-hypertension',
      description: 'Non-selective beta blockers to reduce portal pressure and prevent variceal bleeding.',
    },
  });

  const subcatHepatoprotective = await prisma.subcategory.create({
    data: {
      categoryId: cirrhosisCat.id,
      name: 'Hepatoprotective & Bile Acid Therapies',
      slug: 'hepatoprotective-bile-acids',
      description: 'Ursodeoxycholic acid, Silymarin, and amino acid conjugates for liver restoration.',
    },
  });

  // 4. Create Products
  const productsData = [
    // DIABETES PRODUCTS
    {
      sku: 'DIAB-MET-500SR',
      name: 'Glycomet-SR 500mg Tablet',
      slug: 'glycomet-sr-500mg-tablet',
      genericSaltName: 'Metformin Hydrochloride (Sustained Release)',
      categoryId: diabetesCat.id,
      subcategoryId: subcatOral.id,
      manufacturerId: sunPharma.id,
      form: 'Tablet',
      strength: '500mg',
      packSize: 'Strip of 20 Tablets',
      mrp: 6500, // ₹65.00
      sellingPrice: 5200, // ₹52.00
      stock: 450,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 6,
      description: 'Glycomet-SR 500mg Tablet belongs to the biguanide class of anti-diabetic medications. It decreases hepatic glucose production and improves insulin sensitivity in Type 2 Diabetes.',
      medicalUses: 'Type 2 Diabetes Mellitus management, reduction of fasting and post-prandial blood glucose levels.',
      sideEffects: 'Mild nausea, abdominal discomfort, metallic taste, diarrhea during initiation.',
      contraindications: 'Severe renal impairment (eGFR < 30 mL/min), acute metabolic acidosis, severe diabetic ketoacidosis.',
      storageInstructions: 'Store protected from light and moisture at a temperature not exceeding 25°C.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'DIAB-GLIM-M2',
      name: 'Amaryl M 2mg/500mg Tablet',
      slug: 'amaryl-m-2mg-500mg-tablet',
      genericSaltName: 'Glimepiride (2mg) + Metformin (500mg)',
      categoryId: diabetesCat.id,
      subcategoryId: subcatOral.id,
      manufacturerId: sanofi.id,
      form: 'Tablet',
      strength: '2mg + 500mg',
      packSize: 'Strip of 15 Tablets',
      mrp: 24500, // ₹245.00
      sellingPrice: 19800, // ₹198.00
      stock: 280,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Amaryl M combines a second-generation sulfonylurea with metformin for dual-action glycemic control in adults with Type 2 Diabetes.',
      medicalUses: 'Dual therapy when single-agent metformin fails to achieve HbA1c targets.',
      sideEffects: 'Hypoglycemia risk, headache, temporary visual disturbance.',
      contraindications: 'Type 1 Diabetes, severe hepatic or renal dysfunction, hypersensitivity to sulfonylureas.',
      storageInstructions: 'Store below 30°C in original blister pack.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'DIAB-INS-LANTUS',
      name: 'Lantus 100 IU/ml Solution for Injection (Cartridge)',
      slug: 'lantus-100-iu-ml-solution-injection',
      genericSaltName: 'Insulin Glargine (Recombinant DNA origin)',
      categoryId: diabetesCat.id,
      subcategoryId: subcatInsulin.id,
      manufacturerId: sanofi.id,
      form: 'Injection / Cartridge',
      strength: '100 IU/ml (3ml Cartridge)',
      packSize: 'Pack of 5 Cartridges (3ml each)',
      mrp: 320000, // ₹3,200.00
      sellingPrice: 279000, // ₹2,790.00
      stock: 65,
      scheduleType: 'Schedule H',
      isColdChain: true,
      minTempCelsius: 2.0,
      maxTempCelsius: 8.0,
      maxOrderQuantity: 3,
      description: 'Lantus is a 24-hour long-acting basal insulin analogue providing steady, peakless glucose control. Shipped exclusively in insulated thermal cold-chain packaging.',
      medicalUses: 'Management of Type 1 and advanced Type 2 Diabetes requiring 24-hour basal glycemic control.',
      sideEffects: 'Hypoglycemia, lipodystrophy at injection site, allergic reactions.',
      contraindications: 'Episodes of acute hypoglycemia, hypersensitivity to insulin glargine.',
      storageInstructions: 'Must be stored in a refrigerator (2°C - 8°C). Do not freeze. Protect from direct heat and light.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'DIAB-INS-NOVORAPID',
      name: 'NovoRapid FlexPen 100 U/ml Pre-filled Pen',
      slug: 'novorapid-flexpen-100-u-ml',
      genericSaltName: 'Insulin Aspart (Rapid Acting)',
      categoryId: diabetesCat.id,
      subcategoryId: subcatInsulin.id,
      manufacturerId: novoNordisk.id,
      form: 'Pre-filled Pen',
      strength: '100 U/ml (3ml)',
      packSize: '1 Pre-filled FlexPen (3ml)',
      mrp: 115000, // ₹1,150.00
      sellingPrice: 98000, // ₹980.00
      stock: 90,
      scheduleType: 'Schedule H',
      isColdChain: true,
      minTempCelsius: 2.0,
      maxTempCelsius: 8.0,
      maxOrderQuantity: 5,
      description: 'NovoRapid is an ultra-fast acting mealtime insulin analog designed to control postprandial glucose spikes within 10-20 minutes of administration.',
      medicalUses: 'Postprandial glycemic control in diabetes patients.',
      sideEffects: 'Hypoglycemia, peripheral edema, local injection site discomfort.',
      contraindications: 'Hypoglycemia episodes.',
      storageInstructions: 'Keep in refrigerator at 2°C - 8°C until first use. After first use, can be kept at room temperature (< 30°C) for up to 4 weeks.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop']),
      isFeatured: false,
    },
    {
      sku: 'DIAB-DEV-ACCUCHECK',
      name: 'Accu-Chek Active Blood Glucose Meter Kit',
      slug: 'accu-chek-active-blood-glucose-meter-kit',
      genericSaltName: 'In-Vitro Diagnostic Blood Glucose Monitoring System',
      categoryId: diabetesCat.id,
      subcategoryId: subcatMonitors.id,
      manufacturerId: abbott.id,
      form: 'Diagnostic Device',
      strength: 'Digital Unit + 10 Strips + Lancing Device',
      packSize: '1 Complete Starter Kit',
      mrp: 159900, // ₹1,599.00
      sellingPrice: 124900, // ₹1,249.00
      stock: 140,
      scheduleType: 'OTC',
      isColdChain: false,
      maxOrderQuantity: 3,
      description: 'Accu-Chek Active provides laboratory-accurate blood glucose measurements in under 5 seconds with a tiny 1-2 microlitre capillary blood sample.',
      medicalUses: 'Self-monitoring of blood glucose (SMBG) at home for diabetes management.',
      sideEffects: 'None. Minor finger-prick discomfort.',
      contraindications: 'Not intended for neonatal use or arterial blood testing.',
      storageInstructions: 'Store in protective case at room temperature (2°C - 30°C). Keep dry.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'DIAB-STRIP-ACCU50',
      name: 'Accu-Chek Active 50 Test Strips Pack',
      slug: 'accu-chek-active-50-test-strips-pack',
      genericSaltName: 'Glucose Dehydrogenase Reagent Strips',
      categoryId: diabetesCat.id,
      subcategoryId: subcatMonitors.id,
      manufacturerId: abbott.id,
      form: 'Diagnostic Test Strips',
      strength: '50 Strips',
      packSize: 'Vial of 50 Strips',
      mrp: 114500, // ₹1,145.00
      sellingPrice: 89000, // ₹890.00
      stock: 500,
      scheduleType: 'OTC',
      isColdChain: false,
      maxOrderQuantity: 6,
      description: 'Pack of 50 test strips for Accu-Chek Active meters. Features underdose detection and 10-second re-dosing capability.',
      medicalUses: 'Daily blood sugar tracking.',
      sideEffects: 'None.',
      contraindications: 'Do not use beyond expiration date printed on the canister.',
      storageInstructions: 'Tightly close container immediately after removing strip. Store between 2°C and 30°C.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop']),
      isFeatured: false,
    },

    // CIRRHOSIS & LIVER CARE PRODUCTS
    {
      sku: 'LIV-RIF-550',
      name: 'Rifagut 550mg Tablet',
      slug: 'rifagut-550mg-tablet',
      genericSaltName: 'Rifaximin',
      categoryId: cirrhosisCat.id,
      subcategoryId: subcatEncephalopathy.id,
      manufacturerId: sunPharma.id,
      form: 'Tablet',
      strength: '550mg',
      packSize: 'Strip of 10 Tablets',
      mrp: 46000, // ₹460.00
      sellingPrice: 38500, // ₹385.00
      stock: 220,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 6,
      description: 'Rifaximin 550mg is a non-systemic, gut-targeted antibiotic that suppresses ammonia-producing enteric bacteria, significantly reducing the recurrence of overt hepatic encephalopathy in liver cirrhosis patients.',
      medicalUses: 'Reduction in risk of overt Hepatic Encephalopathy (HE) recurrence in patients with advanced liver cirrhosis.',
      sideEffects: 'Peripheral edema, mild dizziness, nausea, muscle spasms.',
      contraindications: 'Hypersensitivity to rifaximin, rifamycin antimicrobial agents, or intestinal obstruction.',
      storageInstructions: 'Store protected from moisture at room temperature not exceeding 25°C.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'LIV-LAC-SYR450',
      name: 'Duphalac Oral Solution 450ml',
      slug: 'duphalac-oral-solution-450ml',
      genericSaltName: 'Lactulose Solution USP (10g / 15ml)',
      categoryId: cirrhosisCat.id,
      subcategoryId: subcatEncephalopathy.id,
      manufacturerId: abbott.id,
      form: 'Syrup / Oral Solution',
      strength: '3.35g / 5ml (66.7% w/v)',
      packSize: 'Bottle of 450ml',
      mrp: 58500, // ₹585.00
      sellingPrice: 49500, // ₹495.00
      stock: 310,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Duphalac is a synthetic disaccharide that acidifies the colonic contents, converting absorbable ammonia (NH3) into non-absorbable ammonium ions (NH4+), accelerating fecal evacuation to prevent cognitive impairment in cirrhosis.',
      medicalUses: 'Prevention and treatment of portal-systemic encephalopathy and chronic constipation in hepatic impairment.',
      sideEffects: 'Abdominal distension, flatulence, diarrhea if over-titrated, electrolyte imbalance.',
      contraindications: 'Galactosemia, bowel obstruction, acute surgical abdomen.',
      storageInstructions: 'Store below 25°C. Do not freeze. Keep container tightly closed.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'LIV-SPIRON-100',
      name: 'Aldactone 100mg Tablet',
      slug: 'aldactone-100mg-tablet',
      genericSaltName: 'Spironolactone',
      categoryId: cirrhosisCat.id,
      subcategoryId: subcatDiuretics.id,
      manufacturerId: cipla.id,
      form: 'Tablet',
      strength: '100mg',
      packSize: 'Strip of 15 Tablets',
      mrp: 14500, // ₹145.00
      sellingPrice: 11900, // ₹119.00
      stock: 190,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Aldactone is an aldosterone antagonist diuretic. It acts on the distal renal tubules to promote sodium and water excretion while conserving potassium, serving as the cornerstone for managing ascites in cirrhosis.',
      medicalUses: 'Treatment of fluid retention (ascites and peripheral edema) secondary to hepatic cirrhosis.',
      sideEffects: 'Hyperkalemia, gynecomastia, drowsiness, menstrual irregularities.',
      contraindications: 'Hyperkalemia (serum K+ > 5.5 mEq/L), severe acute kidney injury, Addison disease.',
      storageInstructions: 'Store protected from light and heat at temperature below 25°C.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'LIV-UDCA-300',
      name: 'Udiliv 300mg Tablet',
      slug: 'udiliv-300mg-tablet',
      genericSaltName: 'Ursodeoxycholic Acid (UDCA)',
      categoryId: cirrhosisCat.id,
      subcategoryId: subcatHepatoprotective.id,
      manufacturerId: abbott.id,
      form: 'Tablet',
      strength: '300mg',
      packSize: 'Strip of 15 Tablets',
      mrp: 68000, // ₹680.00
      sellingPrice: 57500, // ₹575.00
      stock: 240,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Udiliv contains Ursodeoxycholic Acid, a naturally occurring hydrophilic bile acid that displaces toxic hydrophobic bile acids, enhances bile flow, and stabilizes hepatocyte cell membranes in chronic cholestatic liver conditions.',
      medicalUses: 'Primary biliary cholangitis, chronic cholestatic liver disease, non-alcoholic steatohepatitis (NASH).',
      sideEffects: 'Pasty stools, mild diarrhea, abdominal discomfort.',
      contraindications: 'Acute inflammation of the gallbladder or biliary tract, biliary obstruction, calcified gallstones.',
      storageInstructions: 'Store in a cool, dry place protected from sunlight.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop']),
      isFeatured: true,
    },
    {
      sku: 'LIV-PROP-40',
      name: 'Inderal 40mg Tablet',
      slug: 'inderal-40mg-tablet',
      genericSaltName: 'Propranolol Hydrochloride',
      categoryId: cirrhosisCat.id,
      subcategoryId: subcatBetaBlockers.id,
      manufacturerId: cipla.id,
      form: 'Tablet',
      strength: '40mg',
      packSize: 'Strip of 15 Tablets',
      mrp: 5200, // ₹52.00
      sellingPrice: 4200, // ₹42.00
      stock: 350,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Inderal is a non-selective beta-adrenergic receptor blocker that lowers splanchnic blood flow and portal vein pressure, critically preventing life-threatening esophageal variceal bleeding in cirrhosis.',
      medicalUses: 'Primary and secondary prophylaxis of esophageal variceal hemorrhage in portal hypertension.',
      sideEffects: 'Bradycardia, hypotension, cold extremities, bronchospasm, fatigue.',
      contraindications: 'Bronchial asthma, severe sinus bradycardia, second or third-degree heart block, cardiogenic shock.',
      storageInstructions: 'Store protected from light at room temperature.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop']),
      isFeatured: false,
    },
    {
      sku: 'LIV-LOLA-SACHET',
      name: 'Hepamerz Granules Sachet 5g',
      slug: 'hepamerz-granules-sachet-5g',
      genericSaltName: 'L-Ornithine L-Aspartate (LOLA)',
      categoryId: cirrhosisCat.id,
      subcategoryId: subcatHepatoprotective.id,
      manufacturerId: sunPharma.id,
      form: 'Powder Sachet',
      strength: '5g Sachet',
      packSize: 'Pack of 10 Sachets',
      mrp: 99000, // ₹990.00
      sellingPrice: 84000, // ₹840.00
      stock: 150,
      scheduleType: 'Schedule H',
      isColdChain: false,
      maxOrderQuantity: 4,
      description: 'Hepa-Merz provides L-Ornithine and L-Aspartate, crucial substrates for the urea cycle in hepatocytes and glutamine synthesis in skeletal muscle, accelerating systemic ammonia detoxification.',
      medicalUses: 'Adjuvant therapy for subclinical and overt hepatic encephalopathy and acute/chronic hepatitis.',
      sideEffects: 'Transient nausea, gastrointestinal cramps, flatulence.',
      contraindications: 'Severe renal failure (serum creatinine > 3 mg/dL).',
      storageInstructions: 'Store below 25°C in a dry place. Protect sachet from moisture.',
      images: JSON.stringify(['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop']),
      isFeatured: false,
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({ data: p });

    // Create an inventory batch for each product
    await prisma.inventoryBatch.create({
      data: {
        productId: product.id,
        batchNumber: `BT-${Math.floor(100000 + Math.random() * 900000)}`,
        manufacturingDate: new Date('2026-01-15'),
        expiryDate: new Date('2028-06-30'),
        quantityOnHand: product.stock,
        quantityAllocated: 0,
        quantityAvailable: product.stock,
        costPrice: Math.round(product.sellingPrice * 0.7),
      },
    });
  }

  // 5. Create a Sample Order for Customer
  const rifagut = await prisma.product.findUnique({ where: { slug: 'rifagut-550mg-tablet' } });
  const glycomet = await prisma.product.findUnique({ where: { slug: 'glycomet-sr-500mg-tablet' } });

  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-9041',
      userId: customer.id,
      addressId: address1.id,
      orderStatus: 'PROCESSING',
      totalMrpAmount: 46000 + 6500 * 2, // ₹460 + ₹130 = ₹590.00
      totalDiscountAmount: 7500 + 2600,  // ₹101.00 discount
      deliveryCharge: 0,
      coldChainFee: 0,
      finalPayableAmount: 38500 + 5200 * 2, // ₹385 + ₹104 = ₹489.00 (48900 paise)
      isColdChain: false,
      customerNotes: 'Please verify morning dosage for Metformin.',
      createdAt: new Date('2026-09-08T10:30:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: rifagut.id,
      productNameSnapshot: rifagut.name,
      genericSaltSnapshot: rifagut.genericSaltName,
      strengthSnapshot: rifagut.strength,
      formSnapshot: rifagut.form,
      unitPricePaid: rifagut.sellingPrice,
      quantity: 1,
      totalPrice: rifagut.sellingPrice,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: glycomet.id,
      productNameSnapshot: glycomet.name,
      genericSaltSnapshot: glycomet.genericSaltName,
      strengthSnapshot: glycomet.strength,
      formSnapshot: glycomet.form,
      unitPricePaid: glycomet.sellingPrice,
      quantity: 2,
      totalPrice: glycomet.sellingPrice * 2,
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      razorpayOrderId: 'order_RxDem9041001',
      razorpayPaymentId: 'pay_RxDem9041PayId',
      razorpaySignature: 'simulated_valid_hmac_signature_demo',
      paymentMethod: 'UPI',
      paymentStatus: 'CAPTURED',
      amountPaise: 48900,
      currency: 'INR',
      capturedAt: new Date('2026-09-08T10:32:00Z'),
    },
  });

  console.log('Database seeded successfully with authentic clinical products, demo users, and realistic orders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
