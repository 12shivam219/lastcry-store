'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Tag,
  MapPin,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreContext';

export default function CartPage() {
  const {
    cartItems,
    validatedCart,
    isValidatingCart,
    pinCode,
    couponCode,
    deliveryMethod,
    setPinCode,
    setCouponCode,
    setDeliveryMethod,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  const [pinInput, setPinInput] = useState(pinCode);
  const [couponInput, setCouponInput] = useState(couponCode);

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8 text-center space-y-5">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#EFEBE2] text-[#2E473B]">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Your Shopping Cart Is Empty
        </h1>
        <p className="mx-auto max-w-md text-sm text-[#5C5852]">
          Browse our verified last-rites essentials, curated ritual kits, memorial portrait frames, or condolence care parcels.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/shop/essentials"
            className="rounded-md bg-[#2E473B] px-5 py-2.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D]"
          >
            Shop Essentials
          </Link>
          <Link
            href="/shop/ritual-kits"
            className="rounded-md border border-[#2E473B] px-5 py-2.5 text-xs font-medium text-[#2E473B] hover:bg-[#EFEBE2]"
          >
            Explore Ritual Kits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-[#E5DEC9] pb-5">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Shopping Cart
        </h1>
        <p className="mt-1 text-xs text-[#5C5852]">
          Prices, stock availability, GST, and PIN-code delivery fees are validated on the server before checkout.
        </p>
      </div>

      {validatedCart && validatedCart.errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-[#D99B8C] bg-[#FDF2EF] p-4 text-xs text-[#8C3B2B] space-y-1"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Please resolve the following before proceeding to checkout:</span>
          </div>
          <ul className="list-disc pl-6 space-y-0.5">
            {validatedCart.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left: Itemized Cart List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-[#E5DEC9] rounded-lg border border-[#E5DEC9] bg-[#FAF8F5]">
            {(validatedCart?.lineItems || []).map((item, idx) => (
              <div key={item.key} className="p-5 flex flex-col sm:flex-row gap-5">
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-md bg-[#F2EDE4]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="112px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
                    <span>{item.itemType === 'RITUAL_KIT' ? 'Curated Ritual Kit' : 'Individual Product'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">SKU: {item.sku}</span>
                    <span aria-hidden="true">·</span>
                    <span>GST: {item.gstPercent}%</span>
                  </div>

                  <h2 className="text-base font-semibold text-[#1C1B19]">
                    <Link
                      href={
                        item.itemType === 'RITUAL_KIT'
                          ? `/ritual-kits/${item.slug}`
                          : `/product/${item.slug}`
                      }
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </h2>

                  {item.variantLabel && (
                    <p className="text-xs text-[#4E4B45]">
                      Configuration: <strong>{item.variantLabel}</strong>
                    </p>
                  )}

                  {item.kitContentsSummary && item.kitContentsSummary.length > 0 && (
                    <div className="rounded border border-[#E5DEC9] bg-[#F5F1E8] p-3 text-xs text-[#5C5852] space-y-1">
                      <p className="font-medium text-[#1C1B19]">Kit Contents Included:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {item.kitContentsSummary.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex items-center rounded border border-[#CFC7B8] bg-white">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(idx, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.title}`}
                        className="px-2.5 py-1.5 text-[#1C1B19] hover:bg-[#EFEBE2]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 font-mono text-xs font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(idx, Math.min(item.maxAvailable, item.quantity + 1))
                        }
                        aria-label={`Increase quantity of ${item.title}`}
                        className="px-2.5 py-1.5 text-[#1C1B19] hover:bg-[#EFEBE2]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold tabular-nums text-[#1C1B19]">
                          ₹{item.lineSubtotalInr.toLocaleString('en-IN')}
                        </p>
                        <p className="font-mono text-[11px] tabular-nums text-[#6E6A63]">
                          + ₹{item.taxAmountInr.toLocaleString('en-IN')} GST
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(idx)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="rounded p-1.5 text-[#6E6A63] hover:bg-[#EFEBE2] hover:text-[#8C3B2B]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Server-Validated Order Summary, PIN & Coupon Module */}
        <div className="lg:col-span-4 space-y-5 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Order Summary &amp; Delivery
          </h2>

          {/* PIN Code & Delivery Method */}
          <div className="space-y-3 border-b border-[#E5DEC9] pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPinCode(pinInput);
              }}
              className="space-y-1.5"
            >
              <label htmlFor="cart-pin" className="block text-xs font-medium text-[#1C1B19]">
                Destination PIN Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#2E473B]" />
                  <input
                    id="cart-pin"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded border border-[#CFC7B8] bg-white pl-8 pr-2.5 py-1.5 font-mono text-xs tabular-nums"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded bg-[#1C1B19] px-3 py-1.5 text-xs font-medium text-[#FAF8F5]"
                >
                  Update
                </button>
              </div>
            </form>

            {validatedCart?.pinCheck?.isServiceable && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-[#2E473B] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{validatedCart.pinCheck.zone?.zoneName}</span>
                </p>

                <div className="space-y-1.5">
                  <label className="flex items-start gap-2 rounded border border-[#DFD8CC] bg-white p-2.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'STANDARD_SURFACE'}
                      onChange={() => setDeliveryMethod('STANDARD_SURFACE')}
                      className="mt-0.5 accent-[#2E473B]"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-[#1C1B19] block">
                        Standard Hub Delivery
                      </span>
                      <span className="text-[11px] text-[#5C5852]">
                        {validatedCart.pinCheck.estimatedWindow} (Free above ₹
                        {validatedCart.pinCheck.freeDeliveryThresholdInr})
                      </span>
                    </div>
                  </label>

                  {validatedCart.pinCheck.priorityAvailable && (
                    <label className="flex items-start gap-2 rounded border border-[#DFD8CC] bg-white p-2.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'PRIORITY_LOCAL_COURIER'}
                        onChange={() => setDeliveryMethod('PRIORITY_LOCAL_COURIER')}
                        className="mt-0.5 accent-[#2E473B]"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-[#1C1B19] block">
                          Priority Local Courier (₹{validatedCart.pinCheck.priorityFeeInr})
                        </span>
                        <span className="text-[11px] text-[#5C5852]">
                          {validatedCart.pinCheck.priorityWindow}
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Coupon Code Input */}
          <div className="space-y-2 border-b border-[#E5DEC9] pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCouponCode(couponInput.trim().toUpperCase());
              }}
              className="space-y-1.5"
            >
              <label htmlFor="cart-coupon" className="block text-xs font-medium text-[#1C1B19]">
                Assistance / Shipping Code (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6E6A63]" />
                  <input
                    id="cart-coupon"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. FREESHIP or COMMUNITY10"
                    className="w-full rounded border border-[#CFC7B8] bg-white pl-8 pr-2.5 py-1.5 font-mono text-xs uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded border border-[#2E473B] px-3 py-1.5 text-xs font-medium text-[#2E473B] hover:bg-[#EFEBE2]"
                >
                  Apply
                </button>
              </div>
            </form>

            {validatedCart?.appliedCoupon && (
              <div className="flex items-center justify-between rounded bg-[#EFEBE2] px-3 py-2 text-xs text-[#2E473B]">
                <span>
                  Applied <strong>{validatedCart.appliedCoupon.code}</strong> (-₹
                  {validatedCart.appliedCoupon.discountInr})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponInput('');
                    setCouponCode('');
                  }}
                  className="underline"
                >
                  Remove
                </button>
              </div>
            )}

            {validatedCart?.couponError && (
              <p className="text-xs text-[#8C3B2B]">{validatedCart.couponError}</p>
            )}
          </div>

          {/* Totals Breakdown */}
          {validatedCart && (
            <div className="space-y-2 text-xs text-[#4E4B45]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums text-[#1C1B19]">
                  ₹{validatedCart.subtotalInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total GST (Itemized 0%–12%)</span>
                <span className="font-mono tabular-nums text-[#1C1B19]">
                  ₹{validatedCart.taxInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-mono tabular-nums text-[#1C1B19]">
                  {validatedCart.deliveryFeeInr === 0
                    ? 'FREE (₹0)'
                    : `₹${validatedCart.deliveryFeeInr.toLocaleString('en-IN')}`}
                </span>
              </div>
              {validatedCart.discountInr > 0 && (
                <div className="flex justify-between text-[#2E473B] font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono tabular-nums">
                    - ₹{validatedCart.discountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="border-t border-[#E5DEC9] pt-3 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-[#1C1B19]">Final Payable Total</span>
                <span className="font-mono text-xl font-semibold tabular-nums text-[#1C1B19]">
                  ₹{validatedCart.totalInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <Link
            href={validatedCart?.isValid ? '/checkout' : '#'}
            aria-disabled={!validatedCart?.isValid || isValidatingCart}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-medium transition-colors ${
              validatedCart?.isValid
                ? 'bg-[#2E473B] text-[#FAF8F5] hover:bg-[#23372D]'
                : 'pointer-events-none bg-[#CFC7B8] text-[#6E6A63]'
            }`}
          >
            <span>Proceed to Discreet Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
