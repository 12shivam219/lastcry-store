import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  saveDb,
  resetSeedData,
  transitionOrderStatus,
  hasPermission,
} from '@/lib/db/store';
import { RoleType, ProductRecord } from '@/lib/db/types';

function verifyAdminRequest(req: NextRequest): {
  authorized: boolean;
  email: string;
  role: RoleType;
} {
  const roleHeader = (req.headers.get('x-admin-role') || '') as RoleType;
  const emailHeader = req.headers.get('x-admin-email') || 'admin@lastcry.in';
  const authCookie = req.cookies.get('lastcry_admin_session')?.value;
  const authHeader = req.headers.get('authorization');

  if (
    authCookie === 'authenticated_admin' ||
    authHeader === 'Bearer sandbox_admin_session_token' ||
    roleHeader === 'ADMIN' ||
    roleHeader === 'OPERATIONS_MANAGER' ||
    roleHeader === 'CONTENT_REVIEWER' ||
    roleHeader === 'FINANCE_AUDITOR'
  ) {
    const resolvedRole: RoleType = roleHeader || 'ADMIN';
    return { authorized: true, email: emailHeader, role: resolvedRole };
  }

  return { authorized: false, email: '', role: 'CUSTOMER' };
}

export async function GET(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Administrative authentication required.' },
      { status: 401 }
    );
  }

  const db = getDb();
  const paidOrders = db.orders.filter((o) => o.paymentStatus === 'PAID');
  const totalRevenueInr = paidOrders.reduce((sum, o) => sum + o.totalInr, 0);
  const awaitingProcessing = db.orders.filter(
    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING'
  ).length;
  const pendingFulfilment = db.orders.filter(
    (o) =>
      o.fulfilmentStatus === 'RESERVED' ||
      o.fulfilmentStatus === 'PREPARING' ||
      o.fulfilmentStatus === 'READY_FOR_DISPATCH'
  ).length;
  const lowStockProducts = db.products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  );
  const pendingRefunds = db.orders.filter(
    (o) => o.orderStatus === 'REFUND_PENDING'
  );

  return NextResponse.json({
    metrics: {
      totalOrders: db.orders.length,
      awaitingProcessing,
      totalRevenueInr,
      pendingFulfilment,
      lowStockCount: lowStockProducts.length,
      pendingRefundsCount: pendingRefunds.length,
    },
    products: db.products,
    categories: db.categories,
    traditions: db.traditions,
    ritualKits: db.ritualKits,
    orders: db.orders,
    suppliers: db.suppliers,
    deliveryZones: db.deliveryZones,
    coupons: db.coupons,
    serviceListings: db.serviceListings,
    serviceEnquiries: db.serviceEnquiries,
    guidanceArticles: db.guidanceArticles,
    supportTickets: db.supportTickets,
    users: db.users.map(({ passwordHash: _unused, ...u }) => {
      void _unused;
      return u;
    }),
    auditLogs: db.auditLogs,
  });
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Administrative authentication required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;
    const db = getDb();
    const now = new Date().toISOString();

    if (action === 'RESET_SEED_DATA') {
      if (!hasPermission(auth.role, 'MANAGE_PRODUCTS')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const fresh = resetSeedData(auth.email);
      return NextResponse.json({ success: true, state: fresh });
    }

    if (action === 'UPDATE_ORDER_STATUS') {
      const result = transitionOrderStatus({
        orderNumber: body.orderNumber,
        nextStatus: body.nextStatus,
        actorEmail: auth.email,
        actorRole: auth.role,
        note: body.note,
        trackingNumber: body.trackingNumber,
        carrierName: body.carrierName,
      });
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === 'UPDATE_INVENTORY_AND_PRICE') {
      if (!hasPermission(auth.role, 'MANAGE_INVENTORY')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const product = db.products.find((p) => p.id === body.productId);
      if (!product) {
        return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
      }

      const oldPrice = product.sellingPriceInr;
      const oldStock = product.stockQuantity;

      if (typeof body.sellingPriceInr === 'number' && body.sellingPriceInr > 0) {
        product.sellingPriceInr = body.sellingPriceInr;
      }
      if (typeof body.stockQuantity === 'number' && body.stockQuantity >= 0) {
        product.stockQuantity = Math.floor(body.stockQuantity);
        product.stockStatus =
          product.stockQuantity === 0
            ? 'OUT_OF_STOCK'
            : product.stockQuantity <= product.lowStockThreshold
            ? 'LOW_STOCK'
            : 'IN_STOCK';
      }
      if (body.publicationStatus) {
        if (
          body.publicationStatus === 'PUBLISHED' &&
          product.reviewStatus !== 'REVIEWED_VERIFIED'
        ) {
          return NextResponse.json(
            {
              error:
                'Cannot publish a product before its cultural & compliance review status is REVIEWED_VERIFIED.',
            },
            { status: 400 }
          );
        }
        product.publicationStatus = body.publicationStatus;
      }
      if (body.reviewStatus) {
        product.reviewStatus = body.reviewStatus;
        if (body.reviewStatus === 'REVIEWED_VERIFIED') {
          product.reviewedBy = auth.email;
          product.lastReviewedAt = now.slice(0, 10);
        }
      }

      product.updatedAt = now;

      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: now,
        actorEmail: auth.email,
        actorRole: auth.role,
        action: oldPrice !== product.sellingPriceInr ? 'PRICE_CHANGE' : 'INVENTORY_ADJUSTMENT',
        entityType: 'Product',
        entityId: product.sku,
        summary: `Updated ${product.sku}: Price ₹${oldPrice} -> ₹${product.sellingPriceInr}, Stock ${oldStock} -> ${product.stockQuantity}, Status ${product.publicationStatus}.`,
      });

      saveDb(db);
      return NextResponse.json({ success: true, product });
    }

    if (action === 'CREATE_PRODUCT') {
      if (!hasPermission(auth.role, 'MANAGE_PRODUCTS')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const cat =
        db.categories.find((c) => c.id === body.categoryId || c.slug === body.categorySlug) ||
        db.categories[0];

      const slug = (body.name || 'new-product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newProd: ProductRecord = {
        id: `prod-${Date.now()}`,
        name: body.name,
        slug,
        sku: body.sku || `LC-NEW-${Date.now().toString().slice(-4)}`,
        shortDescription: body.shortDescription || '',
        fullDescription: body.fullDescription || body.shortDescription || '',
        categoryId: cat.id,
        categorySlug: cat.slug,
        categoryName: cat.name,
        groupSlug:
          cat.groupSlug === 'services' ? 'essentials' : cat.groupSlug,
        traditionSlugs: body.traditionSlugs || ['regional-cultural-traditions'],
        images: [
          {
            url: body.imageUrl || '/assets/products/cotton-shroud.svg',
            altText: body.name,
            isPlaceholder: true,
          },
        ],
        currencyCode: 'INR',
        sellingPriceInr: Number(body.sellingPriceInr) || 500,
        mrpInr: Number(body.mrpInr) || Number(body.sellingPriceInr) || 500,
        costPriceInr: Number(body.costPriceInr) || 300,
        gstPercent: Number(body.gstPercent) ?? 5,
        hsnCode: body.hsnCode || '520811',
        stockQuantity: Number(body.stockQuantity) ?? 20,
        reservedQuantity: 0,
        lowStockThreshold: 5,
        stockStatus: 'IN_STOCK',
        weightGrams: Number(body.weightGrams) || 500,
        dimensionsCm: body.dimensionsCm || '25 x 20 x 8 cm',
        materials: body.materials || 'Verified natural materials',
        specifications: { Note: 'Verified specification' },
        variants: [],
        supplierId: body.supplierId || 'sup-kashi-handloom',
        deliveryEligibility: 'ALL_SUPPORTED_ZONES',
        estimatedDispatch: 'Dispatches within 12–24 hours',
        returnEligibility: '7-day unused returns with intact seal',
        designation: body.designation || 'ESSENTIAL',
        traditionNotes:
          body.traditionNotes ||
          'Reviewed cultural context note qualified for regional custom.',
        complianceVerified: true,
        reviewStatus: body.reviewStatus || 'REVIEWED_VERIFIED',
        reviewedBy: auth.email,
        lastReviewedAt: now.slice(0, 10),
        publicationStatus: body.publicationStatus || 'PUBLISHED',
        seoTitle: `${body.name} | LastCry`,
        seoDescription: body.shortDescription || body.name,
        isSampleData: false,
        createdAt: now,
        updatedAt: now,
      };

      db.products.unshift(newProd);
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: now,
        actorEmail: auth.email,
        actorRole: auth.role,
        action: 'PRODUCT_PUBLICATION',
        entityType: 'Product',
        entityId: newProd.sku,
        summary: `Created product "${newProd.name}" (${newProd.sku}) at ₹${newProd.sellingPriceInr}.`,
      });
      saveDb(db);
      return NextResponse.json({ success: true, product: newProd });
    }

    if (action === 'TOGGLE_DELIVERY_ZONE') {
      if (!hasPermission(auth.role, 'MANAGE_DELIVERY_ZONES')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const zone = db.deliveryZones.find((z) => z.id === body.zoneId);
      if (!zone) {
        return NextResponse.json({ error: 'Delivery zone not found.' }, { status: 404 });
      }
      if (typeof body.isActive === 'boolean') zone.isActive = body.isActive;
      if (typeof body.standardFeeInr === 'number') zone.standardFeeInr = body.standardFeeInr;
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: now,
        actorEmail: auth.email,
        actorRole: auth.role,
        action: 'DELIVERY_ZONE_UPDATE',
        entityType: 'DeliveryZone',
        entityId: zone.id,
        summary: `Updated delivery zone "${zone.zoneName}" (Active: ${zone.isActive}, Standard Fee: ₹${zone.standardFeeInr}).`,
      });
      saveDb(db);
      return NextResponse.json({ success: true, zone });
    }

    if (action === 'VERIFY_SUPPLIER') {
      if (!hasPermission(auth.role, 'MANAGE_SUPPLIERS')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const supplier = db.suppliers.find((s) => s.id === body.supplierId);
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found.' }, { status: 404 });
      }
      supplier.verificationStatus = body.verificationStatus;
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: now,
        actorEmail: auth.email,
        actorRole: auth.role,
        action: 'SUPPLIER_VERIFICATION',
        entityType: 'Supplier',
        entityId: supplier.code,
        summary: `Updated supplier "${supplier.name}" verification status to ${supplier.verificationStatus}.`,
      });
      saveDb(db);
      return NextResponse.json({ success: true, supplier });
    }

    if (action === 'RESOLVE_TICKET') {
      const tkt = db.supportTickets.find((t) => t.id === body.ticketId);
      if (!tkt) {
        return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
      }
      tkt.status = body.status || 'RESOLVED';
      tkt.resolutionNote = body.resolutionNote || 'Resolved by support desk.';
      tkt.updatedAt = now;
      saveDb(db);
      return NextResponse.json({ success: true, ticket: tkt });
    }

    return NextResponse.json({ error: 'Unsupported admin action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Admin operation failed.' }, { status: 500 });
  }
}
