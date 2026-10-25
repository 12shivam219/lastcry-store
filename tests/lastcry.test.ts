import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resetSeedData,
  getPublishedProducts,
  checkPinCodeServiceability,
  calculateKitComposition,
  validateAndCalculateCart,
  createCheckoutOrder,
  processPaymentVerification,
  generateSandboxSignature,
  transitionOrderStatus,
  hasPermission,
  stripCostPriceForPublic,
} from '../lib/db/store.ts';

test('LastCry Automated Test Suite — Unit, Integration & Security Workflows', async (t) => {
  // Reset seed data before running test suite
  resetSeedData('test-runner@lastcry.in');

  await t.test('1. Catalogue & Cultural Review Gate: Unreviewed drafts never appear in public catalogue and costPriceInr is stripped', () => {
    const published = getPublishedProducts();
    assert.ok(published.length >= 9, 'Should return all reviewed and published products');

    const draftFound = published.some((p) => p.publicationStatus === 'DRAFT' || p.reviewStatus !== 'REVIEWED_VERIFIED');
    assert.equal(draftFound, false, 'Draft or unreviewed products must never be exposed publicly');

    const publicProd = stripCostPriceForPublic(published[0]);
    assert.equal('costPriceInr' in publicProd, false, 'Cost price must be stripped from public product objects');
  });

  await t.test('2. PIN-Code Coverage & Perishable Floral Restriction Engine', () => {
    // Valid Mumbai PIN
    const mumbaiCheck = checkPinCodeServiceability('400001');
    assert.equal(mumbaiCheck.isServiceable, true);
    assert.equal(mumbaiCheck.priorityAvailable, true);
    assert.equal(mumbaiCheck.standardFeeInr, 90);

    // Perishable flowers in Chennai (600004 - supported for non-perishables, restricted for fresh flowers)
    const chennaiFlowerCheck = checkPinCodeServiceability(
      '600004',
      'serene-white-chrysanthemum-mogra-eucalyptus-tribute'
    );
    assert.equal(chennaiFlowerCheck.productRestricted, true);
    assert.equal(chennaiFlowerCheck.isServiceable, false);

    // Unsupported PIN prefix
    const unsupportedCheck = checkPinCodeServiceability('999999');
    assert.equal(unsupportedCheck.isServiceable, false);
  });

  await t.test('3. Ritual Kit Builder Composition & Dynamic Optional Pricing', () => {
    const baseKit = calculateKitComposition('antyeshti-immediate-preparation-essential-kit', []);
    assert.ok(baseKit);
    assert.equal(baseKit.basePriceInr, 1850);
    assert.equal(baseKit.optionalAdditionsTotalInr, 0);
    assert.equal(baseKit.configuredPriceInr, 1850);
    assert.equal(baseKit.includedCount, 3);

    // Add optional Brass Akhand Diya (₹920) + Teak Memorial Frame (₹1850)
    const customizedKit = calculateKitComposition(
      'antyeshti-immediate-preparation-essential-kit',
      ['ki-101-opt-1', 'ki-101-opt-2'],
      '400001'
    );
    assert.ok(customizedKit);
    assert.equal(customizedKit.optionalSelectedCount, 2);
    assert.equal(customizedKit.optionalAdditionsTotalInr, 920 + 1850);
    assert.equal(customizedKit.configuredPriceInr, 1850 + 920 + 1850);
    assert.equal(customizedKit.estimatedGstInr, 231); // 5% of 4620
  });

  await t.test('4. Cart Calculations, GST, Free Shipping Threshold & Coupon Validation', () => {
    // 2x Unbleached Kora Cotton Shroud (2 * ₹650 = ₹1300, GST 5% = ₹65) in Mumbai (400001, fee ₹90 since < ₹1500)
    const cart1 = validateAndCalculateCart(
      [{ itemType: 'PRODUCT', productId: 'prod-kora-shroud', quantity: 2 }],
      '400001',
      undefined,
      'STANDARD_SURFACE'
    );
    assert.equal(cart1.isValid, true);
    assert.equal(cart1.subtotalInr, 1300);
    assert.equal(cart1.taxInr, 65);
    assert.equal(cart1.deliveryFeeInr, 90);
    assert.equal(cart1.totalInr, 1455);

    // ApplyCOMMUNITY10 coupon (10% off ₹1300 = ₹130 discount)
    const cartWithCoupon = validateAndCalculateCart(
      [{ itemType: 'PRODUCT', productId: 'prod-kora-shroud', quantity: 2 }],
      '400001',
      'COMMUNITY10',
      'STANDARD_SURFACE'
    );
    assert.equal(cartWithCoupon.discountInr, 130);
    assert.equal(cartWithCoupon.totalInr, 1300 + 65 + 90 - 130);

    // Free delivery threshold check (>= ₹1500 in Mumbai)
    const cartFreeShip = validateAndCalculateCart(
      [{ itemType: 'PRODUCT', productId: 'prod-teak-memorial-frame', quantity: 1 }],
      '400001',
      undefined,
      'STANDARD_SURFACE'
    );
    assert.equal(cartFreeShip.subtotalInr, 1850);
    assert.equal(cartFreeShip.deliveryFeeInr, 0);
  });

  await t.test('5. Checkout Order Creation, Atomic Inventory Reservation & Payment Failure Rollback', () => {
    const beforeProd = getPublishedProducts().find((p) => p.id === 'prod-kora-shroud')!;
    const initialReserved = beforeProd.reservedQuantity;

    const orderResult = createCheckoutOrder({
      customerName: 'Test Coordinator',
      customerEmail: 'coordinator@example.in',
      customerPhone: '+91 98200 12345',
      shippingAddress: {
        line1: '10, Heritage Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
      },
      deliveryMethod: 'STANDARD_SURFACE',
      items: [{ itemType: 'PRODUCT', productId: 'prod-kora-shroud', quantity: 2 }],
    });

    assert.equal(orderResult.success, true);
    assert.ok(orderResult.order);
    assert.equal(orderResult.order.orderStatus, 'PENDING_PAYMENT');
    assert.equal(orderResult.order.paymentStatus, 'PENDING');
    assert.equal(orderResult.order.fulfilmentStatus, 'RESERVED');

    // Verify stock was reserved
    const afterReserveProd = getPublishedProducts().find((p) => p.id === 'prod-kora-shroud')!;
    assert.equal(afterReserveProd.reservedQuantity, initialReserved + 2);

    // Simulate payment failure and confirm order is NOT marked paid and reserved stock is released
    const failedVerification = processPaymentVerification({
      orderNumber: orderResult.order.orderNumber,
      providerOrderId: orderResult.order.paymentDetails.providerOrderId,
      providerPaymentId: 'pay_failed_test',
      signature: 'invalid_sig',
      simulateFailure: true,
      failureReason: 'Bank declined transaction',
    });

    assert.equal(failedVerification.success, false);
    assert.equal(failedVerification.order?.paymentStatus, 'FAILED');
    assert.equal(failedVerification.order?.orderStatus, 'PAYMENT_FAILED');

    const afterFailProd = getPublishedProducts().find((p) => p.id === 'prod-kora-shroud')!;
    assert.equal(
      afterFailProd.reservedQuantity,
      initialReserved,
      'Reserved stock must be released when payment fails'
    );
  });

  await t.test('6. Signed Payment Verification, Idempotency & Order Lifecycle Transitions', () => {
    const orderRes = createCheckoutOrder({
      customerName: 'Verified Customer',
      customerEmail: 'verified@example.in',
      customerPhone: '+91 98200 54321',
      shippingAddress: {
        line1: '22, Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400020',
      },
      deliveryMethod: 'STANDARD_SURFACE',
      items: [{ itemType: 'RITUAL_KIT', ritualKitId: 'kit-antyeshti-essential', quantity: 1 }],
    });

    assert.ok(orderRes.order);
    const ordNum = orderRes.order.orderNumber;
    const provOrdId = orderRes.order.paymentDetails.providerOrderId;
    const paymentId = 'pay_verified_999';

    // Forged signature must be rejected
    const forgedAttempt = processPaymentVerification({
      orderNumber: ordNum,
      providerOrderId: provOrdId,
      providerPaymentId: paymentId,
      signature: 'forged_hmac_signature',
    });
    assert.equal(forgedAttempt.success, false);

    // Valid HMAC-SHA256 signature must confirm order
    const validSignature = generateSandboxSignature(provOrdId, paymentId);
    const verifiedAttempt = processPaymentVerification({
      orderNumber: ordNum,
      providerOrderId: provOrdId,
      providerPaymentId: paymentId,
      signature: validSignature,
    });
    assert.equal(verifiedAttempt.success, true);
    assert.equal(verifiedAttempt.order?.paymentStatus, 'PAID');
    assert.equal(verifiedAttempt.order?.orderStatus, 'CONFIRMED');

    // Transition order lifecycle states & enforce RBAC on refunds
    const shipTransition = transitionOrderStatus({
      orderNumber: ordNum,
      nextStatus: 'READY_FOR_DISPATCH',
      actorEmail: 'ops@lastcry.in',
      actorRole: 'OPERATIONS_MANAGER',
    });
    assert.equal(shipTransition.success, true);

    const refundReq = transitionOrderStatus({
      orderNumber: ordNum,
      nextStatus: 'REFUND_PENDING',
      actorEmail: 'ops@lastcry.in',
      actorRole: 'OPERATIONS_MANAGER',
      note: 'Customer requested refund',
    });
    assert.equal(refundReq.success, true);

    // OPERATIONS_MANAGER cannot finalize REFUNDED (requires FINANCE_AUDITOR or ADMIN)
    const unauthorizedRefund = transitionOrderStatus({
      orderNumber: ordNum,
      nextStatus: 'REFUNDED',
      actorEmail: 'ops@lastcry.in',
      actorRole: 'OPERATIONS_MANAGER',
    });
    assert.equal(unauthorizedRefund.success, false);

    // FINANCE_AUDITOR can approve refund
    const authorizedRefund = transitionOrderStatus({
      orderNumber: ordNum,
      nextStatus: 'REFUNDED',
      actorEmail: 'finance@lastcry.in',
      actorRole: 'FINANCE_AUDITOR',
    });
    assert.equal(authorizedRefund.success, true);
    assert.equal(authorizedRefund.order?.paymentStatus, 'REFUNDED');
  });

  await t.test('7. Role-Based Access Control (RBAC) Matrix Verification', () => {
    assert.equal(hasPermission('CUSTOMER', 'MANAGE_PRODUCTS'), false);
    assert.equal(hasPermission('CUSTOMER', 'APPROVE_REFUNDS'), false);
    assert.equal(hasPermission('OPERATIONS_MANAGER', 'MANAGE_INVENTORY'), true);
    assert.equal(hasPermission('OPERATIONS_MANAGER', 'APPROVE_REFUNDS'), false);
    assert.equal(hasPermission('FINANCE_AUDITOR', 'APPROVE_REFUNDS'), true);
    assert.equal(hasPermission('ADMIN', 'APPROVE_REFUNDS'), true);
  });

  // Restore clean seed baseline after tests
  resetSeedData('test-runner@lastcry.in');
});
