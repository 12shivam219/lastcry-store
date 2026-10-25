import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bereavement Data Privacy Notice | LastCry',
  description:
    'How LastCry protects customer privacy, minimizes data collection, prohibits bereavement ad profiling, and supports data erasure.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Bereavement Data Privacy Policy
        </h1>
        <p className="text-xs text-[#5C5852]">
          Designed around data minimization, discretion, and zero behavioural ad tracking.
        </p>
      </header>

      <div className="space-y-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8 text-xs leading-relaxed text-[#3A3732]">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            1. Strict Data Minimization
          </h2>
          <p>
            We collect only the customer or coordinator name, email address, phone number, and shipping address required to process and deliver your order. We do not require customers to disclose their religious identity, and we never ask for the deceased person’s name, age, or cause of death at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            2. Prohibition on Bereavement Advertising &amp; Third-Party Pixels
          </h2>
          <p>
            LastCry does not embed third-party behavioural advertising pixels, social media retargeting trackers, or data-broker scripts. Your browsing history, tradition filters, and saved items are never used to target grief-related advertising.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            3. Payment Security
          </h2>
          <p>
            LastCry never stores raw credit/debit card numbers or UPI PINs on its servers. Payment authorization is handled via signed server-side order tokens and verified via cryptographic HMAC-SHA256 webhooks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            4. Retention &amp; Account Deletion
          </h2>
          <p>
            Customers can modify communication consents or submit an Account &amp; Personal Data Deletion request directly from the Account page (`/account`) or by writing to `privacy@lastcry.in`. Where statutory tax invoices must be retained for accounting compliance, records are soft-archived with restricted access.
          </p>
        </section>
      </div>
    </div>
  );
}
