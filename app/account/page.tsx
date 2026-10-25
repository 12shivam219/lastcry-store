'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Package, MapPin, ShieldCheck, Trash2, LogOut } from 'lucide-react';
import { useStore } from '@/components/providers/StoreContext';

export default function AccountPage() {
  const { currentUser, setCurrentUser, showToast } = useStore();
  const [emailInput, setEmailInput] = useState('ananya.sample@example.in');
  const [nameInput, setNameInput] = useState('Ananya Deshmukh');
  const [phoneInput, setPhoneInput] = useState('+91 98201 00101');
  const [deletionMessage, setDeletionMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CUSTOMER_LOGIN_OR_REGISTER',
        email: emailInput,
        fullName: nameInput,
        phone: phoneInput,
      }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setCurrentUser(data.user);
      showToast(`Signed in as ${data.user.fullName}`);
    }
  };

  const handleUpdateConsent = async (field: string, value: boolean) => {
    if (!currentUser) return;
    const nextPrefs = {
      ...currentUser.consentPreferences,
      [field]: value,
    };
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_CONSENT',
        email: currentUser.email,
        ...nextPrefs,
      }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setCurrentUser(data.user);
      showToast('Communication preferences updated.');
    }
  };

  const handleRequestDeletion = async () => {
    if (!currentUser) return;
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REQUEST_ACCOUNT_DELETION',
        email: currentUser.email,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentUser(data.user);
      setDeletionMessage(data.message);
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-5">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
            Customer Account &amp; Privacy Controls
          </h1>
          <p className="text-xs text-[#5C5852]">
            Manage your profile, saved delivery addresses, order history, and communication preferences.
          </p>
        </div>

        <nav className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/account"
            className="rounded-md bg-[#2E473B] px-3.5 py-2 text-[#FAF8F5]"
          >
            Profile &amp; Privacy
          </Link>
          <Link
            href="/account/orders"
            className="rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3.5 py-2 text-[#1C1B19] hover:border-[#2E473B]"
          >
            Order History
          </Link>
          <Link
            href="/account/addresses"
            className="rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3.5 py-2 text-[#1C1B19] hover:border-[#2E473B]"
          >
            Saved Addresses
          </Link>
        </nav>
      </div>

      {!currentUser ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-start">
          <form
            onSubmit={handleSignIn}
            className="md:col-span-7 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-4"
          >
            <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
              Sign In or Create an Account
            </h2>
            <p className="text-xs text-[#5C5852]">
              Account creation is optional—you may always browse and complete guest checkout without an account. Sign in below (pre-filled with our sample customer account) to view order history and saved addresses.
            </p>

            <div>
              <label htmlFor="acc-email" className="block text-xs font-medium text-[#1C1B19] mb-1">
                Email Address *
              </label>
              <input
                id="acc-email"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="acc-name" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Full Name
                </label>
                <input
                  id="acc-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="acc-phone" className="block text-xs font-medium text-[#1C1B19] mb-1">
                  Phone Number
                </label>
                <input
                  id="acc-phone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-md bg-[#2E473B] px-5 py-2.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D]"
            >
              Continue to Account
            </button>
          </form>

          <div className="md:col-span-5 rounded-lg border border-[#E5DEC9] bg-[#F5F1E8] p-6 space-y-3 text-xs text-[#4E4B45]">
            <h3 className="font-serif text-lg font-semibold text-[#1C1B19]">
              Guest Order Lookup
            </h3>
            <p>
              Placed an order without an account? You can view live dispatch status and receipts anytime using your order number.
            </p>
            <Link
              href="/track-order"
              className="inline-block rounded-md border border-[#2E473B] px-4 py-2 font-medium text-[#2E473B] hover:bg-[#EFEBE2]"
            >
              Go to Order Tracker
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Profile Summary */}
          <div className="lg:col-span-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFEBE2] text-[#2E473B]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#1C1B19]">
                    {currentUser.fullName}
                  </h2>
                  <p className="text-xs text-[#5C5852]">
                    {currentUser.email} · {currentUser.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentUser(null)}
                className="inline-flex items-center gap-1.5 rounded border border-[#CFC7B8] px-3 py-1.5 text-xs text-[#5C5852] hover:text-[#1C1B19]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/account/orders"
                className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-4 hover:border-[#2E473B]"
              >
                <Package className="h-4 w-4 text-[#2E473B] mb-1.5" />
                <p className="text-xs font-semibold text-[#1C1B19]">Order History</p>
                <p className="text-[11px] text-[#5C5852]">View receipts &amp; tracking</p>
              </Link>

              <Link
                href="/account/addresses"
                className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-4 hover:border-[#2E473B]"
              >
                <MapPin className="h-4 w-4 text-[#2E473B] mb-1.5" />
                <p className="text-xs font-semibold text-[#1C1B19]">
                  Saved Addresses ({currentUser.savedAddresses.length})
                </p>
                <p className="text-[11px] text-[#5C5852]">Manage delivery locations</p>
              </Link>
            </div>
          </div>

          {/* Consent & Data Deletion Controls */}
          <div className="lg:col-span-6 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#2E473B]" />
              <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
                Consent &amp; Bereavement Data Privacy
              </h2>
            </div>

            <div className="space-y-3 text-xs text-[#3A3732]">
              <label className="flex items-center justify-between gap-4 border-b border-[#EFEAE1] pb-2.5">
                <span>Transactional Order &amp; Dispatch Emails</span>
                <input
                  type="checkbox"
                  checked={currentUser.consentPreferences.orderUpdatesEmail}
                  onChange={(e) =>
                    handleUpdateConsent('orderUpdatesEmail', e.target.checked)
                  }
                  className="h-4 w-4 accent-[#2E473B]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 border-b border-[#EFEAE1] pb-2.5">
                <span>Courier Coordinator SMS Notifications</span>
                <input
                  type="checkbox"
                  checked={currentUser.consentPreferences.orderUpdatesSms}
                  onChange={(e) =>
                    handleUpdateConsent('orderUpdatesSms', e.target.checked)
                  }
                  className="h-4 w-4 accent-[#2E473B]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 border-b border-[#EFEAE1] pb-2.5">
                <span>Optional Guidance Centre Articles (Default Off)</span>
                <input
                  type="checkbox"
                  checked={currentUser.consentPreferences.guidanceNewsletterOptIn}
                  onChange={(e) =>
                    handleUpdateConsent('guidanceNewsletterOptIn', e.target.checked)
                  }
                  className="h-4 w-4 accent-[#2E473B]"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-[#E5DEC9] space-y-2">
              <h3 className="text-xs font-semibold text-[#8C3B2B]">
                Account &amp; Personal Data Erasure (DPDP Act Alignment)
              </h3>
              {currentUser.deletionRequestedAt || deletionMessage ? (
                <p className="rounded bg-[#FDF2EF] p-3 text-xs text-[#8C3B2B]">
                  {deletionMessage ||
                    `Account deletion requested on ${new Date(
                      currentUser.deletionRequestedAt!
                    ).toLocaleDateString('en-IN')}.`}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestDeletion}
                  className="inline-flex items-center gap-1.5 rounded border border-[#8C3B2B] px-3 py-1.5 text-xs font-medium text-[#8C3B2B] hover:bg-[#FDF2EF]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Request Account Deletion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
