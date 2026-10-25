import { NextRequest, NextResponse } from 'next/server';
import { processPaymentVerification } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = processPaymentVerification({
      orderNumber: body.orderNumber,
      providerOrderId: body.providerOrderId,
      providerPaymentId: body.providerPaymentId || '',
      signature: body.signature || '',
      simulateFailure: Boolean(body.simulateFailure),
      failureReason: body.failureReason,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          order: result.order,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Payment verification error.' },
      { status: 500 }
    );
  }
}
