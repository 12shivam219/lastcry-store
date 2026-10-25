import { NextRequest, NextResponse } from 'next/server';
import { validateAndCalculateCart } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items = [], pinCode, couponCode, deliveryMethod = 'STANDARD_SURFACE' } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { isValid: false, errors: ['Invalid cart items payload.'] },
        { status: 400 }
      );
    }

    const result = validateAndCalculateCart(items, pinCode, couponCode, deliveryMethod);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { isValid: false, errors: ['Unable to validate cart payload.'] },
      { status: 400 }
    );
  }
}
