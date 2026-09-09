import app from './worker';

const DEFAULT_GOOGLE_CLIENT_ID = '969580668423-u2tnqu48ng8qjgjm4dhb45aaaj5b7mtu.apps.googleusercontent.com';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
let jwksCache: { keys: any[]; expiresAt: number } | null = null;

const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
});
const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4))));
function b64Bytes(s: string) {
  const raw = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))));
}
async function signedToken(subject: string, secret: string, ttlSeconds = 30 * 24 * 60 * 60) {
  const payload = `${subject}|${Date.now() + ttlSeconds * 1000}`;
  return `${b64(payload)}.${await hmac(payload, secret)}`;
}
async function verifySession(token: string | undefined, secret: string) {
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
function cookies(request: Request) {
  const out: Record<string, string> = {};
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function userCookie(value: string, maxAge: number) { return `bs_user_session=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`; }
function privateHeaders() { return { 'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache', 'X-Content-Type-Options': 'nosniff' }; }

async function getGoogleJwks() {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(GOOGLE_JWKS_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Google JWKS HTTP ${response.status}`);
  const body: any = await response.json();
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  if (!keys.length) throw new Error('Google JWKS contained no keys');
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 3600);
  jwksCache = { keys, expiresAt: Date.now() + Math.min(Math.max(maxAge, 300), 86400) * 1000 };
  return keys;
}

async function verifyGoogleIdToken(token: string, allowedClientIds: string[]) {
  const parts = token.split('.');
  if (parts.length !== 3) return { identity: null, reason: 'malformed' };
  try {
    const header: any = JSON.parse(unb64(parts[0]));
    const payload: any = JSON.parse(unb64(parts[1]));
    if (header.alg !== 'RS256' || !header.kid) return { identity: null, reason: 'algorithm' };

    const iss = String(payload.iss || '');
    if (iss !== 'https://accounts.google.com' && iss !== 'accounts.google.com') return { identity: null, reason: 'issuer' };

    const audience = String(payload.aud || '');
    if (!allowedClientIds.includes(audience)) return { identity: null, reason: 'audience' };
    if (payload.azp && !allowedClientIds.includes(String(payload.azp))) return { identity: null, reason: 'authorized-party' };

    const exp = Number(payload.exp);
    const iat = Number(payload.iat);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(exp) || exp <= now || (Number.isFinite(iat) && iat > now + 300)) return { identity: null, reason: 'time' };

    const keys = await getGoogleJwks();
    let jwk = keys.find((key: any) => key.kid === header.kid && key.kty === 'RSA' && key.alg === 'RS256');
    if (!jwk) {
      jwksCache = null;
      const refreshed = await getGoogleJwks();
      jwk = refreshed.find((key: any) => key.kid === header.kid && key.kty === 'RSA' && key.alg === 'RS256');
    }
    if (!jwk) return { identity: null, reason: 'key' };

    const cryptoKey = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const validSignature = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, b64Bytes(parts[2]), signingInput);
    if (!validSignature) return { identity: null, reason: 'signature' };

    const email = text(payload.email, 160).toLowerCase();
    const sub = text(payload.sub, 300);
    if (!email || !sub || !/^\S+@\S+\.\S+$/.test(email)) return { identity: null, reason: 'identity' };
    if (payload.email_verified !== true && String(payload.email_verified).toLowerCase() !== 'true') return { identity: null, reason: 'email' };

    return {
      identity: {
        email,
        sub,
        name: text(payload.name, 120),
        picture: text(payload.picture, 500),
      },
      reason: 'ok',
    };
  } catch (error) {
    console.error('Google ID token verification error:', error);
    return { identity: null, reason: 'verification-error' };
  }
}

async function accessUserInfo(accessToken: string) {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) return null;
  const info: any = await response.json().catch(() => null);
  if (!info || String(info.email_verified).toLowerCase() !== 'true') return null;
  const email = text(info.email, 160).toLowerCase();
  const sub = text(info.sub, 300);
  if (!email || !sub) return null;
  return { email, sub, name: text(info.name, 120), picture: text(info.picture, 500) };
}
function publicUser(row: any, identity: { email: string; name?: string; picture?: string }) {
  return { id: row?.id || '', email: row?.email || identity.email, name: row?.full_name || identity.name || identity.email.split('@')[0], phone: row?.phone || '', avatar: identity.picture || undefined, authProvider: row?.auth_provider || 'google' };
}

async function googleLogin(request: Request, env: any) {
  const configuredIds = [env.GOOGLE_CLIENT_ID, env.VITE_GOOGLE_CLIENT_ID]
    .map((value: unknown) => String(value || '').trim())
    .filter(Boolean);
  const allowedClientIds = Array.from(new Set([...configuredIds, DEFAULT_GOOGLE_CLIENT_ID]));
  const secret = String(env.CMS_SESSION_SECRET || '').trim();
  if (!env.DB || !secret || secret.length < 32) return json({ error: 'Google authentication is not configured on the server.' }, 503, privateHeaders());

  const origin = request.headers.get('origin');
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
  const idToken = String(body.idToken || '').trim();
  const accessToken = String(body.accessToken || '').trim();
  if (!idToken && !accessToken) return json({ error: 'Google credential is required.' }, 400, privateHeaders());

  let identity: any = null;
  if (idToken) {
    const verified = await verifyGoogleIdToken(idToken, allowedClientIds);
    if (!verified.identity) {
      console.warn(`Google ID token rejected: ${verified.reason}`);
      return json({ error: 'Google credential verification failed.' }, 401, privateHeaders());
    }
    identity = verified.identity;
  } else if (accessToken) {
    const details = await accessUserInfo(accessToken);
    if (!details) return json({ error: 'Google credential verification failed.' }, 401, privateHeaders());
    identity = details;
  }

  const now = new Date().toISOString();
  const existing = await env.DB.prepare('SELECT id,email,password_hash,full_name,phone,auth_provider FROM users WHERE email=? LIMIT 1').bind(identity.email).all();
  let row: any = existing.results?.[0];
  if (!row) {
    const id = `user-${crypto.randomUUID()}`;
    await env.DB.prepare("INSERT INTO users (id,email,password_hash,full_name,phone,auth_provider,created_at,updated_at) VALUES (?,?,?,?,?,'google',?,?)")
      .bind(id, identity.email, '', identity.name || identity.email.split('@')[0], '', now, now).run();
    row = { id, email: identity.email, full_name: identity.name || identity.email.split('@')[0], phone: '', auth_provider: 'google' };
  } else {
    const provider = String(row.auth_provider || 'email');
    const mergedProvider = provider.includes('google') ? provider : `${provider}+google`;
    await env.DB.prepare('UPDATE users SET full_name=?,auth_provider=?,updated_at=? WHERE email=?')
      .bind(identity.name || row.full_name || identity.email.split('@')[0], mergedProvider, now, identity.email).run();
    row = { ...row, full_name: identity.name || row.full_name, auth_provider: mergedProvider };
  }

  const session = await signedToken(identity.email, secret);
  const headers = new Headers({ ...privateHeaders(), 'Set-Cookie': userCookie(session, 30 * 24 * 60 * 60) });
  return json({ success: true, user: publicUser(row, identity) }, 200, headers);
}

async function travelerSession(request: Request, env: any) {
  const secret = String(env.CMS_SESSION_SECRET || '').trim();
  if (!env.DB || secret.length < 32) return json({ authenticated: false }, 401, privateHeaders());
  const email = await verifySession(cookies(request).bs_user_session, secret);
  if (!email) return json({ authenticated: false }, 401, privateHeaders());
  const result = await env.DB.prepare('SELECT id,email,full_name,phone,auth_provider FROM users WHERE email=? LIMIT 1').bind(email.toLowerCase()).all();
  const row: any = result.results?.[0];
  if (!row) return json({ authenticated: false }, 401, privateHeaders());
  return json({ authenticated: true, user: publicUser(row, { email: row.email }) }, 200, privateHeaders());
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/auth/google' && request.method === 'POST') return googleLogin(request, env);
    if (url.pathname === '/api/auth/traveler/session' && request.method === 'GET') return travelerSession(request, env);
    if (url.pathname === '/api/auth/traveler/logout' && request.method === 'POST') return json({ success: true }, 200, { ...privateHeaders(), 'Set-Cookie': userCookie('', 0) });
    return app.fetch(request, env, ctx);
  },
};
