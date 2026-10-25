import { MetadataRoute } from 'next';
import { getPublishedProducts, getPublishedRitualKits, getDb } from '@/lib/db/store';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
  const db = getDb();
  const products = getPublishedProducts();
  const kits = getPublishedRitualKits();

  const staticPaths = [
    '',
    '/shop',
    '/shop/essentials',
    '/shop/ritual-kits',
    '/shop/memorials',
    '/shop/condolence-gifts',
    '/services',
    '/guidance',
    '/about',
    '/contact',
    '/faq',
    '/shipping-policy',
    '/returns-refunds',
    '/privacy-policy',
    '/terms',
    '/grievance-redressal',
    '/track-order',
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${baseUrl}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1.0 : 0.8,
  }));

  for (const cat of db.categories) {
    entries.push({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const prod of products) {
    entries.push({
      url: `${baseUrl}/product/${prod.slug}`,
      lastModified: new Date(prod.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const kit of kits) {
    entries.push({
      url: `${baseUrl}/ritual-kits/${kit.slug}`,
      lastModified: new Date(kit.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  for (const article of db.guidanceArticles) {
    entries.push({
      url: `${baseUrl}/guidance/${article.slug}`,
      lastModified: new Date(article.lastReviewedDate),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
