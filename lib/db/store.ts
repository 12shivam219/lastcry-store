import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  DatabaseState,
  ProductRecord,
  RitualKitRecord,
  DeliveryZoneRecord,
  OrderRecord,
  OrderStatus,
  PaymentStatus,
  FulfilmentStatus,
  RoleType,
  AuditLogRecord,
} from './types.ts';
import { createInitialSeedData } from './seed-data.ts';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE_PATH = path.join(DATA_DIR, 'lastcry-db.json');

let memoryCache: DatabaseState | null = null;

export function roundInr(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function getDb(): DatabaseState {
  if (memoryCache) {
    return memoryCache;
  }
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      memoryCache = JSON.parse(raw) as DatabaseState;
      return memoryCache;
    }
  } catch {
    // Fallback to initial seed data if file read fails
  }
  const initial = createInitialSeedData();
  saveDb(initial);
  return initial;
}

export function saveDb(state: DatabaseState): void {
  memoryCache = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // In read-only environments, memoryCache preserves state during runtime
  }
}

export function resetSeedData(actorEmail = 'admin@lastcry.in'): DatabaseState {
  const fresh = createInitialSeedData();
  fresh.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole: 'ADMIN',
    action: 'SEED_DATA_RESET',
    entityType: 'Database',
    entityId: 'ALL',
    summary: 'Development seed data reset to clean baseline.',
  });
  saveDb(fresh);
  return fresh;
}

export function stripCostPriceForPublic(product: ProductRecord): Omit<ProductRecord, 'costPriceInr'> {
  const { costPriceInr: _unusedCost, ...publicProduct } = product;
  void _unusedCost;
  return publicProduct;
}

export function getPublishedProducts(): ProductRecord[] {
  const db = getDb();
  return db.products.filter(
    (p) =>
      p.publicationStatus === 'PUBLISHED' &&
      p.reviewStatus === 'REVIEWED_VERIFIED' &&
      p.complianceVerified
  );
}

export function getPublishedRitualKits(): RitualKitRecord[] {
  const db = getDb();
  return db.ritualKits.filter(
    (k) => k.publicationStatus === 'PUBLISHED' && k.reviewStatus === 'REVIEWED_VERIFIED'
  );
}

export interface PinCodeCheckResult {
  pinCode: string;
  isValidFormat: boolean;
  isServiceable: boolean;
  zone?: DeliveryZoneRecord;
  productRestricted?: boolean;
  restrictionReason?: string;
  standardFeeInr: number;
  freeDeliveryThresholdInr: number;
  estimatedWindow: string;
  priorityAvailable: boolean;
  priorityWindow?: string;
  priorityFeeInr?: number;
  dispatchCutoff: string;
}

