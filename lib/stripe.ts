import Stripe from 'stripe';
import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Client-side Stripe instance
let stripePromise: Promise<StripeClient | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

// Utility functions
export const formatAmountForStripe = (amount: number): number => {
  // Convert pounds to pence (Stripe requires smallest currency unit)
  return Math.round(amount * 100);
};

export const formatAmountForDisplay = (amount: number): string => {
  // Convert pence to pounds
  return (amount / 100).toFixed(2);
};

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'gbp',
  metadata?: Stripe.MetadataParam
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: metadata || {},
  });
};

export const updatePaymentIntent = async (
  paymentIntentId: string,
  params: Stripe.PaymentIntentUpdateParams
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.update(paymentIntentId, params);
};

export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.cancel(paymentIntentId);
};
