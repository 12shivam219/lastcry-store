import { NextRequest, NextResponse } from 'next/server';
import { checkPinCodeServiceability } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get('pin') || '';
  const product = searchParams.get('product') || undefined;

  const result = checkPinCodeServiceability(pin, product);
  return NextResponse.json(result);
}
