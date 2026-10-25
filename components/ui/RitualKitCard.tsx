'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { RitualKitRecord } from '@/lib/db/types';
import { useStore } from '@/components/providers/StoreContext';

interface RitualKitCardProps {
  kit: RitualKitRecord;
}

export default function RitualKitCard({ kit }: RitualKitCardProps) {
  const { addToCart } = useStore();
  const includedCount = kit.includedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="flex flex-col justify-between rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 transition-colors hover:border-[#B6935A]">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="relative h-36 w-full sm:w-44 shrink-0 overflow-hidden rounded-md bg-[#F2EDE4]">
            <Image
              src={kit.imageUrl}
              alt={kit.imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>

          <div className="space-y-2">
            {/* Clean Unboxed Metadata */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
              <span>{kit.intendedTradition}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{includedCount} Core Items</span>
              <span aria-hidden="true">·</span>
              <span>Reviewed v{kit.versionNumber}</span>
            </div>

            <h3 className="font-serif text-xl font-semibold leading-snug text-[#1C1B19]">
              <Link href={`/ritual-kits/${kit.slug}`} className="hover:underline">
                {kit.name}
              </Link>
            </h3>

            <p className="text-xs leading-relaxed text-[#5C5852]">
              {kit.shortDescription}
            </p>
          </div>
        </div>

        {/* Complete Included Contents Preview */}
        <div className="border-t border-[#EFEAE1] pt-3.5 space-y-2">
          <p className="text-xs font-medium text-[#3A3732]">
            Included Core Items ({includedCount}) &amp; Optional Additions ({kit.optionalItems.length} available):
          </p>
          <ul className="space-y-1 text-xs text-[#5C5852]">
            {kit.includedItems.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <span>
                  <strong className="font-mono tabular-nums text-[#1C1B19]">{item.quantity}x</strong>{' '}
                  {item.productName}
                </span>
                <span className="text-[11px] text-[#6E6A63] shrink-0">
                  {item.designation === 'ESSENTIAL' ? 'Essential' : 'Regional'}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-[#6E6A63]">
            Regional Scope: {kit.regionalApplicability}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[#E5DEC9] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg font-semibold tabular-nums text-[#1C1B19]">
              ₹{kit.basePriceInr.toLocaleString('en-IN')}
            </span>
            <span className="font-mono text-xs tabular-nums text-[#7A756D] line-through">
              MRP ₹{kit.mrpInr.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-[#5C5852]">{kit.estimatedDispatch}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/ritual-kits/${kit.slug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#2E473B] bg-transparent px-3.5 py-2 text-xs font-medium text-[#2E473B] hover:bg-[#EFEBE2] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Customize in Kit Builder</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() =>
              addToCart(
                {
                  itemType: 'RITUAL_KIT',
                  ritualKitId: kit.id,
                  quantity: 1,
                  selectedOptionalIds: [],
                },
                kit.name
              )
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2E473B] px-3.5 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D] transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add Standard Kit</span>
          </button>
        </div>
      </div>
    </article>
  );
}
