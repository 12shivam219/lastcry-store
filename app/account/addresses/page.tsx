'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus } from 'lucide-react';
import { useStore } from '@/components/providers/StoreContext';

export default function AccountAddressesPage() {
  const { currentUser, setCurrentUser, setPinCode, showToast } = useStore();
  const [label, setLabel] = useState('Family Residence');
  const [recipient, setRecipient] = useState(currentUser?.fullName || 'Ananya Deshmukh');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98201 00101');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pinCodeInput, setPinCodeInput] = useState('400001');

  const addresses = currentUser?.savedAddresses || [
    {
      id: 'sample-addr-1',
      label: 'Pune Family Residence (Sample)',
      recipient: 'Ananya Deshmukh',
      phone: '+91 98201 00101',
      line1: 'Flat 402, Shanti Niketan CHSL, Prabhat Road',
      line2: 'Deccan Gymkhana',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411004',
      isDefault: true,
    },
  ];

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!line1.trim() || pinCodeInput.length !== 6) return;

    const email = currentUser?.email || 'ananya.sample@example.in';
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ADD_ADDRESS',
        email,
        label,
        recipient,
        phone,
        line1,
        city,
        state: stateName,
        pinCode: pinCodeInput,
      }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setCurrentUser(data.user);
      setLine1('');
      showToast('Saved new delivery address.');
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-5">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
            Saved Delivery Addresses
          </h1>
          <p className="text-xs text-[#5C5852]">
            Store family or coordinator addresses for quick, accurate PIN-code verification.
          </p>
        </div>

        <nav className="flex items-center gap-2 text-xs font-medium">
          <Link
            href="/account"
            className="rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3.5 py-2 text-[#1C1B19]"
          >
            Profile &amp; Privacy
          </Link>
          <Link
            href="/account/orders"
            className="rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3.5 py-2 text-[#1C1B19]"
          >
            Order History
          </Link>
          <Link
            href="/account/addresses"
            className="rounded-md bg-[#2E473B] px-3.5 py-2 text-[#FAF8F5]"
          >
            Saved Addresses
          </Link>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 flex items-start justify-between gap-4"
            >
              <div className="space-y-1 text-xs text-[#4E4B45]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#2E473B]" />
                  <span className="font-semibold text-sm text-[#1C1B19]">
                    {addr.label}
                  </span>
                </div>
                <p className="font-medium text-[#1C1B19]">
                  {addr.recipient} · {addr.phone}
                </p>
                <p>{addr.line1}</p>
                <p>
                  {addr.city}, {addr.state} —{' '}
                  <span className="font-mono tabular-nums">{addr.pinCode}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPinCode(addr.pinCode);
                  showToast(`Active delivery PIN set to ${addr.pinCode}`);
                }}
                className="rounded border border-[#2E473B] px-3 py-1.5 text-xs font-medium text-[#2E473B] hover:bg-[#EFEBE2] shrink-0"
              >
                Use PIN {addr.pinCode}
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAddAddress}
          className="lg:col-span-5 rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 space-y-4"
        >
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19] flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#2E473B]" />
            <span>Add New Address</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1C1B19] mb-1">
                Address Label
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C1B19] mb-1">
                6-Digit PIN Code *
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={pinCodeInput}
                onChange={(e) => setPinCodeInput(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-1.5 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1C1B19] mb-1">
              Recipient / Coordinator Name *
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1C1B19] mb-1">
              Street Address &amp; Building *
            </label>
            <input
              type="text"
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="House/Flat No., Building, Street"
              className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1C1B19] mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1C1B19] mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#2E473B] px-4 py-2.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D]"
          >
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
}
