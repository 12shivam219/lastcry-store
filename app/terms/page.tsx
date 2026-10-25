import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | LastCry India',
  description:
    'Terms of use, cultural guidance disclaimers, pricing transparency, and service directory referral terms for LastCry.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Terms of Service
        </h1>
        <p className="text-xs text-[#5C5852]">
          Clear terms governing product orders, cultural notes, and directory referrals on LastCry.
        </p>
      </header>

      <div className="space-y-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8 text-xs leading-relaxed text-[#3A3732]">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            1. Informational Nature of Cultural &amp; Ritual Checklists
          </h2>
          <p>
            Tradition labels, kit checklists, and Guidance Centre articles on LastCry are provided as helpful informational aids reviewed by domain contributors. They do not constitute binding religious edicts or legal advice. Families should always feel free to adapt, omit, or choose supplies according to their own household custom.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            2. Pricing, Taxes &amp; Server Validation
          </h2>
          <p>
            All prices are listed in Indian Rupees (INR). Final totals, GST amounts, coupon discounts, and PIN-code delivery fees are validated on the server before order creation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            3. Local Service Provider Directory
          </h2>
          <p>
            Directory listings for florists, memorial printers, and grief support organizations are provided as an enquiry referral service. Verification status is explicitly indicated on each listing.
          </p>
        </section>
      </div>
    </div>
  );
}
