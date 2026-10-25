import React from 'react';
import type { Metadata } from 'next';
import { getDb } from '@/lib/db/store';

export const metadata: Metadata = {
  title: 'Shipping & PIN-Code Fulfilment Policy | LastCry',
  description:
    'Review LastCry supported delivery zones, dispatch cut-off times, shipping charges, and perishable floral restrictions.',
};

export default function ShippingPolicyPage() {
  const zones = getDb().deliveryZones;

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Shipping &amp; PIN-Code Fulfilment Policy
        </h1>
        <p className="text-xs text-[#5C5852]">
          Transparent dispatch cut-off times, regional hub coverage, and delivery fee structures across India.
        </p>
      </header>

      <div className="space-y-4 text-xs leading-relaxed text-[#3A3732]">
        <p>
          LastCry displays only delivery estimates supported by our active regional fulfilment hubs. We never promise same-hour or express delivery unless a verified local courier hub is active for your destination PIN code.
        </p>
        <p>
          <strong>Discreet Packaging Standard:</strong> Every shipment is packed in an unbranded kraft or oat-coloured corrugated box. Earthenware and glass-chimney lamps are cushioned in biodegradable honeycomb pulp.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#DFD8CC] bg-[#FAF8F5]">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6] text-[#1C1B19]">
            <tr>
              <th className="px-4 py-3 font-semibold">Fulfilment Zone</th>
              <th className="px-4 py-3 font-semibold">PIN Prefixes</th>
              <th className="px-4 py-3 font-semibold">Standard Window</th>
              <th className="px-4 py-3 font-semibold">Cut-off</th>
              <th className="px-4 py-3 font-semibold text-right">Standard Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DEC9]">
            {zones.map((z) => (
              <tr key={z.id}>
                <td className="px-4 py-3 font-medium text-[#1C1B19]">{z.zoneName}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-[#5C5852]">
                  {z.pinCodePrefixes.join(', ')}
                </td>
                <td className="px-4 py-3 text-[#4E4B45]">{z.estimatedWindow}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-[#5C5852]">
                  {z.dispatchCutoffLocalTime}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-right text-[#1C1B19]">
                  ₹{z.standardFeeInr} (Free ≥ ₹{z.freeDeliveryThresholdInr})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
