'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function GrievanceRedressalPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SUPPORT_TICKET',
        name,
        email,
        orderNumber,
        category: 'GRIEVANCE_REDRESSAL',
        subject: `Formal Consumer Grievance (${orderNumber || 'General'})`,
        message,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ticket) {
      setTicketNumber(data.ticket.ticketNumber);
    }
  };

  return (
    <div className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl font-semibold text-[#1C1B19]">
          Consumer Grievance Redressal Mechanism
        </h1>
        <p className="text-xs text-[#5C5852]">
          Published in accordance with Indian Consumer Protection (E-Commerce) Rules &amp; Information Technology Rules.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-start">
        <div className="md:col-span-5 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-3 text-xs text-[#3A3732]">
          <div className="flex items-center gap-2 font-semibold text-[#1C1B19]">
            <ShieldCheck className="h-4 w-4 text-[#2E473B]" />
            <h2>Designated Grievance Officer</h2>
          </div>
          <p>
            <strong>Name:</strong> Arundhati Joshi (Grievance &amp; Compliance Desk — Sample Designation)
          </p>
          <p>
            <strong>Email:</strong> grievance@lastcry.in
          </p>
          <p>
            <strong>Postal Office:</strong> LastCry Retail &amp; Fulfilment Desk, Prabhat Road, Pune 411004, Maharashtra, India
          </p>
          <p className="pt-2 text-[#5C5852]">
            <strong>Acknowledgement SLA:</strong> Every formal grievance is assigned a unique ticket tracking number immediately upon submission, acknowledged within 48 hours, and resolved within 15 business days.
          </p>
        </div>

        <div className="md:col-span-7 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-4">
          <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
            Lodge a Formal Grievance
          </h2>

          {ticketNumber ? (
            <div className="rounded bg-[#EFEBE2] p-4 space-y-2 text-xs text-[#1C1B19]">
              <div className="flex items-center gap-2 font-semibold text-[#2E473B]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Grievance Registered: {ticketNumber}</span>
              </div>
              <p>
                Your grievance has been logged with the Grievance Officer desk under tracking number{' '}
                <strong className="font-mono">{ticketNumber}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[#1C1B19] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Order Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[#1C1B19] mb-1">
                  Nature of Grievance &amp; Relief Sought *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-[#2E473B] px-5 py-2.5 font-medium text-[#FAF8F5] hover:bg-[#23372D]"
              >
                Register Grievance Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
