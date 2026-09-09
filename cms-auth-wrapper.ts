import app from './worker-auth-wrapper';

const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
});
const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))));
}

async function signedToken(subject: string, secret: string, ttlSeconds = 8 * 60 * 60) {
  const payload = `${subject}|${Date.now() + ttlSeconds * 1000}`;
  return `${b64(payload)}.${await hmac(payload, secret)}`;
}

function privateHeaders() {
  return {
    'Cache-Control': 'private, no-store, max-age=0',
    Pragma: 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  };
}

function cmsCookie(value: string, maxAge: number) {
  return `bs_cms_session=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

async function cmsLogin(request: Request, env: any) {
  const secret = String(env.CMS_SESSION_SECRET || '').trim();
  const pin = String(env.CMS_PIN || '');
  const password = String(env.CMS_PASSWORD || '');
  const allowedEmails = new Set(String(env.CMS_STAFF_EMAILS || '').split(',').map((value) => text(value, 160).toLowerCase()).filter(Boolean));

  if (!secret || secret.length < 32 || pin.length < 6 || password.length < 12 || !allowedEmails.size) {
    return json({ error: 'CMS authentication is not configured on the server.' }, 503, privateHeaders());
  }

  const origin = request.headers.get('Origin');
  if (origin) {
    const requestOrigin = new URL(request.url).origin;
    const allowedOrigins = new Set([
      requestOrigin,
      'https://mybhaktisathi.com',
      'https://www.mybhaktisathi.com',
      'https://bhakti-sathi-one.mybhaktisathi.workers.dev',
    ]);
    if (!allowedOrigins.has(origin)) return json({ error: 'Invalid authentication origin.' }, 403, privateHeaders());
  }

  const body: any = await request.json().catch(() => ({}));
  const email = text(body.email, 160).toLowerCase();
  const suppliedPin = String(body.pin || '');
  const suppliedPassword = String(body.password || '');

  // The PIN is verified directly in the same server transaction as the CMS
  // credentials. This avoids relying on browser cookie persistence between
  // the PIN step and credential step while keeping the PIN out of storage.
  if (suppliedPin !== pin) return json({ success: false, error: 'Invalid PIN.' }, 401, privateHeaders());
  if (!allowedEmails.has(email) || suppliedPassword !== password) {
    return json({ success: false, error: 'Invalid credentials.' }, 401, privateHeaders());
  }

  const session = await signedToken(email, secret);
  const headers = new Headers(privateHeaders());
  headers.append('Set-Cookie', cmsCookie(session, 8 * 60 * 60));
  return json({ success: true, authorized: true, user: { email, role: 'super_admin' } }, 200, headers);
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/auth/cms/login' && request.method === 'POST') {
      return cmsLogin(request, env);
    }
    return app.fetch(request, env, ctx);
  },
};
