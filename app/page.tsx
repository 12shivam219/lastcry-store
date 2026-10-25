import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';
import {
  getDb,
  getPublishedProducts,
  getPublishedRitualKits,
  stripCostPriceForPublic,
} from '@/lib/db/store';
import ProductCard from '@/components/ui/ProductCard';
import RitualKitCard from '@/components/ui/RitualKitCard';

export default function HomePage() {
  const db = getDb();
  const featuredProducts = getPublishedProducts()
    .slice(0, 6)
    .map(stripCostPriceForPublic);
  const featuredKits = getPublishedRitualKits().slice(0, 4);
  const traditions = db.traditions;
  const articles = db.guidanceArticles.slice(0, 4);

  return (
    <main className="space-y-20 pb-20">
      {/* A. Hero Section */}
      <section className="border-b border-[#E5DEC9] bg-[#F5F1E8]">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center space-y-6 lg:col-span-6">
              <p className="text-xs font-medium tracking-wide text-[#2E473B]">
                Thoughtful essentials. Dignified goodbyes.
              </p>

              <h1
                className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-[#1C1B19] sm:text-5xl"
                style={{ textWrap: 'balance' }}
              >
                Everything you need, thoughtfully brought together.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#4E4B45]">
                Find last-rites essentials, thoughtfully curated kits, memorial products, and helpful guidance in one trusted place.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/shop/essentials"
                  className="inline-flex items-center gap-2 rounded-md bg-[#2E473B] px-6 py-3 text-sm font-medium text-[#FAF8F5] hover:bg-[#23372D] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Shop Essentials</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/shop/ritual-kits"
                  className="inline-flex items-center gap-2 rounded-md border border-[#2E473B] bg-transparent px-6 py-3 text-sm font-medium text-[#2E473B] hover:bg-[#EFEBE2] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Ritual Kits</span>
                </Link>
              </div>

              <div className="border-t border-[#DFD8CC] pt-4 text-xs text-[#5C5852] flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Transparent INR pricing</span>
                <span aria-hidden="true">·</span>
                <span>Complete item-by-item kit checklists</span>
                <span aria-hidden="true">·</span>
                <span>No mandatory religious selection</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full min-h-[320px] w-full overflow-hidden rounded-lg border border-[#DFD8CC] bg-[#EFEAE1]">
                <Image
                  src="/assets/products/hero-still-life.svg"
                  alt="Still life of folded unbleached khadi cotton textiles, unlit matte brass lamp, terracotta vessel, and white jasmine flowers on warm stone"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* B. Quick Shopping Choices (Full-width 5-card strip below Hero) */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: 'Essential Products',
                desc: 'Unbleached shrouds, earthen vessels, copper kalash, and preparation supplies.',
                href: '/shop/essentials',
              },
              {
                title: 'Ritual Kits',
                desc: 'Contributor-reviewed kits with full contents lists and optional additions.',
                href: '/shop/ritual-kits',
              },
              {
                title: 'Memorial Products',
                desc: 'Handcrafted solid teakwood portrait frames and archival linen registers.',
                href: '/shop/memorials',
              },
              {
                title: 'Condolence Gifts',
                desc: 'Quiet household care parcels, letterpress sympathy cards, and white florals.',
                href: '/shop/condolence-gifts',
              },
              {
                title: 'Find Local Services',
                desc: 'Enquiry directory for memorial printers, florists, and bereavement support.',
                href: '/services',
              },
            ].map((choice) => (
              <Link
                key={choice.href}
                href={choice.href}
                className="group flex flex-col justify-between rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 transition-colors hover:border-[#2E473B]"
              >
                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-[#1C1B19] group-hover:text-[#2E473B] transition-colors">
                    {choice.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-[#5C5852]">{choice.desc}</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#2E473B]">
                  <span>Browse</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* C. Shop by Tradition */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold text-[#1C1B19]">
              Browse by Tradition or Regional Custom
            </h2>
            <p className="text-sm text-[#5C5852]">
              These collections serve as optional navigation aids—not assertions that all members of a faith follow identical practices. Each collection is reviewed by domain contributors and distinguishes essential, optional, and region-dependent items.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E473B] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Browse all products without selecting a tradition</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {traditions.map((trad) => (
            <Link
              key={trad.id}
              href={`/shop?tradition=${trad.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 transition-colors hover:border-[#9A7B4F]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-[#6E6A63]">
                  <span>Reviewed Collection</span>
                  <span aria-hidden="true">·</span>
                  <span>Updated {trad.lastReviewedAt}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1C1B19] group-hover:text-[#2E473B]">
                  {trad.name}
                </h3>
                <p className="text-xs leading-relaxed text-[#5C5852]">
                  {trad.description}
                </p>
              </div>
              <div className="mt-4 border-t border-[#EFEAE1] pt-3 space-y-1.5">
                <p className="text-[11px] text-[#6E6A63]">
                  Reviewer: {trad.reviewerName}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E473B]">
                  <span>View {trad.shortLabel} Items &amp; Kits</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* D. Featured Products */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
          <div className="space-y-1.5">
            <h2 className="font-serif text-3xl font-semibold text-[#1C1B19]">
              Verified Essentials &amp; Memorial Products
            </h2>
            <p className="text-sm text-[#5C5852]">
              Individual products with transparent INR pricing, verified materials, and real-time hub stock availability.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E473B] hover:underline whitespace-nowrap shrink-0"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* E. Featured Ritual Kits */}
      <section className="border-y border-[#E5DEC9] bg-[#F4F0E6] py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DFD8CC] pb-6">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold text-[#1C1B19]">
                Curated Ritual Kits with Complete Checklists
              </h2>
              <p className="text-sm text-[#5C5852]">
                Every kit lists its exact included items, quantities, and regional notes upfront. Use our Ritual Kit Builder to include or omit optional items before ordering.
              </p>
            </div>
            <Link
              href="/shop/ritual-kits"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E473B] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Explore All Ritual Kits</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {featuredKits.map((kit) => (
              <RitualKitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </div>
      </section>

      {/* F. How It Works & G. Trust and Transparency */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* How It Works */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-semibold text-[#1C1B19]">
                How LastCry Works
              </h2>
              <p className="text-sm text-[#5C5852]">
                A straightforward, respectful process designed to reduce stress for families and coordinators.
              </p>
            </div>

            <ol className="space-y-5">
              {[
                {
                  step: '01. Find what you need',
                  body: 'Browse individual essentials, memorial frames, or tradition-specific kits without forced account creation or intrusive prompts.',
                },
                {
                  step: '02. Review the contents and delivery options',
                  body: 'Inspect the complete item-by-item checklist, toggle optional additions, and enter your 6-digit PIN code to verify realistic hub delivery windows.',
                },
                {
                  step: '03. Order with confidence',
                  body: 'Complete checkout with transparent GST and delivery fees. Orders are packed in plain, discreet unbranded cartons and tracked end-to-end.',
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-5 space-y-1.5"
                >
                  <h3 className="text-sm font-semibold text-[#1C1B19]">{item.step}</h3>
                  <p className="text-xs leading-relaxed text-[#5C5852]">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Trust & Transparency */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-semibold text-[#1C1B19]">
                Verifiable Practices &amp; Transparency
              </h2>
              <p className="text-sm text-[#5C5852]">
                We establish trust through accuracy, discretion, and verifiable operational standards—never through fabricated urgency or invented claims.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Transparent Pricing & Taxes',
                  desc: 'Every item displays its selling price, MRP, and applicable GST rate clearly before checkout. No surprise convenience or packaging fees.',
                },
                {
                  title: 'Clearly Listed Kit Contents',
                  desc: 'No opaque bundles. Every ritual kit specifies exact item quantities, weights, materials, and whether an item is core or optional.',
                },
                {
                  title: 'Contributor-Reviewed Context',
                  desc: 'Tradition notes and checklists are reviewed by named cultural contributors and qualified for regional differences.',
                },
                {
                  title: 'Realistic PIN-Code Fulfilment',
                  desc: 'We show only delivery windows supported by our configured regional hubs and dispatch cut-offs—never false instant-delivery promises.',
                },
                {
                  title: 'Accessible Customer Support',
                  desc: 'Reach our support and grievance desk directly during staffed hours (Mon–Sat, 8:00 AM – 8:00 PM IST) for order or coordination queries.',
                },
                {
                  title: 'Bereavement Privacy Protection',
                  desc: 'We collect only the details required to deliver your order. We never ask for cause of death or use bereavement data for ad targeting.',
                },
              ].map((practice) => (
                <div
                  key={practice.title}
                  className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-5 space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1B19]">
                    <ShieldCheck className="h-4 w-4 text-[#2E473B] shrink-0" />
                    <h3>{practice.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-[#5C5852]">{practice.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* H. Guidance Centre */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DEC9] pb-6">
          <div className="space-y-1.5">
            <h2 className="font-serif text-3xl font-semibold text-[#1C1B19]">
              Guidance Centre
            </h2>
            <p className="text-sm text-[#5C5852]">
              Calm, practical articles on understanding ritual checklists, regional customs, and arranging deliveries for family members.
            </p>
          </div>
          <Link
            href="/guidance"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E473B] hover:underline whitespace-nowrap shrink-0"
          >
            <span>Read All Guidance Articles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/guidance/${article.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 transition-colors hover:border-[#2E473B]"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6A63]">
                  <BookOpen className="h-3.5 w-3.5 text-[#2E473B]" />
                  <span>{article.applicableTradition}</span>
                  <span aria-hidden="true">·</span>
                  <span>Reviewed {article.lastReviewedDate}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#1C1B19] group-hover:text-[#2E473B]">
                  {article.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#5C5852]">
                  {article.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#EFEAE1] flex items-center justify-between text-xs text-[#6E6A63]">
                <span>Reviewer: {article.reviewerName}</span>
                <span className="font-medium text-[#2E473B] inline-flex items-center gap-1">
                  Read Guide <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
