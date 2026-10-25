import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { getDb } from '@/lib/db/store';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const db = getDb();
  const order = db.orders.find(
    (o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase()
  );

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#2E473B]">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Order {order.orderStatus} · Payment {order.paymentStatus}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-[#5C5852]">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')} · Confirmation sent to{' '}
              <strong>{order.customerEmail}</strong>
            </p>
          </div>

          <Link
            href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#2E473B] px-4 py-2 text-xs font-medium text-[#2E473B] hover:bg-[#EFEBE2] whitespace-nowrap shrink-0"
          >
            <Package className="h-3.5 w-3.5" />
            <span>Track Shipment Status</span>
          </Link>
        </div>

        {/* Delivery & Payment Details */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-xs text-[#4E4B45]">
          <div className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-4 space-y-1.5">
            <h2 className="font-semibold text-[#1C1B19]">
              Delivery Recipient &amp; Address
            </h2>
            <p className="font-medium text-[#1C1B19]">{order.customerName}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
              <span className="font-mono tabular-nums">{order.shippingAddress.pinCode}</span>
            </p>
            <p>Phone: {order.customerPhone}</p>
            {order.deliveryInstructions && (
              <p className="pt-1 text-[#5C5852]">
                <strong>Instructions:</strong> {order.deliveryInstructions}
              </p>
            )}
          </div>

          <div className="rounded-md border border-[#E5DEC9] bg-[#F5F1E8] p-4 space-y-1.5">
            <h2 className="font-semibold text-[#1C1B19]">
              Fulfilment &amp; Payment Verification
            </h2>
            <p>
              <strong>Estimated Window:</strong> {order.estimatedDeliveryWindow}
            </p>
            <p>
              <strong>Fulfilment Status:</strong> {order.fulfilmentStatus}
            </p>
            <p>
              <strong>Payment Gateway:</strong> {order.paymentDetails.provider} (
              {order.paymentDetails.isSandbox ? 'Sandbox Mode' : 'Live Mode'})
            </p>
            <p>
              <strong>Signature Verified:</strong>{' '}
              {order.paymentDetails.signatureVerified ? 'Yes (HMAC-SHA256)' : 'Pending'}
            </p>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Itemized Receipt
          </h2>
          <div className="divide-y divide-[#E5DEC9] rounded-md border border-[#E5DEC9] bg-white text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="p-4 flex justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-[#1C1B19]">
                    {item.quantity}x {item.title}
                  </p>
                  <p className="text-[#6E6A63] font-mono tabular-nums">
                    SKU: {item.sku} · GST: {item.gstPercent}%
                  </p>
                  {item.kitContentsSummary && (
                    <ul className="list-disc pl-4 text-[#5C5852] pt-1 space-y-0.5">
                      {item.kitContentsSummary.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-right font-mono tabular-nums shrink-0">
                  <p className="font-semibold text-[#1C1B19]">
                    ₹{item.lineTotalInr.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-[#6E6A63]">
                    + ₹{item.taxAmountInr.toLocaleString('en-IN')} GST
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-[#E5DEC9] pt-4 space-y-1.5 text-xs text-[#4E4B45] max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">
              ₹{order.subtotalInr.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span className="font-mono tabular-nums">
              ₹{order.taxInr.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charges</span>
            <span className="font-mono tabular-nums">
              ₹{order.deliveryFeeInr.toLocaleString('en-IN')}
            </span>
          </div>
          {order.discountInr > 0 && (
            <div className="flex justify-between text-[#2E473B]">
              <span>Discount</span>
              <span className="font-mono tabular-nums">
                - ₹{order.discountInr.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div className="border-t border-[#E5DEC9] pt-2 flex justify-between text-sm font-semibold text-[#1C1B19]">
            <span>Total Paid</span>
            <span className="font-mono tabular-nums">
              ₹{order.totalInr.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="border-t border-[#E5DEC9] pt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5C5852]">
            <ShieldCheck className="h-4 w-4 text-[#2E473B]" />
            <span>Packed in a discreet, unbranded outer carton.</span>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E473B] hover:underline"
          >
            <span>Return to Storefront</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