export function checkPinCodeServiceability(
  pinCodeInput: string,
  productOrSlug?: string
): PinCodeCheckResult {
  const cleaned = (pinCodeInput || '').trim();
  const isValidFormat = /^[1-9][0-9]{5}$/.test(cleaned);
  if (!isValidFormat) {
    return {
      pinCode: cleaned,
      isValidFormat: false,
      isServiceable: false,
      standardFeeInr: 0,
      freeDeliveryThresholdInr: 0,
      estimatedWindow: 'Please enter a valid 6-digit Indian PIN code (e.g. 400001, 110001, 560001).',
      priorityAvailable: false,
      dispatchCutoff: '',
    };
  }

  const prefix = cleaned.slice(0, 3);
  const db = getDb();
  const zone = db.deliveryZones.find(
    (z) => z.isActive && z.pinCodePrefixes.includes(prefix)
  );

  if (!zone) {
    return {
      pinCode: cleaned,
      isValidFormat: true,
      isServiceable: false,
      standardFeeInr: 0,
      freeDeliveryThresholdInr: 0,
      estimatedWindow: `PIN code ${cleaned} is currently outside our verified regional hub coverage. Supported prefixes include 400/411 (Mumbai/Pune), 110/122/201 (Delhi NCR), 560 (Bengaluru), 600 (Chennai), 700 (Kolkata), 500 (Hyderabad), 380 (Ahmedabad), and 221 (Varanasi).`,
      priorityAvailable: false,
      dispatchCutoff: '',
    };
  }

  let productRestricted = false;
  let restrictionReason: string | undefined;

  if (productOrSlug) {
    const product = db.products.find(
      (p) => p.id === productOrSlug || p.slug === productOrSlug
    );
    if (product && product.deliveryEligibility === 'METRO_HUBS_ONLY') {
      const allowed = product.restrictedPinPrefixes || [];
      if (!allowed.includes(prefix) || !zone.supportsPerishableFlowers) {
        productRestricted = true;
        restrictionReason = `${product.name} is a fresh perishable item available only in Mumbai (400), Pune (411), Delhi NCR (110), and Bengaluru (560) hubs.`;
      }
    }
  }

  return {
    pinCode: cleaned,
    isValidFormat: true,
    isServiceable: !productRestricted,
    zone,
    productRestricted,
    restrictionReason,
    standardFeeInr: zone.standardFeeInr,
    freeDeliveryThresholdInr: zone.freeDeliveryThresholdInr,
    estimatedWindow: zone.estimatedWindow,
    priorityAvailable: zone.supportedDeliveryModes.includes('PRIORITY_LOCAL_COURIER'),
    priorityWindow: zone.priorityWindow,
    priorityFeeInr: zone.priorityFeeInr,
    dispatchCutoff: zone.dispatchCutoffLocalTime,
  };
}

export interface KitCalculationResult {
  kit: RitualKitRecord;
  selectedOptionalIds: string[];
  includedCount: number;
  optionalSelectedCount: number;
  totalItemsCount: number;
  basePriceInr: number;
  optionalAdditionsTotalInr: number;
  configuredPriceInr: number;
  gstPercent: number;
  estimatedGstInr: number;
  pinCheck?: PinCodeCheckResult;
  allItemsSummary: string[];
}

export function calculateKitComposition(
  kitIdOrSlug: string,
  selectedOptionalIds: string[] = [],
  pinCode?: string
): KitCalculationResult | null {
  const kits = getPublishedRitualKits();
  const kit = kits.find((k) => k.id === kitIdOrSlug || k.slug === kitIdOrSlug);
  if (!kit) return null;

  const validOptionals = kit.optionalItems.filter((opt) =>
    selectedOptionalIds.includes(opt.id) || selectedOptionalIds.includes(opt.productId)
  );

  const optionalAdditionsTotalInr = roundInr(
    validOptionals.reduce((sum, item) => sum + item.unitPriceInr * item.quantity, 0)
  );

  const configuredPriceInr = roundInr(kit.basePriceInr + optionalAdditionsTotalInr);
  const estimatedGstInr = roundInr((configuredPriceInr * kit.gstPercent) / 100);

  let pinCheck: PinCodeCheckResult | undefined;
  if (pinCode) {
    // Check if any selected optional item has metro restrictions
    const restrictedOpt = validOptionals.find(
      (opt) => opt.productSlug === 'serene-white-chrysanthemum-mogra-eucalyptus-tribute'
    );
    pinCheck = checkPinCodeServiceability(
      pinCode,
      restrictedOpt ? restrictedOpt.productSlug : undefined
    );
  }

  const allItemsSummary = [
    ...kit.includedItems.map((i) => `${i.quantity}x ${i.productName} (Included)`),
    ...validOptionals.map((i) => `${i.quantity}x ${i.productName} (Optional Addition)`),
  ];

  return {
    kit,
    selectedOptionalIds: validOptionals.map((o) => o.id),
    includedCount: kit.includedItems.reduce((s, i) => s + i.quantity, 0),
    optionalSelectedCount: validOptionals.reduce((s, i) => s + i.quantity, 0),
    totalItemsCount:
      kit.includedItems.reduce((s, i) => s + i.quantity, 0) +
      validOptionals.reduce((s, i) => s + i.quantity, 0),
    basePriceInr: kit.basePriceInr,
    optionalAdditionsTotalInr,
    configuredPriceInr,
    gstPercent: kit.gstPercent,
    estimatedGstInr,
    pinCheck,
    allItemsSummary,
  };
}

