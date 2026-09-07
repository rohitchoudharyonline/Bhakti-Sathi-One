/**
 * Price formatting helper for Bhakti Sathi tour packages
 * Gracefully handles number prices and "Price on Request" states
 */

export interface PriceDisplayResult {
  isPriceOnRequest: boolean;
  displayPrice: string;
  originalPrice?: string;
  savingsText?: string;
  savingsAmount: number;
  rawPrice: number;
}

export function formatPackagePrice(
  price?: number,
  discountedPrice?: number,
  currency = '₹',
  forcePriceOnRequest?: boolean
): PriceDisplayResult {
  // If explicitly flagged or price is missing/0/negative
  if (
    forcePriceOnRequest ||
    price === undefined ||
    price === null ||
    price <= 0
  ) {
    return {
      isPriceOnRequest: true,
      displayPrice: 'Price on Request',
      savingsAmount: 0,
      rawPrice: 0,
    };
  }

  const effectivePrice = discountedPrice && discountedPrice > 0 && discountedPrice < price
    ? discountedPrice
    : price;

  const savings = Math.max(0, price - effectivePrice);

  return {
    isPriceOnRequest: false,
    displayPrice: `${currency}${effectivePrice.toLocaleString('en-IN')}`,
    originalPrice: savings > 0 ? `${currency}${price.toLocaleString('en-IN')}` : undefined,
    savingsText: savings > 0 ? `Save ${currency}${savings.toLocaleString('en-IN')}` : undefined,
    savingsAmount: savings,
    rawPrice: effectivePrice,
  };
}
