import React from 'react';
import type { Metadata } from 'next';
import {
  getDb,
  getPublishedProducts,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import CatalogBrowser from '@/components/shop/CatalogBrowser';

export const metadata: Metadata = {
  title: 'Last-Rites Essentials & Customary Textiles | LastCry',
  description:
    'Shop unbleached handspun cotton shrouds, white Kafan sets, unglazed terracotta vessels, copper kalash, and verified ritual supplies.',
};

export default function ShopEssentialsPage() {
  const db = getDb();
  const products = getPublishedProducts().map(stripCostPriceForPublic);

  return (
    <CatalogBrowser
      title="Last-Rites Essentials & Customary Textiles"
      subtitle="Foundational unbleached cotton shrouds, unstitched Kafan sets, unglazed terracotta vessels, botanical samagri, and prayer accessories with verified specifications and clear essential vs. optional labels."
      initialProducts={products}
      initialKits={[]}
      categories={db.categories}
      traditions={db.traditions}
      defaultGroupSlug="essentials"
    />
  );
}
