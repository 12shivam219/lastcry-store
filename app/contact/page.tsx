'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [category, setCategory] = useState('ORDER_SUPPORT');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketNum, setTicketNum] = useState<string | null>(null);
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
          type: 'SUPPORT_TICKET',
          name,
          email,
          phone,
          orderNumber,
          category,
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Unable to submit support request.');
      } else {
        setTicketNum(data.ticket.ticketNumber);
      }
    } catch {
      setError('Network error submitting support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <header className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
          Customer Care &amp; Order Support
        </h1>
        <p className="text-sm text-[#5C5852]">
          Reach our support team for order tracking, delivery coordination, or questions about product and kit specifications.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-4 text-xs text-[#4E4B45]">
            <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
              Staffed Support Hours &amp; Scope
            </h2>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#2E473B]" />
              <span>Monday to Saturday · 8:00 AM – 8:00 PM IST</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#2E473B]" />
              <span>support@lastcry.in</span>
            </p>

            <div className="rounded border border-[#E5DEC9] bg-[#F5F1E8] p-3.5 space-y-1">
              <p className="font-semibold text-[#1C1B19] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-[#7A5C3E]" />
                <span>Important Service Notice</span>
              </p>
              <p>
                LastCry is an online store for physical products and directory referrals. We do not operate 24/7 emergency medical, ambulance, or mortuary dispatch services.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-6 space-y-2 text-xs text-[#4E4B45]">
            <h3 className="font-semibold text-[#1C1B19]">Consumer Grievance Redressal</h3>
            <p>
              For formal consumer protection or privacy complaints under the Consumer Protection (E-Commerce) Rules, please visit our{' '}
              <Link href="/grievance-redressal" className="text-[#2E473B] underline">
                Grievance Redressal Officer page
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8">
          {ticketNum ? (
            <div className="space-y-4 text-xs text-[#1C1B19]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2E473B]">
                <CheckCircle2 className="h-5 w-5" />
                <span>Support Ticket Logged ({ticketNum})</span>
              </div>
              <p className="text-[#4E4B45]">
                Thank you, <strong>{name}</strong>. Your support request has been recorded under reference{' '}
                <span className="font-mono font-semibold">{ticketNum}</span> and is visible to our support desk in the Admin Dashboard.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTicketNum(null);
                  setSubject('');
                  setMessage('');
                }}
                className="rounded border border-[#2E473B] px-4 py-2 font-medium text-[#2E473B]"
              >
                Submit Another Query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                Send a Support Request
              </h2>

              {error && (
                <p className="rounded bg-[#FDF2EF] p-3 text-[#8C3B2B]">{error}</p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Order Number (If applicable)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="LC-2026-1001"
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1C1B19] mb-1">
                    Topic
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  >
                    <option value="ORDER_SUPPORT">Order &amp; Delivery Support</option>
                    <option value="KIT_GUIDANCE">Ritual Kit Contents Query</option>
                    <option value="DELIVERY_QUERY">PIN Code Coverage Query</option>
                    <option value="ACCOUNT_PRIVACY">Privacy &amp; Data Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#1C1B19] mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1C1B19] mb-1">
                  Message *
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
                disabled={submitting}
                className="rounded-md bg-[#2E473B] px-6 py-2.5 font-medium text-[#FAF8F5] hover:bg-[#23372D]"
              >
                {submitting ? 'Submitting...' : 'Submit Support Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
