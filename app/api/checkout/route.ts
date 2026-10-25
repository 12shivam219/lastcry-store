import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutOrder, generateSandboxSignature } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createCheckoutOrder({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      deliveryInstructions: body.deliveryInstructions,
      deliveryMethod: body.deliveryMethod || 'STANDARD_SURFACE',
      couponCode: body.couponCode,
      items: body.items || [],
      userId: body.userId,
      idempotencyKey: body.idempotencyKey,
    });

    if (!result.success || !result.order) {
      return NextResponse.json(
        { success: false, error: result.error || 'Checkout validation failed.' },
        { status: 400 }
      );
    }

    const simulatedPaymentId = `pay_sandbox_${Date.now()}`;
    const sandboxSignature = result.order.paymentDetails.isSandbox
      ? generateSandboxSignature(result.order.paymentDetails.providerOrderId, simulatedPaymentId)
      : undefined;

    return NextResponse.json({
      success: true,
      order: result.order,
      paymentChallenge: {
        provider: result.order.paymentDetails.provider,
        providerOrderId: result.order.paymentDetails.providerOrderId,
        amountInr: result.order.totalInr,
        currency: 'INR',
        isSandbox: result.order.paymentDetails.isSandbox,
        // Provided only in sandbox mode so the clearly labelled Sandbox Payment Modal can test valid HMAC verification
        sandboxTestCredentials: result.order.paymentDetails.isSandbox
          ? {
              providerPaymentId: simulatedPaymentId,
              signature: sandboxSignature,
            }
          : undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout request.' },
      { status: 500 }
    );
  }
}
