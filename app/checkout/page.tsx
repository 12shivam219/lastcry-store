'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreContext';

interface PaymentChallengeState {
  orderNumber: string;
  provider: string;
  providerOrderId: string;
  amountInr: number;
  isSandbox: boolean;
  sandboxTestCredentials?: {
    providerPaymentId: string;
    signature: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    validatedCart,
    pinCode,
    couponCode,
    deliveryMethod,
    setPinCode,
    setDeliveryMethod,
    clearCart,
    currentUser,
  } = useStore();

  const [customerName, setCustomerName] = useState(
    currentUser?.fullName || 'Ananya Deshmukh'
  );
  const [customerEmail, setCustomerEmail] = useState(
    currentUser?.email || 'ananya.sample@example.in'
  );
  const [customerPhone, setCustomerPhone] = useState(
    currentUser?.phone || '+91 98201 00101'
  );
  const [line1, setLine1] = useState(
    currentUser?.savedAddresses[0]?.line1 || 'Flat 402, Shanti Niketan CHSL, Prabhat Road'
  );
  const [line2, setLine2] = useState(
    currentUser?.savedAddresses[0]?.line2 || 'Deccan Gymkhana'
  );
  const [city, setCity] = useState(currentUser?.savedAddresses[0]?.city || 'Pune');
  const [stateName, setStateName] = useState(
    currentUser?.savedAddresses[0]?.state || 'Maharashtra'
  );
  const [shippingPin, setShippingPin] = useState(pinCode || '411004');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    'Please deliver quietly to the building security desk or call coordinator on arrival.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentChallenge, setPaymentChallenge] =
    useState<PaymentChallengeState | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  useEffect(() => {
    if (shippingPin.length === 6 && shippingPin !== pinCode) {
      setPinCode(shippingPin);
    }
  }, [shippingPin, pinCode, setPinCode]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: {
            line1,
            line2,
            city,
            state: stateName,
            pinCode: shippingPin,
          },
          deliveryInstructions,
          deliveryMethod,
          couponCode,
          items: cartItems,
          userId: currentUser?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCheckoutError(data.error || 'Could not create order. Please review your details.');
        setIsSubmitting(false);
        return;
      }

