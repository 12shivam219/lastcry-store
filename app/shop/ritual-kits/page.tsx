import React from 'react';
import type { Metadata } from 'next';
import {
  getDb,
  getPublishedProducts,
  getPublishedRitualKits,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import CatalogBrowser from '@/components/shop/CatalogBrowser';

export const metadata: Metadata = {
  title: 'Curated Ritual Kits & Interactive Kit Builder | LastCry',
  description:
    'Explore contributor-reviewed ritual kits for Hindu, Muslim, Christian, Sikh, and secular remembrance observances with item-by-item checklists.',
};

export default function ShopRitualKitsPage() {
  const db = getDb();
  const products = getPublishedProducts().map(stripCostPriceForPublic);
  const kits = getPublishedRitualKits();

  return (
    <CatalogBrowser
      title="Curated Ritual Kits"
      subtitle="Thoughtfully assembled, contributor-reviewed kits for specific traditions and regional customs. Every kit displays its complete item-by-item checklist and lets you add or remove optional items before ordering."
      initialProducts={products}
      initialKits={kits}
      categories={db.categories}
      traditions={db.traditions}
      showKitsFirst={true}
    />
  );
}
