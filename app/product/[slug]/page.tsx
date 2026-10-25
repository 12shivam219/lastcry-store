import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDb,
  getPublishedProducts,
  getPublishedRitualKits,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import ProductDetailClient from '@/components/shop/ProductDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getPublishedProducts().find((p) => p.slug === slug);
  if (!product) {
    return { title: 'Product Not Found | LastCry' };
  }
  return {
    title: product.seoTitle || `${product.name} | LastCry`,
    description: product.seoDescription || product.shortDescription,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.shortDescription,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const publishedProducts = getPublishedProducts();
  const product = publishedProducts.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const publicProduct = stripCostPriceForPublic(product);
  const supplier = db.suppliers.find((s) => s.id === product.supplierId);
  const relatedProducts = publishedProducts
    .filter((p) => p.id !== product.id && p.groupSlug === product.groupSlug)
    .slice(0, 3)
    .map(stripCostPriceForPublic);

  const suggestedKits = getPublishedRitualKits().filter(
    (k) =>
      k.includedItems.some((i) => i.productId === product.id) ||
      k.optionalItems.some((i) => i.productId === product.id)
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const availableStock = Math.max(0, product.stockQuantity - product.reservedQuantity);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku,
    description: product.shortDescription,
    image: `${baseUrl}${product.images[0]?.url || '/assets/products/cotton-shroud.svg'}`,
    brand: {
      '@type': 'Brand',
      name: 'LastCry',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.sellingPriceInr,
      availability:
        availableStock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailClient
        product={publicProduct}
        supplier={supplier}
        relatedProducts={relatedProducts}
        suggestedKits={suggestedKits}
      />
    </>
  );
}
