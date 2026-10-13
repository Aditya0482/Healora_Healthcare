import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all products for Admin (including inactive ones)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        manufacturer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error('Fetch products error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST: Add new product
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Admin access required to add products' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      manufacturerName,
      description,
      categoryId,
      subcategoryId,
      mrp, // in Rupees
      sellingPrice, // in Rupees
      stock,
      imageUrl,
      images,
      form = 'Tablet',
      strength = 'Standard',
      packSize = 'Standard Pack',
      genericSaltName,
      medicalUses,
      isActive = true,
      isFeatured = false,
    } = body;

    if (!name || !categoryId || mrp === undefined || sellingPrice === undefined) {
      return NextResponse.json(
        { error: 'Product name, category, MRP, and selling price are required.' },
        { status: 400 }
      );
    }

    if (!manufacturerName || !manufacturerName.trim()) {
      return NextResponse.json(
        { error: 'Manufacturer name is required (Compulsory).' },
        { status: 400 }
      );
    }

    // Find or upsert single manufacturer
    const cleanMfgName = manufacturerName.trim();
    let manufacturer = await prisma.manufacturer.findFirst({
      where: { name: { equals: cleanMfgName } },
    });
    if (!manufacturer) {
      manufacturer = await prisma.manufacturer.create({
        data: {
          name: cleanMfgName,
          countryOfOrigin: 'India',
        },
      });
    }

    if (isFeatured) {
      const topCount = await prisma.product.count({
        where: { categoryId, isFeatured: true },
      });
      if (topCount >= 4) {
        return NextResponse.json(
          { error: 'Maximum 4 Top Products allowed in this category (Max 8 total across both categories). Please uncheck Top Product from another item first.' },
          { status: 400 }
        );
      }
    }

    const mrpPaise = Math.round(Number(mrp) * 100);
    const sellingPricePaise = Math.round(Number(sellingPrice) * 100);

    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-6)}`;

    const sku = `PRD-${Math.floor(100000 + Math.random() * 900000)}`;

    const imageList = Array.isArray(images) && images.filter(Boolean).length > 0
      ? images.filter(Boolean).slice(0, 5)
      : imageUrl
      ? [imageUrl]
      : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'];

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        slug,
        genericSaltName: genericSaltName || '',
        categoryId,
        subcategoryId: subcategoryId || null,
        manufacturerId: manufacturer.id,
        form: form || '',
        strength: strength || '',
        packSize: packSize || '',
        mrp: mrpPaise,
        sellingPrice: sellingPricePaise,
        stock: Number(stock) >= 0 ? Number(stock) : 100,
        scheduleType: 'OTC',
        isColdChain: false,
        description: description || name,
        medicalUses: medicalUses || description || name,
        images: JSON.stringify(imageList),
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
      },
    });

    // Create initial inventory batch
    await prisma.inventoryBatch.create({
      data: {
        productId: product.id,
        batchNumber: `BT-${Math.floor(100000 + Math.random() * 900000)}`,
        manufacturingDate: new Date(),
        expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
        quantityOnHand: product.stock,
        quantityAllocated: 0,
        quantityAvailable: product.stock,
        costPrice: Math.round(product.sellingPrice * 0.7),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'PRODUCT_CREATED',
        targetEntityType: 'Product',
        targetEntityId: product.id,
        newPayload: JSON.stringify({ name: product.name, sku: product.sku }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error('Product add error:', err);
    return NextResponse.json({ error: err.message || 'Failed to add product' }, { status: 500 });
  }
}

// PATCH: Edit any product details (Price, MRP, Discount, Stock, Description, Image, Show/Hide isActive)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Admin access required to edit products' }, { status: 403 });
    }

    const body = await req.json();
    const {
      productId,
      name,
      description,
      categoryId,
      sellingPrice, // in Rupees
      mrp, // in Rupees
      stock,
      isActive,
      isFeatured,
      imageUrl,
      images,
      genericSaltName,
      form,
      strength,
      packSize,
    } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) {
      updateData.description = description;
      updateData.medicalUses = description;
    }
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (sellingPrice !== undefined) updateData.sellingPrice = Math.round(Number(sellingPrice) * 100);
    if (mrp !== undefined) updateData.mrp = Math.round(Number(mrp) * 100);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isFeatured !== undefined) {
      const targetCatId = categoryId || existing.categoryId;
      if (isFeatured && !existing.isFeatured) {
        const topCount = await prisma.product.count({
          where: { categoryId: targetCatId, isFeatured: true, id: { not: productId } },
        });
        if (topCount >= 4) {
          return NextResponse.json(
            { error: 'Maximum 4 Top Products allowed in this category (Max 8 total across both categories). Please uncheck Top Product from another item first.' },
            { status: 400 }
          );
        }
      }
      updateData.isFeatured = Boolean(isFeatured);
    }
    if (genericSaltName !== undefined) updateData.genericSaltName = genericSaltName;
    if (form !== undefined) updateData.form = form;
    if (strength !== undefined) updateData.strength = strength;
    if (packSize !== undefined) updateData.packSize = packSize;
    if (body.manufacturerName !== undefined && body.manufacturerName.trim()) {
      const cleanMfg = body.manufacturerName.trim();
      let mfg = await prisma.manufacturer.findFirst({
        where: { name: { equals: cleanMfg } },
      });
      if (!mfg) {
        mfg = await prisma.manufacturer.create({
          data: { name: cleanMfg, countryOfOrigin: 'India' },
        });
      }
      updateData.manufacturerId = mfg.id;
    }
    if (images && Array.isArray(images)) {
      const list = images.filter(Boolean);
      if (list.length > 0) {
        updateData.images = JSON.stringify(list.slice(0, 5));
      }
    } else if (imageUrl) {
      updateData.images = JSON.stringify([imageUrl]);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'PRODUCT_UPDATED',
        targetEntityType: 'Product',
        targetEntityId: productId,
        newPayload: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error('Product update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Admin access required to delete products' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'PRODUCT_DELETED',
        targetEntityType: 'Product',
        targetEntityId: productId,
      },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Product delete error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
