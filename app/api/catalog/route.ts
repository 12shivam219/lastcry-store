import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  getPublishedProducts,
  getPublishedRitualKits,
  stripCostPriceForPublic,
} from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category') || '';
  const group = searchParams.get('group') || '';
  const tradition = searchParams.get('tradition') || '';
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 100000);
  const inStockOnly = searchParams.get('inStock') === 'true';
  const designation = searchParams.get('designation') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.max(1, Math.min(50, Number(searchParams.get('pageSize') || 12)));

  const db = getDb();
  let products = getPublishedProducts();

  if (q) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.materials.toLowerCase().includes(q)
    );
  }

  if (category) {
    products = products.filter(
      (p) => p.categorySlug === category || p.categoryId === category
    );
  }

  if (group) {
    products = products.filter((p) => p.groupSlug === group);
  }

  if (tradition) {
    products = products.filter((p) => p.traditionSlugs.includes(tradition));
  }

  if (designation) {
    products = products.filter((p) => p.designation === designation);
  }

  products = products.filter(
    (p) => p.sellingPriceInr >= minPrice && p.sellingPriceInr <= maxPrice
  );

  if (inStockOnly) {
    products = products.filter((p) => p.stockQuantity - p.reservedQuantity > 0);
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.sellingPriceInr - b.sellingPriceInr);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.sellingPriceInr - a.sellingPriceInr);
  } else if (sort === 'newest') {
    products.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const totalCount = products.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginated = products
    .slice((page - 1) * pageSize, page * pageSize)
    .map(stripCostPriceForPublic);

  let kits = getPublishedRitualKits();
  if (q) {
    kits = kits.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.shortDescription.toLowerCase().includes(q) ||
        k.intendedTradition.toLowerCase().includes(q)
    );
  }
  if (tradition) {
    kits = kits.filter((k) => k.traditionSlug === tradition);
  }

  return NextResponse.json({
    products: paginated,
    ritualKits: kits,
    categories: db.categories.filter((c) => c.publicationStatus === 'PUBLISHED'),
    traditions: db.traditions,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
    },
  });
}
