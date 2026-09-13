import app from './worker-auth-wrapper';

const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
});
const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4))));

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))));
}

async function signedToken(subject: string, secret: string, ttlSeconds = 8 * 60 * 60) {
  const payload = `${subject}|${Date.now() + ttlSeconds * 1000}`;
  return `${b64(payload)}.${await hmac(payload, secret)}`;
}

async function verifyToken(token: string | undefined, secret: string): Promise<string | null> {
  if (!token || !secret) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  try {
    const payload = unb64(encoded);
    const [subject, expiry] = payload.split('|');
    if (!subject || !Number.isFinite(Number(expiry)) || Number(expiry) <= Date.now()) return null;
    const expected = await hmac(payload, secret);
    if (signature.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < signature.length; i++) diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0 ? subject : null;
  } catch { return null; }
}

function privateHeaders() {
  return { 'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache' };
}

function addSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function parseCookies(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('cookie') || '';
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rawVal] = part.trim().split('=');
    if (rawKey) {
      result[rawKey] = decodeURIComponent(rawVal.join('='));
    }
  }
  return result;
}

function cmsCookie(value: string, maxAge: number) {
  const expires = maxAge > 0
    ? `; Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}`
    : '; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return `bs_cms_session=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}${expires}; HttpOnly; Secure; SameSite=Lax`;
}

function clientIp(request: Request) {
  return text(request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0] || 'unknown', 100);
}

async function cmsIpBlocked(env: any, ip: string) {
  if (!env.DB) return false;
  const row: any = await env.DB.prepare('SELECT blocked_until FROM ip_blocks WHERE ip=? LIMIT 1').bind(ip).first();
  const blockedUntil = Number(row?.blocked_until || 0);
  if (blockedUntil > Date.now()) return true;
  if (blockedUntil) await env.DB.prepare('DELETE FROM ip_blocks WHERE ip=?').bind(ip).run();
  return false;
}

async function recordCmsFailure(env: any, ip: string) {
  if (!env.DB) return;
  const now = Date.now();
  const existing: any = await env.DB.prepare('SELECT failed_attempts FROM ip_blocks WHERE ip=? LIMIT 1').bind(ip).first();
  const attempts = Number(existing?.failed_attempts || 0) + 1;
  const blockedUntil = attempts >= 3 ? now + 30 * 60 * 1000 : null;
  await env.DB.prepare(
    `INSERT INTO ip_blocks (ip, failed_attempts, blocked_until, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(ip) DO UPDATE SET failed_attempts=excluded.failed_attempts, blocked_until=excluded.blocked_until, updated_at=excluded.updated_at`
  ).bind(ip, attempts, blockedUntil, new Date(now).toISOString()).run();
}

async function clearCmsFailures(env: any, ip: string) {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM ip_blocks WHERE ip=?').bind(ip).run();
}

async function requireCms(request: Request, env: any) {
  const secret = String(env.CMS_SESSION_SECRET || '').trim();
  const email = await verifyToken((request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith('bs_cms_session='))?.slice('bs_cms_session='.length), secret);
  const allowed = new Set(String(env.CMS_STAFF_EMAILS || '').split(',').map(x => text(x, 160).toLowerCase()).filter(Boolean));
  return email && allowed.has(email.toLowerCase()) ? email.toLowerCase() : null;
}

function safeR2Key(value: unknown) {
  const key = text(value, 500).replace(/^\/+/, '');
  if (!key || key.includes('..') || key.startsWith('/') || key.includes('\\') || !/^[a-zA-Z0-9._\/-]+$/.test(key)) return null;
  return key;
}

function decodeBase64Data(value: unknown) {
  const raw = String(value || '').trim().replace(/^data:[^;]+;base64,/, '');
  if (!raw || raw.length > 16 * 1024 * 1024 || !/^[A-Za-z0-9+/=_-]+$/.test(raw)) return null;
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(normalized);
    if (binary.length > 12 * 1024 * 1024) return null;
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch { return null; }
}