export interface CartClientItemInput {
  itemType: 'PRODUCT' | 'RITUAL_KIT';
  productId?: string;
  ritualKitId?: string;
  variantId?: string;
  quantity: number;
  selectedOptionalIds?: string[];
}

export interface ValidatedCartResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lineItems: {
    key: string;
    itemType: 'PRODUCT' | 'RITUAL_KIT';
    productId?: string;
    ritualKitId?: string;
    slug: string;
    title: string;
    sku: string;
    imageUrl: string;
    variantId?: string;
    variantLabel?: string;
    quantity: number;
    maxAvailable: number;
    unitPriceInr: number;
    gstPercent: number;
    taxAmountInr: number;
    lineSubtotalInr: number;
    optionalSelectedIds?: string[];
    kitContentsSummary?: string[];
  }[];
  subtotalInr: number;
  taxInr: number;
  deliveryFeeInr: number;
  discountInr: number;
  totalInr: number;
  appliedCoupon?: {
    code: string;
    description: string;
    discountInr: number;
  };
  couponError?: string;
  pinCheck?: PinCodeCheckResult;
}

export function validateAndCalculateCart(
  rawItems: CartClientItemInput[],
  pinCode?: string,
  couponCode?: string,
  deliveryMethod: 'STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER' = 'STANDARD_SURFACE'
): ValidatedCartResult {
  const db = getDb();
  const errors: string[] = [];
  const warnings: string[] = [];
  const lineItems: ValidatedCartResult['lineItems'] = [];

  for (const raw of rawItems) {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(raw.quantity) || 1)));

    if (raw.itemType === 'PRODUCT' && raw.productId) {
      const product = db.products.find(
        (p) =>
          (p.id === raw.productId || p.slug === raw.productId) &&
          p.publicationStatus === 'PUBLISHED' &&
          p.reviewStatus === 'REVIEWED_VERIFIED'
      );

      if (!product) {
        errors.push(`Product "${raw.productId}" is unavailable or unpublished.`);
        continue;
      }

      const availableStock = Math.max(0, product.stockQuantity - product.reservedQuantity);
      let unitPrice = product.sellingPriceInr;
      let sku = product.sku;
      let variantLabel: string | undefined;
      let maxAvail = availableStock;

      if (raw.variantId && product.variants.length > 0) {
        const variant = product.variants.find((v) => v.id === raw.variantId);
        if (variant) {
          unitPrice = variant.sellingPriceInr;
          sku = variant.sku;
          variantLabel = variant.name;
          maxAvail = Math.min(availableStock, variant.stockQuantity);
        }
      }

      if (maxAvail <= 0) {
        errors.push(`${product.name} is currently out of stock.`);
        continue;
      }

      if (qty > maxAvail) {
        errors.push(
          `Only ${maxAvail} unit(s) of "${product.name}" are currently available in stock.`
        );
      }

      if (pinCode) {
        const itemPinCheck = checkPinCodeServiceability(pinCode, product.slug);
        if (itemPinCheck.productRestricted && itemPinCheck.restrictionReason) {
          errors.push(itemPinCheck.restrictionReason);
        }
      }

      const lineSubtotal = roundInr(unitPrice * qty);
      const taxAmount = roundInr((lineSubtotal * product.gstPercent) / 100);

      lineItems.push({
        key: `prod-${product.id}-${raw.variantId || 'std'}`,
        itemType: 'PRODUCT',
        productId: product.id,
        slug: product.slug,
        title: product.name,
        sku,
        imageUrl: product.images[0]?.url || '/assets/products/cotton-shroud.svg',
        variantId: raw.variantId,
        variantLabel,
        quantity: qty,
        maxAvailable: maxAvail,
        unitPriceInr: unitPrice,
        gstPercent: product.gstPercent,
        taxAmountInr: taxAmount,
        lineSubtotalInr: lineSubtotal,
      });
    } else if (raw.itemType === 'RITUAL_KIT' && raw.ritualKitId) {
      const kitCalc = calculateKitComposition(
        raw.ritualKitId,
        raw.selectedOptionalIds || [],
        pinCode
      );
      if (!kitCalc) {
        errors.push(`Ritual kit "${raw.ritualKitId}" is unavailable or unreviewed.`);
        continue;
      }

      if (kitCalc.pinCheck?.productRestricted && kitCalc.pinCheck.restrictionReason) {
        errors.push(kitCalc.pinCheck.restrictionReason);
      }

      const lineSubtotal = roundInr(kitCalc.configuredPriceInr * qty);
      const taxAmount = roundInr((lineSubtotal * kitCalc.gstPercent) / 100);

      lineItems.push({
        key: `kit-${kitCalc.kit.id}-${(kitCalc.selectedOptionalIds || []).sort().join('_')}`,
        itemType: 'RITUAL_KIT',
        ritualKitId: kitCalc.kit.id,
        slug: kitCalc.kit.slug,
        title: kitCalc.kit.name,
        sku: kitCalc.kit.sku,
        imageUrl: kitCalc.kit.imageUrl,
        variantLabel:
          kitCalc.optionalSelectedCount > 0
            ? `Base Kit + ${kitCalc.optionalSelectedCount} Optional Addition(s)`
            : 'Standard Reviewed Kit',
        quantity: qty,
        maxAvailable: 10,
        unitPriceInr: kitCalc.configuredPriceInr,
        gstPercent: kitCalc.gstPercent,
        taxAmountInr: taxAmount,
        lineSubtotalInr: lineSubtotal,
        optionalSelectedIds: kitCalc.selectedOptionalIds,
        kitContentsSummary: kitCalc.allItemsSummary,
      });
    }
  }

  const subtotalInr = roundInr(
    lineItems.reduce((sum, item) => sum + item.lineSubtotalInr, 0)
  );
  const taxInr = roundInr(lineItems.reduce((sum, item) => sum + item.taxAmountInr, 0));

  let pinCheck: PinCodeCheckResult | undefined;
  let deliveryFeeInr = 0;

  if (pinCode && pinCode.trim().length > 0) {
    pinCheck = checkPinCodeServiceability(pinCode);
    if (!pinCheck.isServiceable) {
      errors.push(pinCheck.estimatedWindow);
    } else if (pinCheck.zone && subtotalInr > 0) {
      if (
        deliveryMethod === 'PRIORITY_LOCAL_COURIER' &&
        pinCheck.priorityAvailable &&
        pinCheck.priorityFeeInr
      ) {
        deliveryFeeInr = pinCheck.priorityFeeInr;
      } else {
        deliveryFeeInr =
          subtotalInr >= pinCheck.zone.freeDeliveryThresholdInr
            ? 0
            : pinCheck.zone.standardFeeInr;
      }
    }
  } else if (subtotalInr > 0) {
    // Default estimate before PIN entered
    deliveryFeeInr = subtotalInr >= 1500 ? 0 : 110;
  }

  let discountInr = 0;
  let appliedCoupon: ValidatedCartResult['appliedCoupon'];
  let couponError: string | undefined;

  if (couponCode && couponCode.trim().length > 0) {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = db.coupons.find(
      (c) => c.code.toUpperCase() === normalizedCode && c.isActive
    );
    if (!coupon) {
      couponError = `Coupon code "${normalizedCode}" is invalid or expired.`;
    } else if (subtotalInr < coupon.minOrderInr) {
      couponError = `Coupon "${coupon.code}" requires a minimum order subtotal of ₹${coupon.minOrderInr}.`;
    } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      couponError = `Coupon "${coupon.code}" has reached its usage limit.`;
    } else {
      if (coupon.discountType === 'FLAT_INR') {
        discountInr = Math.min(subtotalInr + deliveryFeeInr, coupon.discountValue);
      } else {
        const rawDiscount = roundInr((subtotalInr * coupon.discountValue) / 100);
        discountInr = coupon.maxDiscountInr
          ? Math.min(rawDiscount, coupon.maxDiscountInr)
          : rawDiscount;
      }
      appliedCoupon = {
        code: coupon.code,
        description: coupon.description,
        discountInr,
      };
    }
  }

  const totalInr = Math.max(0, roundInr(subtotalInr + taxInr + deliveryFeeInr - discountInr));

  return {
    isValid: errors.length === 0 && lineItems.length > 0,
    errors,
    warnings,
    lineItems,
    subtotalInr,
    taxInr,
    deliveryFeeInr,
    discountInr,
    totalInr,
    appliedCoupon,
    couponError,
    pinCheck,
  };
}

