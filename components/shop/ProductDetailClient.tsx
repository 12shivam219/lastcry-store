'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Heart,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Minus,
  Plus,
} from 'lucide-react';
import { ProductRecord, SupplierRecord, RitualKitRecord } from '@/lib/db/types';
import { PinCodeCheckResult } from '@/lib/db/store';
import { useStore } from '@/components/providers/StoreContext';
import ProductCard from '@/components/ui/ProductCard';
import RitualKitCard from '@/components/ui/RitualKitCard';

interface ProductDetailClientProps {
  product: Omit<ProductRecord, 'costPriceInr'>;
  supplier?: SupplierRecord;
  relatedProducts: Omit<ProductRecord, 'costPriceInr'>[];
  suggestedKits: RitualKitRecord[];
}

export default function ProductDetailClient({
  product,
  supplier,
  relatedProducts,
  suggestedKits,
}: ProductDetailClientProps) {
  const { addToCart, wishlistIds, toggleWishlist, pinCode, setPinCode } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [localPinDraft, setLocalPinDraft] = useState<string | null>(null);
  const [productPinCheck, setProductPinCheck] = useState<PinCodeCheckResult | null>(null);

  const localPin = localPinDraft !== null ? localPinDraft : pinCode;
  const setLocalPin = (val: string) => setLocalPinDraft(val);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const activePrice = selectedVariant
    ? selectedVariant.sellingPriceInr
    : product.sellingPriceInr;
  const activeMrp = selectedVariant ? selectedVariant.mrpInr : product.mrpInr;
  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;

  const baseAvail = Math.max(0, product.stockQuantity - product.reservedQuantity);
  const availableStock = selectedVariant
    ? Math.min(baseAvail, selectedVariant.stockQuantity)
    : baseAvail;

  const isSaved = wishlistIds.includes(product.id);

  useEffect(() => {
    if (!pinCode || pinCode.length !== 6) return;
    let cancelled = false;
    fetch(
      `/api/pincode?pin=${encodeURIComponent(pinCode)}&product=${encodeURIComponent(
        product.slug
      )}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setProductPinCheck(data);
      })
      .catch(() => {
        // Ignore
      });
    return () => {
      cancelled = true;
    };
  }, [pinCode, product.slug]);

  const handlePinCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinCode(localPin);
    setLocalPinDraft(null);
  };

  const designationText =
    product.designation === 'ESSENTIAL'
      ? 'Commonly Essential Item'
      : product.designation === 'REGION_DEPENDENT'
      ? 'Region-Dependent Customary Item'
      : 'Optional Addition';

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#6E6A63] flex flex-wrap items-center gap-1.5">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop" className="hover:underline">
          Catalogue
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/categories/${product.categorySlug}`} className="hover:underline">
          {product.categoryName}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#1C1B19]">{product.name}</span>
      </nav>

      {/* Main Split-Column Product Module */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        {/* Left Column: Product Gallery & Provenance */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-[#DFD8CC] bg-[#F2EDE4]">
            <Image
              src={product.images[0]?.url || '/assets/products/cotton-shroud.svg'}
              alt={product.images[0]?.altText || product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          <div className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] px-4 py-3 text-xs text-[#5C5852] flex flex-wrap items-center justify-between gap-2">
            <span>
              Asset Notice: Studio architectural placeholder illustration (Verified specifications below).
            </span>
            <span className="font-mono tabular-nums">HSN: {product.hsnCode}</span>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8">
          <div className="space-y-2 border-b border-[#E5DEC9] pb-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
              <span>{product.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">SKU: {activeSku}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-[#2E473B]">{designationText}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold leading-snug text-[#1C1B19]">
              {product.name}
            </h1>

            <p className="text-sm leading-relaxed text-[#4E4B45]">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing & Stock Status */}
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl font-semibold tabular-nums text-[#1C1B19]">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                {activeMrp > activePrice && (
                  <span className="font-mono text-sm tabular-nums text-[#7A756D] line-through">
                    MRP ₹{activeMrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E6A63]">
                Applicable GST: {product.gstPercent}% (Calculated transparently in cart)
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium text-[#1C1B19] tabular-nums">
                {availableStock === 0
                  ? 'Currently Out of Stock'
                  : availableStock <= product.lowStockThreshold
                  ? `Low Stock (${availableStock} units available)`
                  : `In Stock (${availableStock} units ready)`}
              </p>
              <p className="text-[11px] text-[#5C5852]">{product.estimatedDispatch}</p>
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1C1B19]">
                Select Configuration / Variant
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`rounded-md border p-3 text-left transition-colors ${
                      selectedVariantId === variant.id
                        ? 'border-[#2E473B] bg-[#EFEBE2]'
                        : 'border-[#DFD8CC] bg-white hover:border-[#B6935A]'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#1C1B19]">{variant.name}</p>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-[#4E4B45]">
                      ₹{variant.sellingPriceInr.toLocaleString('en-IN')} · {variant.stockQuantity} in stock
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Primary Purchase Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex items-center rounded-md border border-[#CFC7B8] bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3 py-2.5 text-[#1C1B19] hover:bg-[#EFEBE2]"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-4 font-mono text-sm font-medium tabular-nums text-[#1C1B19]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                aria-label="Increase quantity"
                className="px-3 py-2.5 text-[#1C1B19] hover:bg-[#EFEBE2]"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={availableStock === 0 || Boolean(productPinCheck?.productRestricted)}
              onClick={() =>
                addToCart(
                  {
                    itemType: 'PRODUCT',
                    productId: product.id,
                    variantId: selectedVariantId || undefined,
                    quantity,
                  },
                  product.name
                )
              }
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#2E473B] px-6 py-3 text-sm font-medium text-[#FAF8F5] hover:bg-[#23372D] disabled:bg-[#CFC7B8] disabled:text-[#6E6A63] transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {availableStock === 0
                  ? 'Out of Stock'
                  : productPinCheck?.productRestricted
                  ? 'Not Deliverable to Selected PIN'
                  : 'Add to Cart'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id, product.name)}
              aria-label={isSaved ? 'Remove from saved items' : 'Save for later'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#CFC7B8] bg-white text-[#1C1B19] hover:bg-[#EFEBE2]"
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-[#8C3B2B] text-[#8C3B2B]' : ''}`} />
            </button>
          </div>

          {/* PIN-Code Delivery Eligibility & Estimate */}
          <div className="rounded-lg border border-[#E5DEC9] bg-[#F5F1E8] p-4 space-y-3">
            <form onSubmit={handlePinCheckSubmit} className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#2E473B] shrink-0" />
              <label htmlFor="pdp-pin-input" className="text-xs font-medium text-[#1C1B19] shrink-0">
                Delivery PIN:
              </label>
              <input
                id="pdp-pin-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={localPin}
                onChange={(e) => setLocalPin(e.target.value.replace(/\D/g, ''))}
                className="w-28 rounded border border-[#CFC7B8] bg-white px-2.5 py-1 font-mono text-xs tabular-nums text-[#1C1B19]"
              />
              <button
                type="submit"
                className="rounded bg-[#1C1B19] px-3 py-1 text-xs font-medium text-[#FAF8F5] hover:bg-[#3A3732]"
              >
                Check
              </button>
            </form>

            {productPinCheck && (
              <div className="text-xs">
                {productPinCheck.isServiceable ? (
                  <div className="flex items-start gap-2 text-[#2E473B]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-medium">
                        Eligible for delivery to {productPinCheck.pinCode} ({productPinCheck.zone?.city})
                      </p>
                      <p className="text-[#4E4B45]">
                        {productPinCheck.estimatedWindow} · Free standard delivery above ₹
                        {productPinCheck.freeDeliveryThresholdInr}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded border border-[#D99B8C] bg-[#FDF2EF] p-2.5 text-[#8C3B2B]"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      {productPinCheck.restrictionReason || productPinCheck.estimatedWindow}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verified Cultural / Tradition Qualification Box */}
          <div className="rounded-lg border border-[#E5DEC9] bg-white p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1B19]">
              <ShieldCheck className="h-4 w-4 text-[#2E473B]" />
              <span>Cultural &amp; Regional Context Note (Reviewed by {product.reviewedBy})</span>
            </div>
            <p className="text-xs leading-relaxed text-[#4E4B45]">
              {product.traditionNotes}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Specifications, Return Policy & Legal Seller Information */}
      <div className="grid grid-cols-1 gap-8 border-t border-[#E5DEC9] pt-12 lg:grid-cols-3">
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Product Description &amp; Materials
          </h2>
          <p className="text-xs leading-relaxed text-[#4E4B45]">{product.fullDescription}</p>
          <div className="pt-2 space-y-1 text-xs text-[#5C5852]">
            <p>
              <strong>Materials:</strong> {product.materials}
            </p>
            <p>
              <strong>Dimensions:</strong> {product.dimensionsCm}
            </p>
            <p>
              <strong>Package Weight:</strong> {product.weightGrams} grams
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Contents &amp; Specifications
          </h2>
          <dl className="divide-y divide-[#EFEAE1] rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] text-xs">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-[#6E6A63]">{key}</dt>
                <dd className="font-medium text-[#1C1B19] text-right">{val}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 px-4 py-2.5">
              <dt className="text-[#6E6A63]">Return Eligibility</dt>
              <dd className="font-medium text-[#1C1B19] text-right">
                {product.returnEligibility}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Supplier &amp; Legal Disclosure
          </h2>
          <div className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-4 space-y-2 text-xs text-[#4E4B45]">
            {supplier ? (
              <>
                <p>
                  <strong>Verified Partner:</strong> {supplier.name}
                </p>
                <p>
                  <strong>Legal Entity:</strong> {supplier.legalBusinessName}
                </p>
                <p>
                  <strong>GSTIN:</strong>{' '}
                  <span className="font-mono tabular-nums">{supplier.gstin}</span>
                </p>
                <p>
                  <strong>Origin / Fulfilment Hub:</strong> {supplier.city}, {supplier.state}
                </p>
                <p>
                  <strong>Country of Origin:</strong> India
                </p>
              </>
            ) : (
              <p>Fulfilled via LastCry Regional Hub Network (India).</p>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Curated Ritual Kits */}
      {suggestedKits.length > 0 && (
        <section className="space-y-6 border-t border-[#E5DEC9] pt-12">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
              Also Included in These Curated Ritual Kits
            </h2>
            <p className="text-xs text-[#5C5852]">
              If you need a complete set of supplies rather than a single item, explore these contributor-reviewed kits.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {suggestedKits.map((kit) => (
              <RitualKitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 border-t border-[#E5DEC9] pt-12">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
            Related Essentials &amp; Memorial Products
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
