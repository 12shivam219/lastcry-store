import React from 'react';
import type { Metadata } from 'next';
import {
  getDb,
  getPublishedProducts,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import CatalogBrowser from '@/components/shop/CatalogBrowser';

export const metadata: Metadata = {
  title: 'Memorial Portrait Frames & Archival Remembrance Registers | LastCry',
  description:
    'Handcrafted solid Indian teakwood memorial portrait frames and Smyth-sewn archival linen condolence registers for prayer meetings and home remembrance.',
};

export default function ShopMemorialsPage() {
  const db = getDb();
  const products = getPublishedProducts().map(stripCostPriceForPublic);

  return (
    <CatalogBrowser
      title="Memorial Products & Remembrance Keepsakes"
      subtitle="Handcrafted solid Indian teakwood portrait frames with archival acid-free mounts and Smyth-sewn linen condolence registers for prayer meetings and family archives."
      initialProducts={products}
      initialKits={[]}
      categories={db.categories}
      traditions={db.traditions}
      defaultGroupSlug="memorials"
    />
  );
}
