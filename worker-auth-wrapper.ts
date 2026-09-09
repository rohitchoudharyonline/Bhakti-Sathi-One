import app from './worker';

const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
});
const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4))));

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

async function tokenInfo(token: string, kind: 'id_token' | 'access_token', clientId: string) {
  const endpoint = kind === 'id_token'
    ? `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    : `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`;
  const response = await fetch(endpoint);
  if (!response.ok) return null;
  const info: any = await response.json().catch(() => null);
  if (!info) return null;
  const audience = String(info.aud || info.issued_to || info.audience || '');
  if (audience !== clientId) return null;
  if (kind === 'id_token' && (!info.exp || Number(info.exp) * 1000 <= Date.now())) return null;
  if (String(info.verified_email).toLowerCase() !== 'true') return null;
  const email = text(info.email, 160).toLowerCase();
  const sub = text(info.sub || info.user_id, 300);
  if (!email || !sub || !/^\S+@\S+\.\S+$/.test(email)) return null;
  return { email, sub, name: '', picture: '' };
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
  const clientId = String(env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const secret = String(env.CMS_SESSION_SECRET || '').trim();
  if (!env.DB || !clientId || secret.length < 32) return json({ error: 'Google authentication is not configured on the server.' }, 503, privateHeaders());
  const body: any = await request.json().catch(() => ({}));
  const idToken = String(body.idToken || '').trim();
  const accessToken = String(body.accessToken || '').trim();
  if (!idToken && !accessToken) return json({ error: 'Google credential is required.' }, 400, privateHeaders());

  let identity: any = idToken ? await tokenInfo(idToken, 'id_token', clientId) : null;
  if (!identity && accessToken) {
    identity = await tokenInfo(accessToken, 'access_token', clientId);
    const details = identity ? await accessUserInfo(accessToken) : null;
    if (!details || details.sub !== identity.sub || details.email !== identity.email) identity = null;
    else identity = { ...identity, ...details };
  }
  if (!identity) return json({ error: 'Google credential verification failed.' }, 401, privateHeaders());

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
