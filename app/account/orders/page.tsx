'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { OrderRecord } from '@/lib/db/types';
import { useStore } from '@/components/providers/StoreContext';

export default function AccountOrdersPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const lookupEmail = currentUser?.email || 'ananya.sample@example.in';

  useEffect(() => {
    fetch(`/api/orders?email=${encodeURIComponent(lookupEmail)}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lookupEmail]);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-5">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
            Order History
          </h1>
          <p className="text-xs text-[#5C5852]">
            Showing orders associated with <strong>{lookupEmail}</strong>
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
            className="rounded-md bg-[#2E473B] px-3.5 py-2 text-[#FAF8F5]"
          >
            Order History
          </Link>
          <Link
            href="/account/addresses"
            className="rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3.5 py-2 text-[#1C1B19]"
          >
            Saved Addresses
          </Link>
        </nav>
      </div>

      {loading ? (
        <p className="py-12 text-center text-xs text-[#5C5852]">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-10 text-center space-y-3">
          <Package className="mx-auto h-7 w-7 text-[#6E6A63]" />
          <p className="text-sm font-medium text-[#1C1B19]">No orders found for {lookupEmail}.</p>
          <Link
            href="/shop"
            className="inline-block rounded-md bg-[#2E473B] px-4 py-2 text-xs font-medium text-[#FAF8F5]"
          >
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DEC9] pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs text-[#6E6A63]">
                    <span className="font-mono font-semibold text-[#1C1B19]">
                      {order.orderNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {order.orderStatus}</span>
                  </div>
                  <p className="text-xs text-[#4E4B45]">
                    Deliver to: {order.shippingAddress.city} ({order.shippingAddress.pinCode})
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-base font-semibold tabular-nums text-[#1C1B19]">
                    ₹{order.totalInr.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#5C5852]">
                    Payment: {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#4E4B45]">
                {order.items.map((item) => (
                  <p key={item.id}>
                    <strong>{item.quantity}x</strong> {item.title} (₹
                    {item.lineTotalInr.toLocaleString('en-IN')})
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <Link
                  href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                  className="rounded border border-[#DFD8CC] bg-white px-3.5 py-1.5 text-xs font-medium text-[#1C1B19] hover:border-[#2E473B]"
                >
                  Track Shipment
                </Link>
                <Link
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="inline-flex items-center gap-1 rounded bg-[#2E473B] px-3.5 py-1.5 text-xs font-medium text-[#FAF8F5]"
                >
                  <span>Full Receipt</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
