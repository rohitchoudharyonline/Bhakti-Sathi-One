/**
 * Email validation utility for enquiry and booking submissions.
 * Verifies standard email structure (e.g. username@domain.extension)
 * before enabling submission buttons across customer enquiry forms.
 */

/**
 * Validates that an email address is correctly formatted.
 * - Must not be empty or whitespace only
 * - Must contain an alphanumeric/standard local-part
 * - Must contain '@' separator
 * - Must have a valid domain and TLD with at least 2 characters
 */
export const isValidEmail = (email: string | undefined | null): boolean => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Standard RFC-compliant regex for practical web email verification
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
};

export interface EmailVerificationState {
  isValid: boolean;
  message: string;
  status: 'empty' | 'invalid' | 'valid';
}

/**
 * Detailed verification helper providing human-friendly feedback messages
 * for interactive enquiry input fields.
 */
export const getEmailVerificationState = (email: string): EmailVerificationState => {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      isValid: false,
      message: 'Email address is required for booking sync & verification',
      status: 'empty',
    };
  }

  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      message: 'Missing "@" symbol in email address',
      status: 'invalid',
    };
  }

  const [localPart, domainPart] = trimmed.split('@');
  if (!localPart) {
    return {
      isValid: false,
      message: 'Please provide the username part before "@"',
      status: 'invalid',
    };
  }

  if (!domainPart || !domainPart.includes('.')) {
    return {
      isValid: false,
      message: 'Please enter domain extension (e.g. @gmail.com)',
      status: 'invalid',
    };
  }

  const parts = domainPart.split('.');
  const tld = parts[parts.length - 1];
  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      message: 'Please enter a valid domain (e.g. .com, .in, .org)',
      status: 'invalid',
    };
  }

  if (!isValidEmail(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid email format (e.g. name@domain.com)',
      status: 'invalid',
    };
  }

  return {
    isValid: true,
    message: 'Valid email address verified',
    status: 'valid',
  };
};
