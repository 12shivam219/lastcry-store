'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, CheckCircle2, Clock } from 'lucide-react';
import { OrderRecord } from '@/lib/db/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNum = searchParams.get('orderNumber') || 'LC-2026-1001';

  const [orderNumber, setOrderNumber] = useState(initialOrderNum);
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (ordNum: string, emailVal = '') => {
    if (!ordNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(ordNum.trim())}&email=${encodeURIComponent(
          emailVal.trim()
        )}`
      );
      const data = await res.json();
      if (!res.ok || !data.order) {
        setOrder(null);
        setError(data.error || 'Order not found.');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Unable to look up order status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialOrderNum) return;
    let cancelled = false;
    fetch(`/api/orders?orderNumber=${encodeURIComponent(initialOrderNum.trim())}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok || !data.order) {
          setOrder(null);
          setError(data.error || 'Order not found.');
        } else {
          setOrder(data.order);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to look up order status.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [initialOrderNum]);

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-[#E5DEC9] pb-5 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Track Your Order &amp; Shipment Status
        </h1>
        <p className="text-xs text-[#5C5852]">
          Enter your LastCry order number to view live fulfilment progress, dispatch tracking, and status history.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchOrder(orderNumber, email);
        }}
        className="rounded-lg border border-[#E5DEC9] bg-[#F5F1E8] p-5 space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label htmlFor="trk-order" className="block text-xs font-medium text-[#1C1B19] mb-1">
              Order Number *
            </label>
            <input
              id="trk-order"
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. LC-2026-1001"
              className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono text-xs uppercase"
            />
          </div>
          <div className="sm:col-span-5">
            <label htmlFor="trk-email" className="block text-xs font-medium text-[#1C1B19] mb-1">
              Customer Email (Required for non-demo orders)
            </label>
            <input
              id="trk-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya.sample@example.in"
              className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2 text-xs"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-[#2E473B] px-4 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Track</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-[#6E6A63]">
          Sample demo orders:{' '}
          {['LC-2026-1001', 'LC-2026-1002', 'LC-2026-1003'].map((sample, idx) => (
            <React.Fragment key={sample}>
              {idx > 0 && ' · '}
              <button
                type="button"
                onClick={() => {
                  setOrderNumber(sample);
                  fetchOrder(sample, '');
                }}
                className="font-mono underline hover:text-[#1C1B19]"
              >
                {sample}
              </button>
            </React.Fragment>
          ))}
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-[#D99B8C] bg-[#FDF2EF] p-4 text-xs text-[#8C3B2B]">
          {error}
        </div>
      )}

      {order && (
        <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#6E6A63]">
                <span className="font-mono font-semibold text-[#1C1B19]">
                  {order.orderNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span>Destination PIN: {order.shippingAddress.pinCode}</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#1C1B19]">
                Status: {order.orderStatus.replace(/_/g, ' ')}
              </h2>
            </div>

            <div className="text-right text-xs text-[#5C5852]">
              <p>Payment Status: <strong>{order.paymentStatus}</strong></p>
              <p>Fulfilment Status: <strong>{order.fulfilmentStatus}</strong></p>
            </div>
          </div>

          {order.shipmentDetails && (
            <div className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-4 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-[#1C1B19]">
                <Package className="h-4 w-4 text-[#2E473B]" />
                <span>Courier &amp; Dispatch Tracking</span>
              </div>
              <p>
                Carrier: <strong>{order.shipmentDetails.carrierName}</strong> · Tracking Number:{' '}
                <span className="font-mono">{order.shipmentDetails.trackingNumber}</span>
              </p>
            </div>
          )}

          {/* Status Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
              Verified Order Lifecycle Log
            </h3>
            <ol className="space-y-3 border-l border-[#CFC7B8] pl-4 text-xs">
              {order.statusHistory.map((hist, i) => (
                <li key={i} className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium text-[#1C1B19]">
                    {hist.orderStatus === 'DELIVERED' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2E473B]" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-[#7A5C3E]" />
                    )}
                    <span>
                      {hist.orderStatus} (Payment: {hist.paymentStatus} · Fulfilment:{' '}
                      {hist.fulfilmentStatus})
                    </span>
                  </div>
                  <p className="text-[#5C5852]">{hist.note}</p>
                  <p className="font-mono text-[11px] text-[#7A756D]">
                    {new Date(hist.timestamp).toLocaleString('en-IN')}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-[#E5DEC9] pt-4 flex justify-between items-center text-xs">
            <Link
              href={`/order-confirmation/${order.orderNumber}`}
              className="font-medium text-[#2E473B] underline"
            >
              View Full Itemized Receipt
            </Link>
            <Link href="/contact" className="text-[#5C5852] underline">
              Need assistance with this order?
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
