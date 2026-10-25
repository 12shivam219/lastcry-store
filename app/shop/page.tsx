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
  title: 'Complete Catalogue — Last-Rites Essentials, Kits & Memorials | LastCry',
  description:
    'Browse verified last-rites essentials, shrouds, curated ritual kits, memorial portrait frames, and condolence gifts with transparent INR pricing.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tradition?: string; category?: string }>;
}) {
  const params = await searchParams;
  const db = getDb();
  const products = getPublishedProducts().map(stripCostPriceForPublic);
  const kits = getPublishedRitualKits();

  return (
    <CatalogBrowser
      title="Complete Verified Catalogue"
      subtitle="Browse individual last-rites essentials, curated ritual kits, handcrafted memorial frames, and understated condolence gifts. Filter by category, optional tradition navigation, or requirement designation."
      initialProducts={products}
      initialKits={kits}
      categories={db.categories}
      traditions={db.traditions}
      defaultCategorySlug={params.category || ''}
      defaultTraditionSlug={params.tradition || ''}
      defaultSearchQuery={params.q || ''}
    />
  );
}
