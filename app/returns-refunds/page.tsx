import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns, Replacements & Refund Policy | LastCry',
  description:
    'Clear, compassionate return and refund policies for unused supplies, transit-damaged vessels, and pre-dispatch order cancellations.',
};

export default function ReturnsRefundsPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Returns, Replacements &amp; Refund Policy
        </h1>
        <p className="text-xs text-[#5C5852]">
          Fair, straightforward cancellation and refund handling for families.
        </p>
      </header>

      <div className="space-y-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8 text-xs leading-relaxed text-[#3A3732]">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            1. Pre-Dispatch Order Cancellations
          </h2>
          <p>
            If your family’s plans or travel locations change before an order is dispatched from our hub, you may cancel the order for a 100% refund with zero cancellation fees. Reserved inventory is immediately released and the refund is initiated to your original payment method.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            2. 7-Day Returns on Unused Non-Perishable Items
          </h2>
          <p>
            Unopened non-perishable items (such as memorial portrait frames, uninscribed condolence registers, brass lamps, and sealed textile packs with unbroken hygiene seals) may be returned within 7 days of delivery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            3. Transit Damage on Earthenware or Glass
          </h2>
          <p>
            If an unglazed terracotta vessel or borosilicate lamp glass arrives cracked or damaged in transit, share a photograph with <a href="mailto:support@lastcry.in" className="underline">support@lastcry.in</a> within 48 hours of delivery for an immediate no-questions-asked refund or replacement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            4. Perishable Floral Tributes
          </h2>
          <p>
            Fresh floral garlands and sheaves are prepared to order and cannot be returned once delivered, unless delivered damaged or outside the agreed delivery window.
          </p>
        </section>
      </div>
    </div>
  );
}