export function generateSandboxSignature(orderId: string, paymentId: string): string {
  const secret = process.env.RAZORPAY_KEY_SECRET || process.env.SESSION_SECRET || 'lastcry_sandbox_secret_key';
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

export function verifyPaymentSignature(
  providerOrderId: string,
  providerPaymentId: string,
  signature: string
): boolean {
  if (!providerOrderId || !providerPaymentId || !signature) return false;
  const expected = generateSandboxSignature(providerOrderId, providerPaymentId);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch {
    return false;
  }
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pinCode: string;
  };
  deliveryInstructions?: string;
  deliveryMethod: 'STANDARD_SURFACE' | 'PRIORITY_LOCAL_COURIER';
  couponCode?: string;
  items: CartClientItemInput[];
  userId?: string;
  idempotencyKey?: string;
}

export function createCheckoutOrder(input: CreateOrderInput): {
  success: boolean;
  error?: string;
  order?: OrderRecord;
  sandboxSignatureHint?: string;
} {
  if (!input.customerName || input.customerName.trim().length < 2) {
    return { success: false, error: 'Please provide the recipient or coordinator full name.' };
  }
  if (!input.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail)) {
    return { success: false, error: 'Please provide a valid email address for order confirmation.' };
  }
  if (!input.customerPhone || input.customerPhone.replace(/\D/g, '').length < 10) {
    return { success: false, error: 'Please provide a valid 10-digit contact phone number.' };
  }
  if (!input.shippingAddress?.line1 || !input.shippingAddress?.city || !input.shippingAddress?.state) {
    return { success: false, error: 'Please complete the delivery street address, city, and state.' };
  }

  const cartValidation = validateAndCalculateCart(
    input.items,
    input.shippingAddress.pinCode,
    input.couponCode,
    input.deliveryMethod
  );

  if (!cartValidation.isValid) {
    return {
      success: false,
      error: cartValidation.errors[0] || 'Cart validation failed. Please review your items and PIN code.',
    };
  }

  const db = getDb();
  const idemKey = input.idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Idempotency check
  const existingOrder = db.orders.find(
    (o) => o.paymentDetails.idempotencyKey === idemKey
  );
  if (existingOrder) {
    return { success: true, order: existingOrder };
  }

  // Reserve inventory atomically
  for (const line of cartValidation.lineItems) {
    if (line.itemType === 'PRODUCT' && line.productId) {
      const prod = db.products.find((p) => p.id === line.productId);
      if (prod) {
        const available = prod.stockQuantity - prod.reservedQuantity;
        if (available < line.quantity) {
          return {
            success: false,
            error: `Insufficient stock for ${prod.name}. Available: ${available}.`,
          };
        }
        prod.reservedQuantity += line.quantity;
      }
    }
  }

  const seq = 1000 + db.orders.length + 1;
  const orderNumber = `LC-2026-${seq}`;
  const providerOrderId = `order_rcp_${Date.now()}_${seq}`;
  const isLiveConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.PAYMENT_SANDBOX_MODE !== 'true'
  );

  const now = new Date().toISOString();
  const estimatedWindow =
    input.deliveryMethod === 'PRIORITY_LOCAL_COURIER' && cartValidation.pinCheck?.priorityWindow
      ? cartValidation.pinCheck.priorityWindow
      : cartValidation.pinCheck?.estimatedWindow || '1–2 business days';

  const newOrder: OrderRecord = {
    id: `ord-${Date.now()}`,
    orderNumber,
    userId: input.userId,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: input.customerPhone.trim(),
    shippingAddress: {
      line1: input.shippingAddress.line1.trim(),
      line2: input.shippingAddress.line2?.trim(),
      city: input.shippingAddress.city.trim(),
      state: input.shippingAddress.state.trim(),
      pinCode: input.shippingAddress.pinCode.trim(),
    },
    deliveryInstructions: input.deliveryInstructions?.trim(),
    deliveryMethod: input.deliveryMethod,
    estimatedDeliveryWindow: estimatedWindow,
    currencyCode: 'INR',
    subtotalInr: cartValidation.subtotalInr,
    taxInr: cartValidation.taxInr,
    deliveryFeeInr: cartValidation.deliveryFeeInr,
    discountInr: cartValidation.discountInr,
    totalInr: cartValidation.totalInr,
    couponCode: cartValidation.appliedCoupon?.code,
    orderStatus: 'PENDING_PAYMENT',
    paymentStatus: 'PENDING',
    fulfilmentStatus: 'RESERVED',
    paymentDetails: {
      provider: isLiveConfigured ? 'RAZORPAY_LIVE' : 'RAZORPAY_SANDBOX',
      providerOrderId,
      idempotencyKey: idemKey,
      signatureVerified: false,
      isSandbox: !isLiveConfigured,
    },
    internalNotes: [],
    statusHistory: [
      {
        timestamp: now,
        orderStatus: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        fulfilmentStatus: 'RESERVED',
        actor: input.customerEmail.trim().toLowerCase(),
        note: 'Order created and stock reserved pending server-side payment verification.',
      },
    ],
    items: cartValidation.lineItems.map((li, idx) => ({
      id: `oi-${seq}-${idx + 1}`,
      itemType: li.itemType,
      productId: li.productId,
      ritualKitId: li.ritualKitId,
      slug: li.slug,
      title: li.title,
      sku: li.sku,
      variantId: li.variantId,
      variantLabel: li.variantLabel,
      quantity: li.quantity,
      unitPriceInr: li.unitPriceInr,
      gstPercent: li.gstPercent,
      taxAmountInr: li.taxAmountInr,
      lineTotalInr: li.lineSubtotalInr,
      optionalSelectedIds: li.optionalSelectedIds,
      kitContentsSummary: li.kitContentsSummary,
    })),
    isSampleData: false,
    createdAt: now,
    updatedAt: now,
  };

  db.orders.unshift(newOrder);
  saveDb(db);

  return {
    success: true,
    order: newOrder,
  };
}

