'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  History,
  AlertTriangle,
} from 'lucide-react';
import { RitualKitRecord } from '@/lib/db/types';
import { useStore } from '@/components/providers/StoreContext';

interface RitualKitBuilderClientProps {
  kit: RitualKitRecord;
  allKits: RitualKitRecord[];
}

export default function RitualKitBuilderClient({
  kit,
  allKits,
}: RitualKitBuilderClientProps) {
  const { addToCart, pinCode, pinCheck, setPinCode } = useStore();
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<string[]>([]);
  const [pinInput, setPinInput] = useState(pinCode);
  const [quantity, setQuantity] = useState(1);

  const toggleOptionalItem = (optId: string) => {
    setSelectedOptionalIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  const optionalSelectedTotal = useMemo(() => {
    return kit.optionalItems
      .filter((opt) => selectedOptionalIds.includes(opt.id))
      .reduce((sum, item) => sum + item.unitPriceInr * item.quantity, 0);
  }, [kit.optionalItems, selectedOptionalIds]);

  const unitKitTotal = kit.basePriceInr + optionalSelectedTotal;
  const lineTotal = unitKitTotal * quantity;
  const estimatedGst = Math.round(lineTotal * (kit.gstPercent / 100) * 100) / 100;

  const hasPerishableFlowerSelected = useMemo(() => {
    return kit.optionalItems.some(
      (opt) =>
        selectedOptionalIds.includes(opt.id) &&
        opt.productSlug === 'serene-white-chrysanthemum-mogra-eucalyptus-tribute'
    );
  }, [kit.optionalItems, selectedOptionalIds]);

  const flowerRestrictedInPin =
    hasPerishableFlowerSelected &&
    pinCheck &&
    pinCheck.isServiceable &&
    !pinCheck.zone?.supportsPerishableFlowers;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb & Kit Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#6E6A63] flex flex-wrap items-center gap-1.5">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop/ritual-kits" className="hover:underline">
            Curated Ritual Kits
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1C1B19]">{kit.name}</span>
        </nav>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#5C5852]">Switch Kit:</span>
          <div className="flex flex-wrap gap-1.5">
            {allKits.map((other) => (
              <Link
                key={other.id}
                href={`/ritual-kits/${other.slug}`}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  other.id === kit.id
                    ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                    : 'border border-[#DFD8CC] bg-[#F3EFE6] text-[#3A3732] hover:border-[#2E473B]'
                }`}
              >
                {other.sku}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Kit Header & Cultural Qualification */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
              <span>{kit.intendedTradition}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">SKU: {kit.sku}</span>
              <span aria-hidden="true">·</span>
              <span>Version {kit.versionNumber} (Reviewed {kit.lastReviewedAt})</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
              {kit.name}
            </h1>

            <p className="text-sm leading-relaxed text-[#4E4B45]">
              {kit.fullDescription}
            </p>
          </div>

          <div className="rounded-lg border border-[#DFD8CC] bg-[#F4F0E6] p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1B19]">
              <ShieldCheck className="h-4 w-4 text-[#2E473B]" />
              <span>Regional Applicability &amp; Contributor Review</span>
            </div>
            <p className="text-xs leading-relaxed text-[#4E4B45]">
              <strong>Regional Scope:</strong> {kit.regionalApplicability}
            </p>
            <p className="text-xs text-[#5C5852]">
              <strong>Reviewed by:</strong> {kit.reviewedBy} ({kit.reviewerCredentials})
            </p>
          </div>

          {/* Step 1: Included Core Items Checklist */}
          <div className="space-y-4">
            <div className="border-b border-[#E5DEC9] pb-2">
              <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                1. Included Core Items ({kit.includedItems.length} Items Included in Base Price)
              </h2>
              <p className="text-xs text-[#5C5852]">
                Every item below is included in the standard kit and packed in individually labelled pouches.
              </p>
            </div>

            <div className="divide-y divide-[#E5DEC9] rounded-lg border border-[#E5DEC9] bg-[#FAF8F5]">
              {kit.includedItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
                      <span className="font-mono font-semibold text-[#2E473B]">
                        Qty: {item.quantity}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.sku}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.designation === 'ESSENTIAL'
                          ? 'Commonly Essential'
                          : 'Region-Dependent'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1C1B19]">
                      <Link href={`/product/${item.productSlug}`} className="hover:underline">
                        {item.productName}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#5C5852]">{item.intendedUseNote}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs font-medium text-[#2E473B]">Included</span>
                    <p className="font-mono text-[11px] tabular-nums text-[#6E6A63]">
                      (Individual value ₹{item.unitPriceInr})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Optional Additions Selector */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-[#E5DEC9] pb-2">
              <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                2. Optional Additions (Customize Your Kit)
              </h2>
              <p className="text-xs text-[#5C5852]">
                These items are optional and not mandatory. Select any items your family wishes to include.
              </p>
            </div>

            <div className="space-y-3">
              {kit.optionalItems.map((opt) => {
                const isChecked = selectedOptionalIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start justify-between gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-[#2E473B] bg-[#EFEBE2]'
                        : 'border-[#E5DEC9] bg-[#FAF8F5] hover:border-[#B6935A]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOptionalItem(opt.id)}
                        className="mt-1 h-4 w-4 rounded border-[#CFC7B8] accent-[#2E473B]"
                      />
                      <div className="space-y-1">
                        <span className="block text-sm font-semibold text-[#1C1B19]">
                          {opt.productName}
                        </span>
                        <span className="block text-xs text-[#5C5852]">
                          {opt.intendedUseNote}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#1C1B19]">
                        + ₹{opt.unitPriceInr.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[11px] text-[#6E6A63]">Optional</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Version & Review Audit History */}
          <div className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1B19]">
              <History className="h-4 w-4 text-[#2E473B]" />
              <span>Checklist Version &amp; Cultural Review Log</span>
            </div>
            <ul className="space-y-2 text-xs text-[#5C5852]">
              {kit.versionHistory.map((v) => (
                <li key={v.version} className="flex flex-col sm:flex-row sm:gap-3">
                  <span className="font-mono tabular-nums text-[#1C1B19] shrink-0">
                    v{v.version} ({v.date}) · {v.editor}:
                  </span>
                  <span>{v.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Kit Summary & Add to Cart Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#F2EDE4]">
            <Image
              src={kit.imageUrl}
              alt={kit.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          <div className="space-y-3 border-b border-[#E5DEC9] pb-4">
            <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
              Configured Kit Summary
            </h2>

            <div className="space-y-1.5 text-xs text-[#4E4B45]">
              <div className="flex justify-between">
                <span>Standard Kit ({kit.includedItems.length} core items)</span>
                <span className="font-mono tabular-nums">
                  ₹{kit.basePriceInr.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedOptionalIds.length > 0 && (
                <div className="flex justify-between text-[#2E473B]">
                  <span>Selected Optional Additions ({selectedOptionalIds.length})</span>
                  <span className="font-mono tabular-nums">
                    + ₹{optionalSelectedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#6E6A63]">
                <span>Applicable GST ({kit.gstPercent}%)</span>
                <span className="font-mono tabular-nums">
                  ₹{estimatedGst.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="border-t border-[#E5DEC9] pt-3 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-[#1C1B19]">
                Kit Subtotal (Excl. Tax)
              </span>
              <span className="font-mono text-2xl font-semibold tabular-nums text-[#1C1B19]">
                ₹{lineTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Local Availability Check */}
          <div className="space-y-2.5 rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-3.5 text-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPinCode(pinInput);
              }}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-[#2E473B] shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="PIN code"
                className="w-28 rounded border border-[#CFC7B8] bg-white px-2.5 py-1 font-mono text-xs tabular-nums"
              />
              <button
                type="submit"
                className="rounded bg-[#1C1B19] px-3 py-1 text-xs font-medium text-[#FAF8F5]"
              >
                Verify PIN
              </button>
            </form>

            {pinCheck && (
              <div>
                {flowerRestrictedInPin ? (
                  <div className="flex items-start gap-2 text-[#8C3B2B]">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      The optional fresh floral garland is only deliverable in Mumbai, Pune, Delhi NCR, and Bengaluru. Uncheck the floral option to ship this kit to {pinCheck.pinCode}.
                    </p>
                  </div>
                ) : pinCheck.isServiceable ? (
                  <div className="flex items-start gap-2 text-[#2E473B]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      Available for {pinCheck.pinCode}: {pinCheck.estimatedWindow}
                    </p>
                  </div>
                ) : (
                  <p className="text-[#8C3B2B]">{pinCheck.estimatedWindow}</p>
                )}
              </div>
            )}
          </div>

          {/* Quantity & Add Complete Kit to Cart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="kit-qty" className="font-medium text-[#1C1B19]">
                Kit Quantity:
              </label>
              <select
                id="kit-qty"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded border border-[#CFC7B8] bg-white px-3 py-1 font-mono text-xs"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Kit' : 'Kits'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={Boolean(flowerRestrictedInPin)}
              onClick={() =>
                addToCart(
                  {
                    itemType: 'RITUAL_KIT',
                    ritualKitId: kit.id,
                    quantity,
                    selectedOptionalIds,
                  },
                  kit.name
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#2E473B] px-5 py-3.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#23372D] disabled:bg-[#CFC7B8] disabled:text-[#6E6A63] transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                Add Complete Selection to Cart (₹{lineTotal.toLocaleString('en-IN')})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
