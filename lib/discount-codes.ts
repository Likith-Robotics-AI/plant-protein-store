/**
 * Discount Code Generation Utilities
 * Generates unique discount codes for review incentives
 */

/**
 * Generates a unique discount code for review rewards
 * Format: REVIEW-XXXXXXXX (e.g., REVIEW-A3B7C9D1)
 */
export function generateReviewDiscountCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes similar characters (I, O, 0, 1)
  const length = 8;
  let code = 'REVIEW-';

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}

/**
 * Calculates expiry date for discount code (30 days from now)
 */
export function getDiscountExpiryDate(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return expiry;
}

/**
 * Formats expiry date for display
 */
export function formatExpiryDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Discount details for review rewards
 */
export const REVIEW_DISCOUNT = {
  percentage: 10,
  description: '10% off your next order',
  minOrder: 0, // No minimum order required
  oneTimeUse: true,
  validDays: 30,
} as const;