export function processPaymentVerification(params: {
  orderNumber: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
  simulateFailure?: boolean;
  failureReason?: string;
}): {
  success: boolean;
  error?: string;
  order?: OrderRecord;
} {
  const db = getDb();
  const order = db.orders.find(
    (o) =>
      o.orderNumber === params.orderNumber &&
      o.paymentDetails.providerOrderId === params.providerOrderId
  );

  if (!order) {
    return { success: false, error: 'Order or payment reference not found.' };
  }

  // Idempotent guard: already paid
  if (order.paymentStatus === 'PAID' && order.paymentDetails.signatureVerified) {
    return { success: true, order };
  }

  const now = new Date().toISOString();

  if (params.simulateFailure) {
    // Release reserved stock and mark payment failed
    if (order.fulfilmentStatus === 'RESERVED') {
      for (const item of order.items) {
        if (item.itemType === 'PRODUCT' && item.productId) {
          const prod = db.products.find((p) => p.id === item.productId);
          if (prod) {
            prod.reservedQuantity = Math.max(0, prod.reservedQuantity - item.quantity);
          }
        }
      }
    }
    order.orderStatus = 'PAYMENT_FAILED';
    order.paymentStatus = 'FAILED';
    order.fulfilmentStatus = 'UNFULFILLED';
    order.paymentDetails.failureReason =
      params.failureReason || 'Payment declined or cancelled during authorization.';
    order.updatedAt = now;
    order.statusHistory.push({
      timestamp: now,
      orderStatus: 'PAYMENT_FAILED',
      paymentStatus: 'FAILED',
      fulfilmentStatus: 'UNFULFILLED',
      actor: 'PAYMENT_GATEWAY',
      note: order.paymentDetails.failureReason,
    });
    saveDb(db);
    return {
      success: false,
      error: order.paymentDetails.failureReason,
      order,
    };
  }

  // Verify cryptographic HMAC signature
  const isValidSig = verifyPaymentSignature(
    params.providerOrderId,
    params.providerPaymentId,
    params.signature
  );

  if (!isValidSig) {
    return {
      success: false,
      error: 'Payment signature verification failed. Order cannot be marked as paid without valid server signature.',
    };
  }

  // Commit reserved inventory to actual stock deduction
  for (const item of order.items) {
    if (item.itemType === 'PRODUCT' && item.productId) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.reservedQuantity = Math.max(0, prod.reservedQuantity - item.quantity);
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        prod.stockStatus =
          prod.stockQuantity === 0
            ? 'OUT_OF_STOCK'
            : prod.stockQuantity <= prod.lowStockThreshold
            ? 'LOW_STOCK'
            : 'IN_STOCK';
      }
    }
  }

  if (order.couponCode) {
    const coup = db.coupons.find((c) => c.code === order.couponCode);
    if (coup) coup.usedCount += 1;
  }

  order.orderStatus = 'CONFIRMED';
  order.paymentStatus = 'PAID';
  order.fulfilmentStatus = 'PREPARING';
  order.paymentDetails.providerPaymentId = params.providerPaymentId;
  order.paymentDetails.signatureVerified = true;
  order.paymentDetails.failureReason = undefined;
  order.updatedAt = now;

  order.statusHistory.push({
    timestamp: now,
    orderStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    fulfilmentStatus: 'PREPARING',
    actor: 'PAYMENT_VERIFIER',
    note: `Verified payment ${params.providerPaymentId} (${
      order.paymentDetails.isSandbox ? 'Sandbox Mode' : 'Live Mode'
    }). Stock committed.`,
  });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actorEmail: 'SYSTEM_PAYMENT_VERIFIER',
    actorRole: 'SYSTEM',
    action: 'ORDER_STATUS_UPDATE',
    entityType: 'Order',
    entityId: order.orderNumber,
    summary: `Payment ${params.providerPaymentId} verified via HMAC-SHA256; order ${order.orderNumber} confirmed (₹${order.totalInr}).`,
  });

  saveDb(db);
  return { success: true, order };
}

