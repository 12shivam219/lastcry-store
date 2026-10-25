import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { getDb } from '@/lib/db/store';

export const metadata: Metadata = {
  title: 'Guidance Centre — Practical & Cultural Guides | LastCry',
  description:
    'Read calm, contributor-reviewed articles on understanding ritual kit contents, regional variations across India, and arranging deliveries for family members.',
};

export default function GuidanceIndexPage() {
  const db = getDb();
  const articles = db.guidanceArticles;

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="border-b border-[#E5DEC9] pb-6 space-y-3">
        <p className="text-xs font-medium text-[#2E473B]">
          Informational &amp; Contributor-Reviewed Guides
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
          LastCry Guidance Centre
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#5C5852]">
          Clear, practical information to help families understand ritual kit contents, regional differences across Indian traditions, and bereavement etiquette.
        </p>
      </div>

      <div className="rounded-lg border border-[#DFD8CC] bg-[#F4F0E6] p-5 flex items-start gap-3 text-xs text-[#3A3732]">
        <ShieldCheck className="h-4 w-4 text-[#2E473B] shrink-0 mt-0.5" />
        <p>
          <strong>Editorial Principle:</strong> Our articles do not claim religious authority or offer legal advice. Purchasing products from LastCry is never required to honour a deceased person properly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
              <BookOpen className="h-3.5 w-3.5 text-[#2E473B]" />
              <span>{article.applicableTradition}</span>
              <span aria-hidden="true">·</span>
              <span>Region: {article.applicableRegion}</span>
              <span aria-hidden="true">·</span>
              <span>Last Reviewed: {article.lastReviewedDate}</span>
            </div>

            <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
              <Link href={`/guidance/${article.slug}`} className="hover:underline">
                {article.title}
              </Link>
            </h2>

            <p className="text-sm leading-relaxed text-[#4E4B45]">
              {article.summary}
            </p>

            <div className="border-t border-[#EFEAE1] pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-[#5C5852]">
                Reviewed by: <strong>{article.reviewerName}</strong> ({article.reviewerCredentials})
              </span>

              <Link
                href={`/guidance/${article.slug}`}
                className="inline-flex items-center gap-1.5 font-medium text-[#2E473B] hover:underline"
              >
                <span>Read Complete Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
