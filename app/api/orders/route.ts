import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = (searchParams.get('orderNumber') || '').trim().toUpperCase();
  const email = (searchParams.get('email') || '').trim().toLowerCase();

  const db = getDb();

  if (orderNumber) {
    const order = db.orders.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber
    );
    if (!order) {
      return NextResponse.json(
        { error: `Order ${orderNumber} not found.` },
        { status: 404 }
      );
    }
    // If email filter is supplied on track-order, verify match (or allow sample orders)
    if (
      email &&
      order.customerEmail.toLowerCase() !== email &&
      !order.isSampleData
    ) {
      return NextResponse.json(
        { error: 'Order number and email address do not match our records.' },
        { status: 403 }
      );
    }
    return NextResponse.json({ order });
  }

  // Return orders for customer email
  if (email) {
    const orders = db.orders.filter(
      (o) => o.customerEmail.toLowerCase() === email
    );
    return NextResponse.json({ orders });
  }

  return NextResponse.json(
    { error: 'Please provide an orderNumber or customer email.' },
    { status: 400 }
  );
}
