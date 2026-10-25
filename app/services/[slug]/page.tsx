'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, Phone, Mail } from 'lucide-react';
import { createInitialSeedData } from '@/lib/db/seed-data';

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const seed = createInitialSeedData();
  const service =
    seed.serviceListings.find((s) => s.slug === slug) || seed.serviceListings[0];

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState(service.city);
  const [pinCode, setPinCode] = useState('400001');
  const [message, setMessage] = useState('');
  const [submittedEnquiryNumber, setSubmittedEnquiryNumber] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SERVICE_ENQUIRY',
          serviceId: service.id,
          providerName: service.providerName,
          customerName,
          customerEmail,
          customerPhone,
          city,
          pinCode,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Could not submit service enquiry.');
      } else {
        setSubmittedEnquiryNumber(data.enquiry.enquiryNumber);
      }
    } catch {
      setError('Network error submitting enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs text-[#5C5852] hover:text-[#1C1B19]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Local Service Directory</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8">
          <div className="space-y-2 border-b border-[#E5DEC9] pb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E6A63]">
              <span>{service.category}</span>
              <span aria-hidden="true">·</span>
              <span>{service.city}</span>
              <span aria-hidden="true">·</span>
              {service.verificationStatus === 'VERIFIED_PROVIDER' ? (
                <span className="inline-flex items-center gap-1 font-medium text-[#2E473B]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Partner (Sample)
                </span>
              ) : (
                <span className="text-[#7A5C3E]">Unverified Demo Listing</span>
              )}
            </div>

            <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
              {service.providerName}
            </h1>
          </div>

          <p className="text-sm leading-relaxed text-[#4E4B45]">
            {service.description}
          </p>

          <dl className="divide-y divide-[#EFEAE1] rounded-md border border-[#E5DEC9] bg-[#F5F1E8] text-xs">
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-[#6E6A63]">Supported Service Areas</dt>
              <dd className="font-medium text-[#1C1B19] text-right">
                {service.serviceAreas.join(', ')}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-[#6E6A63]">Published Price Information</dt>
              <dd className="font-medium text-[#1C1B19] text-right">
                {service.publishedPriceInfo}
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-[#6E6A63]">Booking / Referral Mode</dt>
              <dd className="font-medium text-[#1C1B19] text-right">
                {service.availabilityInfo}
              </dd>
            </div>
          </dl>

          <div className="space-y-1.5 text-xs text-[#4E4B45]">
            <p className="font-semibold text-[#1C1B19]">Public Contact Details:</p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#2E473B]" />
              <span>{service.publicPhone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#2E473B]" />
              <span>{service.publicEmail}</span>
            </p>
          </div>
        </div>

        {/* Right: Enquiry Form */}
        <div className="lg:col-span-5 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-4">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Request a Service Referral / Enquiry
          </h2>
          <p className="text-xs text-[#5C5852]">
            Because live scheduling is not enabled for directory providers, submitting this form records a referral enquiry for our coordinator desk to share with the provider.
          </p>

          {submittedEnquiryNumber ? (
            <div className="rounded-md border border-[#2E473B] bg-[#EFEBE2] p-4 space-y-2 text-xs text-[#1C1B19]">
              <div className="flex items-center gap-2 font-semibold text-[#2E473B]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Enquiry Recorded ({submittedEnquiryNumber})</span>
              </div>
              <p>
                Your referral enquiry for <strong>{service.providerName}</strong> has been logged. Our coordinator desk will respond via phone or email during staffed hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {error && (
                <p className="rounded bg-[#FDF2EF] p-2.5 text-[#8C3B2B]">{error}</p>
              )}

              <div>
                <label className="block font-medium text-[#1C1B19] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#1C1B19] mb-1">
                  Requirement Details (Date, locality, or specific question) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what assistance or printing/floral service you are looking for..."
                  className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-[#2E473B] px-4 py-2.5 font-medium text-[#FAF8F5] hover:bg-[#23372D]"
              >
                {submitting ? 'Submitting Enquiry...' : 'Submit Service Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
