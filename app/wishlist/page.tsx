'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck } from 'lucide-react';
import { ProductRecord } from '@/lib/db/types';
import { useStore } from '@/components/providers/StoreContext';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const { wishlistIds } = useStore();
  const [products, setProducts] = useState<Omit<ProductRecord, 'costPriceInr'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/catalog?pageSize=50')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
        <div className="space-y-1.5">
          <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
            Saved Items &amp; Wishlist ({savedProducts.length})
          </h1>
          <p className="text-xs text-[#5C5852]">
            Keep track of memorial frames, registers, or essentials you are reviewing with family members.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-[#DFD8CC] bg-[#F4F0E6] px-3.5 py-2 text-xs text-[#3A3732]">
          <ShieldCheck className="h-4 w-4 text-[#2E473B] shrink-0" />
          <span>Zero bereavement retargeting: Your saved list is never shared with ad networks.</span>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-xs text-[#5C5852]">Loading saved items...</p>
      ) : savedProducts.length === 0 ? (
        <div className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-12 text-center space-y-4">
          <Heart className="mx-auto h-8 w-8 text-[#6E6A63]" />
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
            No Saved Products Yet
          </h2>
          <p className="mx-auto max-w-md text-xs text-[#5C5852]">
            Click the heart icon on any product card to save items here for quiet comparison.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-md bg-[#2E473B] px-5 py-2.5 text-xs font-medium text-[#FAF8F5]"
          >
            Browse Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
