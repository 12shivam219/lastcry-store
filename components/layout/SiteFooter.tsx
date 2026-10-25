'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/components/providers/StoreContext';

export default function SiteFooter() {
  const pathname = usePathname();
  const { showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast('Your preference for quiet guidance articles has been saved. We never send promotional spam.');
    setNewsletterEmail('');
  };

  return (
    <footer className="border-t border-[#DFD8CC] bg-[#EFEBE2] text-[#3A3732]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-3 pr-4">
            <Link href="/" className="font-serif text-2xl font-semibold text-[#1C1B19]">
              LastCry
            </Link>
            <p className="text-sm font-medium text-[#2E473B]">
              Thoughtful essentials. Dignified goodbyes.
            </p>
            <p className="text-xs leading-relaxed text-[#5C5852] max-w-md">
              LastCry helps families across India find verified last-rites essentials, curated ritual kits with transparent contents, memorial frames, and understated condolence gifts in one calm, respectful place.
            </p>
            <div className="pt-2 text-xs text-[#5C5852] space-y-1">
              <p>
                <strong>Customer Support Desk:</strong> Mon–Sat, 8:00 AM – 8:00 PM IST
              </p>
              <p>
                Email: <a href="mailto:support@lastcry.in" className="underline">support@lastcry.in</a> · Track orders anytime at{' '}
                <Link href="/track-order" className="underline">
                  /track-order
                </Link>
              </p>
              <p className="text-[11px] text-[#6E6A63]">
                Note: LastCry is not an emergency medical or round-the-clock ambulance dispatch service.
              </p>
            </div>
          </div>

          {/* Column 2: Storefront & Collections */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
              Storefront &amp; Kits
            </h3>
            <ul className="space-y-2 text-xs text-[#5C5852]">
              <li>
                <Link href="/shop" className="hover:text-[#1C1B19] hover:underline">
                  All Verified Products
                </Link>
              </li>
              <li>
                <Link href="/shop/essentials" className="hover:text-[#1C1B19] hover:underline">
                  Last-Rites Essentials
                </Link>
              </li>
              <li>
                <Link href="/shop/ritual-kits" className="hover:text-[#1C1B19] hover:underline">
                  Curated Ritual Kits &amp; Builder
                </Link>
              </li>
              <li>
                <Link href="/shop/memorials" className="hover:text-[#1C1B19] hover:underline">
                  Memorial Frames &amp; Registers
                </Link>
              </li>
              <li>
                <Link href="/shop/condolence-gifts" className="hover:text-[#1C1B19] hover:underline">
                  Condolence Care Parcels &amp; Flowers
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#1C1B19] hover:underline">
                  Local Service Directory (Phase 2)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Guidance & Customer Care */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
              Guidance &amp; Support
            </h3>
            <ul className="space-y-2 text-xs text-[#5C5852]">
              <li>
                <Link href="/guidance" className="hover:text-[#1C1B19] hover:underline">
                  Guidance Centre Articles
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#1C1B19] hover:underline">
                  About Our Review Standards
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#1C1B19] hover:underline">
                  Track an Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#1C1B19] hover:underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1C1B19] hover:underline">
                  Contact Customer Care
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#1C1B19] hover:underline">
                  Operations &amp; Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies, Grievance Officer & Consent */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
              Policies &amp; Compliance
            </h3>
            <ul className="space-y-2 text-xs text-[#5C5852]">
              <li>
                <Link href="/shipping-policy" className="hover:text-[#1C1B19] hover:underline">
                  Shipping &amp; PIN Coverage Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-refunds" className="hover:text-[#1C1B19] hover:underline">
                  Returns, Replacements &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#1C1B19] hover:underline">
                  Bereavement Data Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1C1B19] hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/grievance-redressal" className="hover:text-[#1C1B19] hover:underline">
                  Consumer Grievance Redressal
                </Link>
              </li>
            </ul>

            <form onSubmit={handleNewsletter} className="pt-3 space-y-1.5">
              <label htmlFor="footer-guidance-optin" className="block text-[11px] font-medium text-[#3A3732]">
                Optional Guidance Updates (No marketing spam)
              </label>
              <div className="flex gap-1.5">
                <input
                  id="footer-guidance-optin"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded border border-[#CFC7B8] bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#1C1B19] focus:border-[#2E473B] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded bg-[#2E473B] px-3 py-1.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D] whitespace-nowrap shrink-0"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-[#DFD8CC] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6E6A63]">
          <p>
            © {new Date().getFullYear()} LastCry Retail &amp; Services India (MVP Demo Environment). Zero third-party ad pixels or bereavement profiling.
          </p>
          <p>
            Grievance Officer: <Link href="/grievance-redressal" className="underline">grievance@lastcry.in</Link> · All prices in INR (₹) inclusive of applicable GST shown at checkout.
          </p>
        </div>
      </div>
    </footer>
  );
}