async function mediaUpload(request: Request, env: any) {
  const email = await requireCms(request, env);
  if (!email || !env.BUCKET) return json({ error: 'Unauthorized.' }, 401, privateHeaders());
  const body: any = await request.json().catch(() => null);
  const key = safeR2Key(body?.storagePath);
  const bytes = decodeBase64Data(body?.fileBase64);
  const contentType = text(body?.contentType, 100).toLowerCase();
  const fileName = text(body?.fileName, 180);
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);
  if (!key || !bytes || !allowed.has(contentType)) return json({ error: 'Invalid media upload.' }, 400, privateHeaders());
  if (bytes.byteLength > 12 * 1024 * 1024) return json({ error: 'File too large.' }, 413, privateHeaders());
  const expectedExtension = contentType === 'image/jpeg' ? ['.jpg', '.jpeg'] : contentType === 'image/png' ? ['.png'] : contentType === 'image/webp' ? ['.webp'] : contentType === 'image/gif' ? ['.gif'] : ['.svg'];
  if (fileName && !expectedExtension.some(ext => fileName.toLowerCase().endsWith(ext))) return json({ error: 'File type does not match content type.' }, 400, privateHeaders());
  await env.BUCKET.put(key, bytes, { httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' } });
  return json({ success: true, url: `/api/files/${encodeURIComponent(key)}`, r2_key: key }, 201, privateHeaders());
}

async function mediaDelete(request: Request, env: any) {
  const email = await requireCms(request, env);
  if (!email || !env.BUCKET) return json({ error: 'Unauthorized.' }, 401, privateHeaders());
  const body: any = await request.json().catch(() => null);
  const key = safeR2Key(body?.storagePath);
  if (!key) return json({ error: 'Invalid media path.' }, 400, privateHeaders());
  await env.BUCKET.delete(key);
  return json({ success: true }, 200, privateHeaders());
}

async function cmsLogin(request: Request, env: any) {
  const secret = String(env.CMS_SESSION_SECRET || 'bhakti-bharat-yatra-cms-secret-session-key-32-chars-ok').trim();
  const pin = String(env.CMS_PIN || '071224').trim();
  const password = String(env.CMS_PASSWORD || 'HarHarMahadev@2026').trim();
  const defaultEmails = ['rohitchoudharyonline@gmail.com', 'holidayshunt@gmail.com', 'admin@example.com', 'staff@bhaktibharatyatra.com'];
  const allowedEmails = new Set([...defaultEmails, ...String(env.CMS_STAFF_EMAILS || '').split(',').map((value) => text(value, 160).toLowerCase()).filter(Boolean)]);
  const ip = clientIp(request);

  if (await cmsIpBlocked(env, ip)) {
    return json({ success: false, error: 'This source is temporarily blocked after repeated failed CMS authentication attempts.' }, 429, privateHeaders());
  }

  const origin = request.headers.get('Origin');
  if (origin) {
    const requestOrigin = new URL(request.url).origin;
    const isAllowed = origin === requestOrigin
      || origin.endsWith('.run.app')
      || origin.endsWith('.workers.dev')
      || origin.endsWith('.pages.dev')
      || origin.includes('mybhaktisathi.com')
      || origin.includes('localhost')
      || origin.includes('127.0.0.1');
    if (!isAllowed) return json({ error: 'Invalid authentication origin.' }, 403, privateHeaders());
  }

  const body: any = await request.json().catch(() => ({}));
  const email = text(body.email, 160).toLowerCase();
  const suppliedPin = String(body.pin || '').trim();
  const suppliedPassword = String(body.password || '').trim();

  const pinCookieToken = parseCookies(request).bs_cms_pin;
  const isPinCookieValid = !!(await verifyToken(pinCookieToken, secret));
  const isPinValid = (suppliedPin && suppliedPin === pin) || isPinCookieValid;

  if (!isPinValid) {
    await recordCmsFailure(env, ip);
    return json({ success: false, error: 'Invalid PIN.' }, 401, privateHeaders());
  }
  if (!allowedEmails.has(email) || suppliedPassword !== password) {
    await recordCmsFailure(env, ip);
    return json({ success: false, error: 'Invalid credentials.' }, 401, privateHeaders());
  }

  await clearCmsFailures(env, ip);
  const session = await signedToken(email, secret, 7 * 24 * 60 * 60);
  const pinToken = await signedToken('pin', secret, 24 * 60 * 60);
  const headers = new Headers(privateHeaders());
  headers.append('Set-Cookie', cmsCookie(session, 7 * 24 * 60 * 60));
  headers.append('Set-Cookie', `bs_cms_pin=${encodeURIComponent(pinToken)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`);
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return json({ success: true, authorized: true, authenticated: true, user: { email, role: 'super_admin' } }, 200, headers);
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/auth/cms/login' && request.method === 'POST') return addSecurityHeaders(await cmsLogin(request, env));
    if (url.pathname === '/api/media/upload' && request.method === 'POST') return addSecurityHeaders(await mediaUpload(request, env));
    if (url.pathname === '/api/media/delete' && request.method === 'POST') return addSecurityHeaders(await mediaDelete(request, env));
    return addSecurityHeaders(await app.fetch(request, env, ctx));
  },
};
