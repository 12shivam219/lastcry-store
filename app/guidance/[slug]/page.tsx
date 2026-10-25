import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, BookOpen } from 'lucide-react';
import {
  getDb,
  getPublishedProducts,
  getPublishedRitualKits,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import ProductCard from '@/components/ui/ProductCard';
import RitualKitCard from '@/components/ui/RitualKitCard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getDb().guidanceArticles.find((a) => a.slug === slug);
  if (!article) {
    return { title: 'Article Not Found | LastCry' };
  }
  return {
    title: `${article.title} | LastCry Guidance Centre`,
    description: article.summary,
    alternates: {
      canonical: `/guidance/${article.slug}`,
    },
  };
}

export default async function GuidanceArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const article = db.guidanceArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedProducts = getPublishedProducts()
    .filter((p) => article.relatedProductSlugs.includes(p.slug))
    .map(stripCostPriceForPublic);

  const relatedKits = getPublishedRitualKits().filter((k) =>
    article.relatedKitSlugs.includes(k.slug)
  );

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div>
        <Link
          href="/guidance"
          className="inline-flex items-center gap-1.5 text-xs text-[#5C5852] hover:text-[#1C1B19]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Guidance Centre</span>
        </Link>
      </div>

      <article className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-10 space-y-8">
        <header className="border-b border-[#E5DEC9] pb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
            <BookOpen className="h-3.5 w-3.5 text-[#2E473B]" />
            <span>{article.applicableTradition}</span>
            <span aria-hidden="true">·</span>
            <span>Region: {article.applicableRegion}</span>
            <span aria-hidden="true">·</span>
            <span>Last Reviewed: {article.lastReviewedDate}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-[#1C1B19]">
            {article.title}
          </h1>

          <p className="text-base leading-relaxed text-[#4E4B45]">
            {article.summary}
          </p>

          <div className="pt-2 text-xs text-[#5C5852]">
            Reviewed by: <strong>{article.reviewerName}</strong> ({article.reviewerCredentials})
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="space-y-8">
          {article.contentSections.map((sec, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-sm leading-relaxed text-[#3A3732]">
                  {p}
                </p>
              ))}
              {sec.bulletPoints && (
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#3A3732] pt-1">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Sources & Informational Disclaimer */}
        <footer className="border-t border-[#E5DEC9] pt-6 space-y-4">
          <div className="text-xs text-[#5C5852] space-y-1">
            <p className="font-semibold text-[#1C1B19]">References &amp; Documentation Sources:</p>
            <ul className="list-disc pl-5">
              {article.sources.map((src, i) => (
                <li key={i}>{src}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-[#DFD8CC] bg-[#F4F0E6] p-4 flex items-start gap-2.5 text-xs text-[#3A3732]">
            <ShieldCheck className="h-4 w-4 text-[#2E473B] shrink-0 mt-0.5" />
            <p>
              <strong>Informational Disclaimer:</strong> {article.disclaimer}
            </p>
          </div>
        </footer>
      </article>

      {relatedKits.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
            Relevant Curated Ritual Kits
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {relatedKits.map((kit) => (
              <RitualKitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
            Relevant Essentials &amp; Memorial Items
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
