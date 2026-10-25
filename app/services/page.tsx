import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, ArrowRight, Phone, Mail } from 'lucide-react';
import { getDb } from '@/lib/db/store';

export const metadata: Metadata = {
  title: 'Local Service Directory — Florists, Memorial Printers & Support | LastCry',
  description:
    'Find local memorial printers, florists, crematorium information desks, and bereavement support organizations in supported cities.',
};

export default function ServicesDirectoryPage() {
  const db = getDb();
  const listings = db.serviceListings;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="border-b border-[#E5DEC9] pb-6 space-y-3">
        <p className="text-xs font-medium text-[#2E473B]">
          Phase 2 Directory · Enquiry &amp; Referral Workflow
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
          Local Service Provider Directory
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#5C5852]">
          Browse local memorial printers, florists, civic crematorium/cemetery information references, and bereavement support organizations. Where live scheduling integrations are not enabled, LastCry provides a transparent enquiry workflow rather than simulated instant booking.
        </p>
      </div>

      {/* Transparency Notice */}
      <div className="rounded-lg border border-[#DFD8CC] bg-[#F4F0E6] p-5 flex items-start gap-3 text-xs text-[#3A3732]">
        <AlertCircle className="h-4 w-4 text-[#7A5C3E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#1C1B19]">
            Directory Verification &amp; Sample Data Disclosure
          </p>
          <p>
            All directory entries in this development environment are explicitly marked as sample content. Providers marked as <strong>Verified Partner (Sample)</strong> demonstrate how contract-verified partners appear after document review, whereas <strong>Unverified Demo Reference</strong> entries illustrate unverified community or civic listings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {listings.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-5"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
                <span>{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>{item.city}</span>
                <span aria-hidden="true">·</span>
                {item.verificationStatus === 'VERIFIED_PROVIDER' ? (
                  <span className="inline-flex items-center gap-1 font-medium text-[#2E473B]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Partner (Sample)
                  </span>
                ) : (
                  <span className="text-[#7A5C3E]">Unverified Demo Listing</span>
                )}
              </div>

              <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                <Link href={`/services/${item.slug}`} className="hover:underline">
                  {item.providerName}
                </Link>
              </h2>

              <p className="text-xs leading-relaxed text-[#4E4B45]">
                {item.description}
              </p>

              <div className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-3.5 space-y-1.5 text-xs text-[#4E4B45]">
                <p>
                  <strong>Service Areas:</strong> {item.serviceAreas.join(', ')}
                </p>
                <p>
                  <strong>Published Pricing:</strong> {item.publishedPriceInfo}
                </p>
                <p>
                  <strong>Availability &amp; Mode:</strong> {item.availabilityInfo}
                </p>
              </div>
            </div>

            <div className="border-t border-[#E5DEC9] pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5 text-[#5C5852]">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#2E473B]" />
                  <span>{item.publicPhone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#2E473B]" />
                  <span>{item.publicEmail}</span>
                </p>
              </div>

              <Link
                href={`/services/${item.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#2E473B] px-4 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D]"
              >
                <span>Submit Referral Enquiry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
