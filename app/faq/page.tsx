import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Kits, Delivery & Privacy | LastCry',
  description:
    'Answers to common questions about LastCry ritual kits, regional customs, PIN-code delivery estimates, returns, and bereavement data privacy.',
};

const FAQ_ITEMS = [
  {
    q: 'Do I have to select a religion to shop on LastCry?',
    a: 'No. You can browse and purchase any product or memorial item without selecting a religious tradition. Our tradition collections are optional navigation aids designed to help families find customary supplies quickly.',
  },
  {
    q: 'Are all items in a ritual kit mandatory?',
    a: 'No. Customs vary significantly across regions, communities, and families. Every LastCry kit lists its exact included items and separates optional additions in the Ritual Kit Builder so you can customize your order.',
  },
  {
    q: 'How are delivery estimates calculated?',
    a: 'Delivery estimates are based on your 6-digit destination PIN code, regional hub stock availability, and daily dispatch cut-off times. We display only verifiable estimates supported by our configured delivery zones.',
  },
  {
    q: 'Is outer packaging discreet?',
    a: 'Yes. All orders are shipped in plain, unbranded kraft or oat-coloured cartons without sensitive promotional text on the exterior label.',
  },
  {
    q: 'Why does checkout not ask for the deceased person’s details?',
    a: 'To protect family privacy, we collect only the recipient or coordinator details necessary to fulfil and deliver your physical order. We never ask for the deceased person’s name or cause of death.',
  },
  {
    q: 'What is your return and refund policy?',
    a: 'Unopened non-perishable products with their original hygiene/tamper seal intact may be returned within 7 days of delivery. Any item delivered damaged in transit qualifies for an immediate full refund or replacement.',
  },
];

export default function FaqPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#5C5852]">
          Clear answers regarding ritual kit checklists, delivery windows, packaging discretion, and returns.
        </p>
      </header>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.q}
            className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-2"
          >
            <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
              {item.q}
            </h2>
            <p className="text-xs leading-relaxed text-[#4E4B45]">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-[#E5DEC9] bg-[#F5F1E8] p-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span>Have a specific question about an item or PIN code?</span>
        <Link
          href="/contact"
          className="rounded-md bg-[#2E473B] px-4 py-2 font-medium text-[#FAF8F5]"
        >
          Contact Customer Support
        </Link>
      </div>
    </div>
  );
}
