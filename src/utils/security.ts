// Client-side helpers are defense-in-depth only. Authorization and identity verification happen on the server.

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .trim();
}

export function isValidGoogleEmail(email: string): boolean {
  const sanitized = sanitizeInput(email).toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitized);
}

export function generateCsrfToken(): string {
  if (typeof window === 'undefined' || !window.crypto?.getRandomValues) {
    throw new Error('Secure browser randomness is required for authentication.');
  }
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  sessionStorage.setItem('hh_auth_csrf_token', token);
  return token;
}

export function verifyCsrfToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  const stored = sessionStorage.getItem('hh_auth_csrf_token');
  if (!stored || !token || stored.length !== token.length) return false;
  let difference = 0;
  for (let i = 0; i < stored.length; i += 1) difference |= stored.charCodeAt(i) ^ token.charCodeAt(i);
  return difference === 0;
}

class AuthRateLimiter {
  private attempts = 0;
  private lastAttemptTimestamp = 0;
  private lockoutUntil = 0;

  public checkAllowed(): { allowed: boolean; remainingSec?: number; reason?: string } {
    const now = Date.now();
    if (now < this.lockoutUntil) {
      const remainingSec = Math.ceil((this.lockoutUntil - now) / 1000);
      return { allowed: false, remainingSec, reason: `Too many rapid requests detected. Security lockout active for ${remainingSec}s.` };
    }
    if (now - this.lastAttemptTimestamp > 30000) this.attempts = 0;
    this.attempts += 1;
    this.lastAttemptTimestamp = now;
    if (this.attempts > 6) {
      this.lockoutUntil = now + 15000;
      return { allowed: false, remainingSec: 15, reason: 'Too many authentication attempts. Please wait 15 seconds.' };
    }
    return { allowed: true };
  }

  public reset(): void {
    this.attempts = 0;
    this.lockoutUntil = 0;
  }
}

export const authRateLimiter = new AuthRateLimiter();
