/**
 * Booking Reference Number Helper
 * Generates and formats clean, human-memorable booking numbers like 'HH76868'
 */

export function formatBookingNumber(id?: string | null): string {
  if (!id) return generateBookingNumber();
  
  // If already clean HH followed by digits, format uppercase
  const trimmed = id.trim();
  if (/^HH-?\d{4,6}$/i.test(trimmed)) {
    return trimmed.replace('-', '').toUpperCase();
  }

  // If inq-1788542365656 or similar timestamp ID, extract clean 5-digit number
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 5) {
    return `HH${digits.slice(-5)}`;
  }

  // Fallback hash to 5-digit deterministic memorable reference
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash << 5) - hash + trimmed.charCodeAt(i);
    hash |= 0;
  }
  const cleanNum = Math.abs(hash % 90000) + 10000;
  return `HH${cleanNum}`;
}

export function generateBookingNumber(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `HH${randomNum}`;
}