      setPaymentChallenge({
        orderNumber: data.order.orderNumber,
        provider: data.paymentChallenge.provider,
        providerOrderId: data.paymentChallenge.providerOrderId,
        amountInr: data.paymentChallenge.amountInr,
        isSandbox: data.paymentChallenge.isSandbox,
        sandboxTestCredentials: data.paymentChallenge.sandboxTestCredentials,
      });
    } catch {
      setCheckoutError('Network error while creating payment order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletePaymentVerification = async (simulateFailure: boolean) => {
    if (!paymentChallenge) return;
    setIsVerifyingPayment(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: paymentChallenge.orderNumber,
          providerOrderId: paymentChallenge.providerOrderId,
          providerPaymentId:
            paymentChallenge.sandboxTestCredentials?.providerPaymentId || '',
          signature: paymentChallenge.sandboxTestCredentials?.signature || '',
          simulateFailure,
          failureReason: simulateFailure
            ? 'Customer or issuing bank declined authorization in sandbox test.'
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCheckoutError(
          data.error ||
            'Payment failed. Your order was not marked as paid, and reserved stock has been released. You may safely retry.'
        );
        setPaymentChallenge(null);
        setIsVerifyingPayment(false);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${paymentChallenge.orderNumber}`);
    } catch {
      setCheckoutError('Error communicating with payment verification endpoint.');
      setIsVerifyingPayment(false);
    }
  };

  if (cartItems.length === 0 && !paymentChallenge) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          No Active Items for Checkout
        </h1>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-md bg-[#2E473B] px-5 py-2.5 text-xs font-medium text-[#FAF8F5]"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-5">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C5852] hover:text-[#1C1B19]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1C1B19]">
            Discreet Checkout
          </h1>
        </div>

        <div className="rounded-md border border-[#DFD8CC] bg-[#F4F0E6] px-4 py-2.5 text-xs text-[#3A3732] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#2E473B] shrink-0" />
          <span>
            Minimum-data policy: We never ask for the deceased person&rsquo;s name or cause of death.
          </span>
        </div>
      </div>

      {checkoutError && (
        <div
          role="alert"
          className="rounded-lg border border-[#D99B8C] bg-[#FDF2EF] p-4 text-xs text-[#8C3B2B] flex items-start gap-2.5"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Checkout / Payment Notice</p>
            <p>{checkoutError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left: Delivery & Coordinator Form */}
        <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-6">
          <section className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
              1. Recipient or Family Coordinator Contact
            </h2>
            <p className="text-xs text-[#5C5852]">
              We recommend entering the phone number of a family coordinator, relative, or building desk so delivery updates do not disturb immediate mourners.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="chk-name" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Full Name (Recipient or Coordinator) *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>

              <div>
                <label htmlFor="chk-email" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Email for Receipt &amp; Tracking *
                </label>
                <input
                  id="chk-email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>

              <div>
                <label htmlFor="chk-phone" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  10-Digit Mobile / Contact Number *
                </label>
                <input
                  id="chk-phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
              2. Delivery Address &amp; Discreet Drop-off Instructions
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="chk-line1" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Building, Flat / House No., Street *
                </label>
                <input
                  id="chk-line1"
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="chk-line2" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Locality / Landmark (Optional)
                </label>
                <input
                  id="chk-line2"
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>

              <div>
                <label htmlFor="chk-pin" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  6-Digit PIN Code *
                </label>
                <input
                  id="chk-pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={shippingPin}
                  onChange={(e) => setShippingPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 font-mono text-sm tabular-nums text-[#1C1B19]"
                />
              </div>

              <div>
                <label htmlFor="chk-city" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  City / District *
                </label>
                <input
                  id="chk-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="chk-state" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  State / Union Territory *
                </label>
                <input
                  id="chk-state"
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm text-[#1C1B19]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="chk-notes" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Optional Delivery Instructions (e.g. Gate drop-off, do not ring bell)
                </label>
                <textarea
                  id="chk-notes"
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-xs text-[#1C1B19]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
              3. Delivery Method &amp; Payment Adapter
            </h2>

            {validatedCart?.pinCheck?.isServiceable && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-2.5 rounded-md border border-[#CFC7B8] bg-white p-3.5 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="chk-delivery"
                    checked={deliveryMethod === 'STANDARD_SURFACE'}
                    onChange={() => setDeliveryMethod('STANDARD_SURFACE')}
                    className="mt-0.5 accent-[#2E473B]"
                  />
                  <div>
                    <span className="font-semibold text-[#1C1B19] block">
                      Standard Hub Delivery
                    </span>
                    <span className="text-[#5C5852]">
                      {validatedCart.pinCheck.estimatedWindow}
                    </span>
                  </div>
                </label>

                {validatedCart.pinCheck.priorityAvailable && (
                  <label className="flex items-start gap-2.5 rounded-md border border-[#CFC7B8] bg-white p-3.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="chk-delivery"
                      checked={deliveryMethod === 'PRIORITY_LOCAL_COURIER'}
                      onChange={() => setDeliveryMethod('PRIORITY_LOCAL_COURIER')}
                      className="mt-0.5 accent-[#2E473B]"
                    />
                    <div>
                      <span className="font-semibold text-[#1C1B19] block">
                        Priority Local Courier (+₹{validatedCart.pinCheck.priorityFeeInr})
                      </span>
                      <span className="text-[#5C5852]">
                        {validatedCart.pinCheck.priorityWindow}
                      </span>
                    </div>
                  </label>
                )}
              </div>
            )}

            <div className="rounded-md border border-[#DFD8CC] bg-[#F4F0E6] p-4 text-xs text-[#3A3732] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[#1C1B19]">
                <Lock className="h-4 w-4 text-[#2E473B]" />
                <span>Payment Gateway Integration Status: Sandbox / Development Mode</span>
              </div>
              <p>
                Live Razorpay credentials (<code>RAZORPAY_KEY_ID</code> / <code>RAZORPAY_KEY_SECRET</code>) are not configured in this environment. Clicking below creates a real server-side order in <code>PENDING_PAYMENT</code> state and launches the Sandbox HMAC Signature Verifier so you can test both verified payment confirmation and payment failure handling.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !validatedCart?.isValid}
              className="w-full rounded-md bg-[#2E473B] px-6 py-3.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#23372D] disabled:bg-[#CFC7B8] disabled:text-[#6E6A63] transition-colors"
            >
              {isSubmitting
                ? 'Creating Server Order & Reserving Stock...'
                : `Review & Proceed to Payment (₹${(
                    validatedCart?.totalInr || 0
                  ).toLocaleString('en-IN')})`}
            </button>
          </section>
        </form>

        {/* Right: Order Breakdown */}
        <aside className="lg:col-span-5 space-y-5 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Server-Validated Order Summary
          </h2>

          <div className="divide-y divide-[#E5DEC9] text-xs">
            {(validatedCart?.lineItems || []).map((item) => (
              <div key={item.key} className="py-3 flex justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1C1B19]">
                    {item.quantity}x {item.title}
                  </p>
                  {item.variantLabel && (
                    <p className="text-[11px] text-[#6E6A63]">{item.variantLabel}</p>
                  )}
                </div>
                <span className="font-mono tabular-nums text-[#1C1B19] shrink-0">
                  ₹{item.lineSubtotalInr.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {validatedCart && (
            <div className="border-t border-[#E5DEC9] pt-4 space-y-2 text-xs text-[#4E4B45]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums">
                  ₹{validatedCart.subtotalInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total GST</span>
                <span className="font-mono tabular-nums">
                  ₹{validatedCart.taxInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges ({shippingPin})</span>
                <span className="font-mono tabular-nums">
                  ₹{validatedCart.deliveryFeeInr.toLocaleString('en-IN')}
                </span>
              </div>
              {validatedCart.discountInr > 0 && (
                <div className="flex justify-between text-[#2E473B]">
                  <span>Discount ({validatedCart.appliedCoupon?.code})</span>
                  <span className="font-mono tabular-nums">
                    - ₹{validatedCart.discountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div className="border-t border-[#E5DEC9] pt-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-[#1C1B19]">Total Payable</span>
                <span className="font-mono text-xl font-semibold tabular-nums text-[#1C1B19]">
                  ₹{validatedCart.totalInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Clearly Marked Sandbox Payment Verification Dialog */}
      {paymentChallenge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sandbox-pay-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-lg rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 shadow-2xl space-y-5">
            <div className="border-b border-[#E5DEC9] pb-4">
              <p className="text-xs font-mono uppercase tracking-wider text-[#7A5C3E]">
                SANDBOX PAYMENT GATEWAY ADAPTER ({paymentChallenge.provider})
              </p>
              <h2
                id="sandbox-pay-title"
                className="mt-1 font-serif text-2xl font-semibold text-[#1C1B19]"
              >
                Verify Payment for Order {paymentChallenge.orderNumber}
              </h2>
            </div>

            <div className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-4 text-xs space-y-1.5 font-mono">
              <p>Provider Order ID: {paymentChallenge.providerOrderId}</p>
              <p>Amount Payable: ₹{paymentChallenge.amountInr.toLocaleString('en-IN')} INR</p>
              <p>Current Order Status: PENDING_PAYMENT (Inventory Reserved)</p>
            </div>

            <p className="text-xs leading-relaxed text-[#4E4B45]">
              LastCry never marks an order as paid merely because the browser reports success. Choose an outcome below to test server-side HMAC-SHA256 signature verification or payment failure rollback:
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              <button
                type="button"
                disabled={isVerifyingPayment}
                onClick={() => handleCompletePaymentVerification(false)}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2E473B] px-4 py-3 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Authorize &amp; Verify Signed Payment</span>
              </button>

              <button
                type="button"
                disabled={isVerifyingPayment}
                onClick={() => handleCompletePaymentVerification(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#8C3B2B] bg-[#FDF2EF] px-4 py-3 text-xs font-medium text-[#8C3B2B] hover:bg-[#F9E2DC]"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Simulate Payment Failure</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