const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'READY_FOR_DISPATCH', 'CANCELLED', 'REFUND_PENDING'],
  PROCESSING: ['READY_FOR_DISPATCH', 'SHIPPED', 'CANCELLED', 'REFUND_PENDING'],
  READY_FOR_DISPATCH: ['SHIPPED', 'CANCELLED', 'REFUND_PENDING'],
  SHIPPED: ['DELIVERED', 'REFUND_PENDING'],
  DELIVERED: ['REFUND_PENDING'],
  CANCELLED: ['REFUND_PENDING', 'REFUNDED'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],
};

export function transitionOrderStatus(params: {
  orderNumber: string;
  nextStatus: OrderStatus;
  actorEmail: string;
  actorRole: RoleType;
  note?: string;
  trackingNumber?: string;
  carrierName?: string;
}): {
  success: boolean;
  error?: string;
  order?: OrderRecord;
} {
  if (!hasPermission(params.actorRole, 'MANAGE_ORDERS')) {
    return { success: false, error: 'Unauthorized: MANAGE_ORDERS permission required.' };
  }

  const db = getDb();
  const order = db.orders.find((o) => o.orderNumber === params.orderNumber);
  if (!order) {
    return { success: false, error: `Order ${params.orderNumber} not found.` };
  }

  const allowed = ALLOWED_ORDER_TRANSITIONS[order.orderStatus] || [];
  if (!allowed.includes(params.nextStatus) && order.orderStatus !== params.nextStatus) {
    return {
      success: false,
      error: `Invalid order state transition from ${order.orderStatus} to ${params.nextStatus}.`,
    };
  }

  if (params.nextStatus === 'REFUNDED' && !hasPermission(params.actorRole, 'APPROVE_REFUNDS')) {
    return {
      success: false,
      error: 'Unauthorized: Financial role permission APPROVE_REFUNDS required to finalize refunds.',
    };
  }

  const now = new Date().toISOString();
  order.orderStatus = params.nextStatus;

  if (params.nextStatus === 'PROCESSING') order.fulfilmentStatus = 'PREPARING';
  if (params.nextStatus === 'READY_FOR_DISPATCH') order.fulfilmentStatus = 'READY_FOR_DISPATCH';
  if (params.nextStatus === 'SHIPPED') {
    order.fulfilmentStatus = 'IN_TRANSIT';
    order.shipmentDetails = {
      carrierName: params.carrierName || order.shipmentDetails?.carrierName || 'BlueDart Surface/Air',
      trackingNumber: params.trackingNumber || order.shipmentDetails?.trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
      dispatchedAt: now,
    };
  }
  if (params.nextStatus === 'DELIVERED') {
    order.fulfilmentStatus = 'DELIVERED';
    if (order.shipmentDetails) {
      order.shipmentDetails.deliveredAt = now;
    }
  }
  if (params.nextStatus === 'CANCELLED') {
    order.fulfilmentStatus = 'CANCELLED';
  }
  if (params.nextStatus === 'REFUND_PENDING') {
    order.paymentStatus = 'REFUND_PENDING';
    if (!order.refundDetails) {
      order.refundDetails = {
        refundId: `rfnd_${Date.now()}`,
        amountInr: order.totalInr,
        reason: params.note || 'Refund initiated.',
        status: 'PENDING_APPROVAL',
        requestedAt: now,
      };
    }
  }
  if (params.nextStatus === 'REFUNDED') {
    order.paymentStatus = 'REFUNDED';
    if (order.refundDetails) {
      order.refundDetails.status = 'PROCESSED';
      order.refundDetails.processedAt = now;
    }
  }

  if (params.note) {
    order.internalNotes.push(`[${now.slice(0, 10)} ${params.actorEmail}]: ${params.note}`);
  }

  order.updatedAt = now;
  order.statusHistory.push({
    timestamp: now,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    fulfilmentStatus: order.fulfilmentStatus,
    actor: params.actorEmail,
    note: params.note || `Order status updated to ${params.nextStatus}`,
  });

  const auditAction: AuditLogRecord['action'] =
    params.nextStatus === 'REFUNDED' ? 'REFUND_APPROVAL' : 'ORDER_STATUS_UPDATE';

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: now,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: auditAction,
    entityType: 'Order',
    entityId: order.orderNumber,
    summary: `Transitioned ${order.orderNumber} to ${params.nextStatus}.${params.note ? ` Note: ${params.note}` : ''}`,
  });

  saveDb(db);
  return { success: true, order };
}

const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  CUSTOMER: ['VIEW_OWN_ORDERS', 'MANAGE_OWN_PROFILE', 'MANAGE_OWN_ADDRESSES'],
  ADMIN: [
    'MANAGE_PRODUCTS',
    'MANAGE_INVENTORY',
    'MANAGE_ORDERS',
    'APPROVE_REFUNDS',
    'MANAGE_SUPPLIERS',
    'MANAGE_DELIVERY_ZONES',
    'MANAGE_CONTENT',
    'VIEW_AUDIT_LOGS',
  ],
  OPERATIONS_MANAGER: [
    'MANAGE_PRODUCTS',
    'MANAGE_INVENTORY',
    'MANAGE_ORDERS',
    'MANAGE_SUPPLIERS',
    'MANAGE_DELIVERY_ZONES',
  ],
  CONTENT_REVIEWER: ['MANAGE_CONTENT', 'MANAGE_PRODUCTS'],
  FINANCE_AUDITOR: ['APPROVE_REFUNDS', 'VIEW_AUDIT_LOGS', 'MANAGE_ORDERS'],
};

export function hasPermission(role: RoleType | undefined | null, permission: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}
