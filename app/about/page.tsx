import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About LastCry — Mission, Cultural Review & Fulfilment Standards',
  description:
    'Learn how LastCry helps families across India find last-rites essentials, curated ritual kits, and memorial products with accuracy, discretion, and respect.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-3">
        <p className="text-xs font-medium text-[#2E473B]">
          Thoughtful essentials. Dignified goodbyes.
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
          About LastCry
        </h1>
        <p className="text-base leading-relaxed text-[#4E4B45]">
          LastCry was founded to help families find the essentials they need after a death through a dignified, trustworthy, culturally informed, and convenient online shopping experience.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-2.5">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Why LastCry Exists
          </h2>
          <p className="text-xs leading-relaxed text-[#4E4B45]">
            When a bereavement occurs, relatives or family friends are often tasked with sourcing textiles, earthen vessels, botanical supplies, and portrait frames across multiple unfamiliar local markets. LastCry brings verified, clearly labelled essentials together in one calm online storefront.
          </p>
        </div>

        <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-2.5">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Pluralism &amp; Cultural Review
          </h2>
          <p className="text-xs leading-relaxed text-[#4E4B45]">
            India’s religious and regional traditions are diverse. We never treat any religion as a monolith or assert that a single checklist applies to every community. Every kit and cultural note on LastCry is reviewed by domain contributors and clearly marks what is core, optional, or region-dependent.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-[#DFD8CC] bg-[#F4F0E6] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1B19]">
          <ShieldCheck className="h-4 w-4 text-[#2E473B]" />
          <h2>Our Operational Commitments</h2>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs text-[#3A3732]">
          {[
            'Complete, itemized contents listed for every ritual kit before purchase.',
            'No forced religious disclosure—browse the entire catalogue freely.',
            'Honest PIN-code delivery estimates backed by configured regional hubs.',
            'Plain, discreet unbranded outer packaging on all shipments.',
            'Strict minimum-data checkout: we never ask for cause of death.',
            'Zero third-party advertising pixels or bereavement retargeting.',
          ].map((point) => (
            <li key={point} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#2E473B] shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5DEC9] pt-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-md bg-[#2E473B] px-5 py-2.5 text-xs font-medium text-[#FAF8F5]"
        >
          <span>Explore Verified Catalogue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/contact" className="text-xs font-medium text-[#2E473B] underline">
          Contact Our Customer Care Desk
        </Link>
      </div>
    </div>
  );
}
