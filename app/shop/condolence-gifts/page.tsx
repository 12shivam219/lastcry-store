import React from 'react';
import type { Metadata } from 'next';
import {
  getDb,
  getPublishedProducts,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import CatalogBrowser from '@/components/shop/CatalogBrowser';

export const metadata: Metadata = {
  title: 'Condolence Care Parcels, Sympathy Cards & Floral Tributes | LastCry',
  description:
    'Send understated household care parcels, cotton-paper letterpress sympathy cards, and plastic-free white floral tributes.',
};

export default function ShopCondolenceGiftsPage() {
  const db = getDb();
  const products = getPublishedProducts().map(stripCostPriceForPublic);

  return (
    <CatalogBrowser
      title="Condolence Gifts & Floral Tributes"
      subtitle="Understated, strictly vegetarian household care parcels, letterpress sympathy cards on cotton paper, and plastic-free white floral tributes delivered with discretion."
      initialProducts={products}
      initialKits={[]}
      categories={db.categories}
      traditions={db.traditions}
      defaultGroupSlug="condolence-gifts"
    />
  );
}
