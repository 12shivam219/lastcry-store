'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { ProductRecord } from '@/lib/db/types';
import { useStore } from '@/components/providers/StoreContext';

interface ProductCardProps {
  product: Omit<ProductRecord, 'costPriceInr'>;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, wishlistIds, toggleWishlist } = useStore();
  const availableStock = Math.max(0, product.stockQuantity - product.reservedQuantity);
  const isSaved = wishlistIds.includes(product.id);
  const primaryImage = product.images[0] || {
    url: '/assets/products/cotton-shroud.svg',
    altText: product.name,
    isPlaceholder: true,
  };

  const designationLabel =
    product.designation === 'ESSENTIAL'
      ? 'Commonly Essential'
      : product.designation === 'REGION_DEPENDENT'
      ? 'Region-Dependent'
      : 'Optional Item';

  return (
    <article className="group flex flex-col justify-between rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#CFC7B8]">
      <div>
        {/* Product Image Container (65-75% visual lead on neutral warm backdrop) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-[#F2EDE4]">
          <Link href={`/product/${product.slug}`} className="block h-full w-full">
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              referrerPolicy="no-referrer"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id, product.name)}
            aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF8F5]/90 text-[#3A3732] hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-[#8C3B2B] text-[#8C3B2B]' : ''}`} />
          </button>
        </div>

        {/* Clean Unboxed Metadata & Title (Zero-Pill Discipline) */}
        <div className="p-5 pb-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
            <span>{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{designationLabel}</span>
            {product.deliveryEligibility === 'METRO_HUBS_ONLY' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#7A5C3E]">Metro Hubs Only</span>
              </>
            )}
          </div>

          <h3 className="text-base font-semibold leading-snug text-[#1C1B19]">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          <p className="text-xs leading-relaxed text-[#5C5852] line-clamp-2">
            {product.shortDescription}
          </p>
        </div>
      </div>

      {/* Contiguous Price, Stock Status & Action Footer */}
      <div className="px-5 pb-5 pt-2 space-y-3 border-t border-[#EFEAE1]">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold tabular-nums text-[#1C1B19]">
              ₹{product.sellingPriceInr.toLocaleString('en-IN')}
            </span>
            {product.mrpInr > product.sellingPriceInr && (
              <span className="font-mono text-xs tabular-nums text-[#7A756D] line-through">
                MRP ₹{product.mrpInr.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <span className="text-xs text-[#5C5852] tabular-nums">
            {availableStock === 0
              ? 'Out of stock'
              : availableStock <= product.lowStockThreshold
              ? `Low stock (${availableStock} left)`
              : `In stock (${availableStock})`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={availableStock === 0}
            onClick={() =>
              addToCart(
                {
                  itemType: 'PRODUCT',
                  productId: product.id,
                  variantId: product.variants[0]?.id,
                  quantity: 1,
                },
                product.name
              )
            }
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#2E473B] px-4 py-2.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D] disabled:bg-[#CFC7B8] disabled:text-[#6E6A63] transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>

          <Link
            href={`/product/${product.slug}`}
            className="inline-flex items-center justify-center rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3.5 py-2.5 text-xs font-medium text-[#1C1B19] hover:border-[#9A7B4F] transition-colors whitespace-nowrap shrink-0"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
