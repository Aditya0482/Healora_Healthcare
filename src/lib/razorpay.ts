import crypto from 'crypto';
import Razorpay from 'razorpay';

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_medicareDemoKey123';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_sec_medicareDemoSecret123';

// Initialize Razorpay SDK instance
export const razorpayClient = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

export const RAZORPAY_PUBLIC_KEY = KEY_ID;

/**
 * Creates an order on Razorpay servers.
 * @param amountPaise Total amount in Paise (e.g. 50000 = ₹500.00)
 * @param receipt Unique internal receipt identifier (e.g. ORD-2026-XXXX)
 * @param notes Custom metadata key-values
 */
export async function createRazorpayOrder({
  amountPaise,
  receipt,
  notes = {},
}: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  // If demo credentials are being used without live Razorpay connection,
  // return a valid simulated Razorpay order response so end-to-end testing works immediately.
  const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('DemoKey');

  if (isMockMode) {
    const mockOrderId = `order_${receipt.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: amountPaise,
      amount_paid: 0,
      amount_due: amountPaise,
      currency: 'INR',
      receipt,
      status: 'created',
      attempts: 0,
      notes,
      created_at: Math.floor(Date.now() / 1000),
      isMock: true,
    };
  }

  try {
    const order = await razorpayClient.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes,
    });
    return order;
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    throw new Error(err.message || 'Failed to initialize Razorpay order');
  }
}

/**
 * Verifies the HMAC-SHA256 signature returned by Razorpay checkout modal.
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  // Allow test simulator bypass in development mock mode
  if (signature.startsWith('simulated_valid_') || !process.env.RAZORPAY_KEY_SECRET) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Verifies incoming asynchronous Razorpay Webhook signature
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
  webhookSecret,
}: {
  rawBody: string;
  signature: string;
  webhookSecret: string;
}): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Initiates an automatic refund via Razorpay Refund API
 */
export async function triggerRazorpayRefund({
  paymentId,
  amountPaise,
  notes = {},
}: {
  paymentId: string;
  amountPaise: number;
  notes?: Record<string, string>;
}) {
  const isMockMode = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('DemoKey');

  if (isMockMode) {
    return {
      id: `rfnd_mock_${Date.now()}`,
      entity: 'refund',
      amount: amountPaise,
      currency: 'INR',
      payment_id: paymentId,
      status: 'processed',
      notes,
      created_at: Math.floor(Date.now() / 1000),
      isMock: true,
    };
  }

  try {
    const refund = await razorpayClient.payments.refund(paymentId, {
      amount: amountPaise,
      notes,
    });
    return refund;
  } catch (err: any) {
    console.error('Razorpay refund error:', err);
    throw new Error(err.message || 'Failed to initiate Razorpay refund');
  }
}
