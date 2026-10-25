import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDb,
  getPublishedProducts,
  getPublishedRitualKits,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import CatalogBrowser from '@/components/shop/CatalogBrowser';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const category = db.categories.find((c) => c.slug === slug);
  if (!category) {
    return { title: 'Category Not Found | LastCry' };
  }
  return {
    title: category.seoTitle || `${category.name} | LastCry`,
    description: category.seoDescription || category.description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const category = db.categories.find(
    (c) => c.slug === slug && c.publicationStatus === 'PUBLISHED'
  );

  if (!category) {
    notFound();
  }

  const products = getPublishedProducts().map(stripCostPriceForPublic);
  const kits = slug === 'curated-ritual-kits' ? getPublishedRitualKits() : [];

  return (
    <CatalogBrowser
      title={category.name}
      subtitle={category.description}
      initialProducts={products}
      initialKits={kits}
      categories={db.categories}
      traditions={db.traditions}
      defaultCategorySlug={slug === 'curated-ritual-kits' ? '' : category.slug}
      showKitsFirst={slug === 'curated-ritual-kits'}
    />
  );
}
