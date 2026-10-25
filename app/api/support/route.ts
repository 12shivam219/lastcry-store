import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type = 'SUPPORT_TICKET' } = body;
    const db = getDb();
    const now = new Date().toISOString();

    if (type === 'SERVICE_ENQUIRY') {
      if (!body.customerName || !body.customerPhone || !body.serviceId) {
        return NextResponse.json(
          { error: 'Please provide your name, phone number, and selected service provider.' },
          { status: 400 }
        );
      }
      const listing = db.serviceListings.find((s) => s.id === body.serviceId || s.slug === body.serviceId);
      const enquiry = {
        id: `enq-${Date.now()}`,
        enquiryNumber: `ENQ-2026-${100 + db.serviceEnquiries.length + 1}`,
        serviceId: body.serviceId,
        providerName: listing?.providerName || body.providerName || 'Local Service Provider',
        customerName: body.customerName.trim(),
        customerEmail: (body.customerEmail || '').trim(),
        customerPhone: body.customerPhone.trim(),
        city: (body.city || '').trim(),
        pinCode: (body.pinCode || '').trim(),
        message: (body.message || '').trim(),
        status: 'RECEIVED' as const,
        createdAt: now,
      };
      db.serviceEnquiries.unshift(enquiry);
      saveDb(db);
      return NextResponse.json({ success: true, enquiry });
    }

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Please complete your name, email address, and message.' },
        { status: 400 }
      );
    }

    const ticket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${100 + db.supportTickets.length + 1}`,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim(),
      orderNumber: body.orderNumber?.trim(),
      category: body.category || 'ORDER_SUPPORT',
      subject: body.subject?.trim() || 'Customer Support Request',
      message: body.message.trim(),
      status: 'OPEN' as const,
      createdAt: now,
      updatedAt: now,
    };

    db.supportTickets.unshift(ticket);
    saveDb(db);
    return NextResponse.json({ success: true, ticket });
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit request at this time.' },
      { status: 500 }
    );
  }
}
