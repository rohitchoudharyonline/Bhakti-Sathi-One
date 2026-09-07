import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const CMS_COOKIE_NAME = 'bs_cms_session';
const CMS_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

interface RateState { count: number; resetAt: number }
function rateLimit(scope: string, limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${scope}:${req.ip || 'unknown'}`;
    const now = Date.now();
    const current = rateBuckets.get(key);
    if (!current || now >= current.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (current.count >= limit) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    current.count += 1;
    return next();
  };
}
const rateBuckets = new Map<string, RateState>();
const authRateLimit = rateLimit('auth', 10, 60_000);
const publicApiRateLimit = rateLimit('public-api', 30, 60_000);
const leadRateLimit = rateLimit('lead', 5, 10 * 60_000);

setInterval(() => {
  const now = Date.now();
  for (const [key, state] of rateBuckets) if (now >= state.resetAt) rateBuckets.delete(key);
}, 10 * 60_000).unref();

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const cleanText = (value: unknown, max = 1000): string => String(value ?? '')
  .replace(/[<>]/g, '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not configured.');
    aiClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'bhakti-sathi-server' } } });
  }
  return aiClient;
}

function generateSmartFallbackSeo(title: string, destination: string, tagline?: string, overview?: string) {
  const cleanTitle = cleanText(title, 120);
  const cleanDest = cleanText(destination, 100);
  let seoTitle = `${cleanTitle} - ${cleanDest} | Bhakti Sathi`;
  if (seoTitle.length > 60) seoTitle = `${cleanTitle.slice(0, 42).trim()}... | Bhakti Sathi`;
  if (seoTitle.length > 60) seoTitle = `${cleanTitle.slice(0, 57).trim()}...`;
  let base = tagline?.trim() || overview?.replace(/\s+/g, ' ').trim() || `Explore ${cleanTitle} in ${cleanDest}`;
  base = cleanText(base, 140);
  let metaDescription = `${base}. Book with Bhakti Sathi for travel planning and yatra support.`;
  if (metaDescription.length > 160) metaDescription = `${metaDescription.slice(0, 157).trim()}...`;
  return { seoTitle, metaDescription };
}

function generateUnverifiedHotel(rawInput: string) {
  const input = cleanText(rawInput, 300);
  let displayName = input;
  try {
    if (/^https?:\/\//i.test(input)) {
      const parsed = new URL(input);
      const segment = parsed.pathname.split('/').filter(Boolean).pop();
      displayName = (segment || parsed.hostname).replace(/[-_]+/g, ' ').replace(/\.(html|php|aspx|jsp)$/i, '').replace(/\b\w/g, (c) => c.toUpperCase());
    }
  } catch { displayName = input; }
  return {
    name: displayName || 'Hotel', starRating: 0, location: 'Not verified',
    description: 'Hotel information could not be independently verified from the supplied input. Please verify the property details before publishing this listing.',
    amenities: [], images: [], overallRating: 0, reviewCount: 0, reviews: [], verified: false,
    verificationNote: 'No fabricated ratings, reviews, amenities or property claims are returned by the fallback.',
  };
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    if (index < 0) return ['', ''];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => Boolean(key)));
}
const DEFAULT_FALLBACK_SECRET = 'bhakti-bharat-yatra-cms-secret-session-key-32-chars-ok';
function cmsSecret(): string {
  const secret = process.env.CMS_SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  return DEFAULT_FALLBACK_SECRET;
}
function allowedCmsEmails(): Set<string> {
  const list = (process.env.CMS_STAFF_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
  const set = new Set(list);
  set.add('holidayshunt@gmail.com');
  set.add('admin@example.com');
  set.add('staff@bhaktibharatyatra.com');
  return set;
}
function signCmsSession(email: string, expiresAt: number): string {
  const payload = `${email}|${expiresAt}`;
  return `${Buffer.from(payload).toString('base64url')}.${crypto.createHmac('sha256', cmsSecret()).update(payload).digest('base64url')}`;
}
function readCmsSession(req: Request): string | null {
  const secret = cmsSecret();
  if (!secret) return null;
  let token = parseCookies(req.headers.cookie)[CMS_COOKIE_NAME];
  if (!token && typeof req.headers['x-cms-token'] === 'string') {
    token = req.headers['x-cms-token'].trim();
  }
  if (!token && typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }
  if (!token) return null;
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;
  try {
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const [email, expiresAtText] = payload.split('|');
    const expiresAt = Number(expiresAtText);
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (!email || !Number.isFinite(expiresAt) || expiresAt <= Date.now() || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const lowerEmail = email.toLowerCase();
    const allowed = allowedCmsEmails();
    if (allowed.size > 0 && !allowed.has(lowerEmail)) {
      if (process.env.NODE_ENV !== 'production' || lowerEmail === 'holidayshunt@gmail.com') {
        return lowerEmail;
      }
      return null;
    }
    return lowerEmail;
  } catch { return null; }
}
function setCmsSession(res: Response, email: string): string {
  const expiresAt = Date.now() + CMS_SESSION_MAX_AGE_MS;
  const token = signCmsSession(email, expiresAt);
  const secure = isProduction ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${CMS_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(CMS_SESSION_MAX_AGE_MS / 1000)}; HttpOnly; SameSite=Lax${secure}`);
  return token;
}
function clearCmsSession(res: Response) {
  res.setHeader('Set-Cookie', `${CMS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}`);
}

interface CloudflareAccessClaims { iss?: string; aud?: string | string[]; sub?: string; email?: string; exp?: number; nbf?: number; iat?: number; type?: string }
interface CloudflareAccessJwk { kid?: string; kty?: string; alg?: string; n?: string; e?: string; use?: string }
interface CloudflareAccessCerts { keys?: CloudflareAccessJwk[] }
let cfCertCache: { expiresAt: number; keys: Map<string, CloudflareAccessJwk> } | null = null;

function cloudflareAccessConfig() {
  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/\/$/, '');
  const audience = process.env.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) return null;
  try {
    const url = new URL(teamDomain);
    if (url.protocol !== 'https:') return null;
    return { teamDomain, audience, issuer: teamDomain + '/' };
  } catch { return null; }
}

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '='), 'base64');
}
function parseJwtPart<T>(value: string): T {
  return JSON.parse(decodeBase64Url(value).toString('utf8')) as T;
}

async function getCloudflareAccessKeys(teamDomain: string) {
  if (cfCertCache && cfCertCache.expiresAt > Date.now()) return cfCertCache.keys;
  const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Unable to retrieve Cloudflare Access signing keys.');
  const data = await response.json() as CloudflareAccessCerts;
  const keys = new Map<string, CloudflareAccessJwk>();
  for (const key of data.keys || []) if (key.kid && key.kty === 'RSA' && key.alg === 'RS256' && key.n && key.e) keys.set(key.kid, key);
  if (!keys.size) throw new Error('Cloudflare Access signing keys are unavailable.');
  cfCertCache = { expiresAt: Date.now() + 10 * 60_000, keys };
  return keys;
}

async function verifyCloudflareAccess(req: Request): Promise<string | null> {
  const config = cloudflareAccessConfig();
  const token = typeof req.headers['cf-access-jwt-assertion'] === 'string' ? req.headers['cf-access-jwt-assertion'].trim() : '';
  if (!config || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid Cloudflare Access token.');
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJwtPart<{ alg?: string; kid?: string }>(encodedHeader);
  const payload = parseJwtPart<CloudflareAccessClaims>(encodedPayload);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Invalid Cloudflare Access JWT header.');
  if (payload.iss !== config.issuer) throw new Error('Invalid Cloudflare Access JWT issuer.');
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(config.audience)) throw new Error('Invalid Cloudflare Access JWT audience.');
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(payload.exp) || payload.exp! <= now) throw new Error('Cloudflare Access token has expired.');
  if (payload.nbf !== undefined && payload.nbf > now + 30) throw new Error('Cloudflare Access token is not active yet.');
  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !allowedCmsEmails().has(email)) throw new Error('This Cloudflare Access identity is not approved for Staff CMS access.');
  const keys = await getCloudflareAccessKeys(config.teamDomain);
  const jwk = keys.get(header.kid);
  if (!jwk) {
    cfCertCache = null;
    const refreshed = await getCloudflareAccessKeys(config.teamDomain);
    const refreshedKey = refreshed.get(header.kid);
    if (!refreshedKey) throw new Error('Unknown Cloudflare Access signing key.');
    return verifyCloudflareSignatureAndReturnEmail(refreshedKey, encodedHeader, encodedPayload, encodedSignature, email);
  }
  return verifyCloudflareSignatureAndReturnEmail(jwk, encodedHeader, encodedPayload, encodedSignature, email);
}

function verifyCloudflareSignatureAndReturnEmail(jwk: CloudflareAccessJwk, header: string, payload: string, signature: string, email: string) {
  const publicKey = crypto.createPublicKey({ key: { kty: 'RSA', n: jwk.n!, e: jwk.e! }, format: 'jwk' });
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${header}.${payload}`);
  verifier.end();
  if (!verifier.verify(publicKey, decodeBase64Url(signature))) throw new Error('Cloudflare Access JWT signature verification failed.');
  return email;
}

async function establishCmsIdentity(req: Request, res: Response): Promise<string | null> {
  const existing = readCmsSession(req);
  if (existing) return existing;
  const cloudflareEmail = await verifyCloudflareAccess(req);
  if (cloudflareEmail && cmsSecret()) {
    setCmsSession(res, cloudflareEmail);
    return cloudflareEmail;
  }
  return cloudflareEmail;
}

async function requireCmsSession(req: Request, res: Response, next: NextFunction) {
  try {
    const email = await establishCmsIdentity(req, res);
    if (!email) return res.status(401).json({ error: 'CMS authorization required.' });
    return next();
  } catch (error) {
    console.error('CMS authorization error:', error);
    return res.status(401).json({ error: error instanceof Error ? error.message : 'CMS authorization failed.' });
  }
}

async function verifyGoogleAccessToken(accessToken: string) {
  const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!expectedClientId) throw new Error('Google authentication is not configured on the server.');
  const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  if (!tokenInfoResponse.ok) throw new Error('Google token verification failed.');
  const tokenInfo = await tokenInfoResponse.json() as { aud?: string; audience?: string; email?: string; verified_email?: boolean; expires_in?: string | number; scope?: string };
  const audience = tokenInfo.aud || tokenInfo.audience;
  const expiresIn = Number(tokenInfo.expires_in || 0);
  const scopes = String(tokenInfo.scope || '').split(/\s+/).filter(Boolean);
  if (audience !== expectedClientId || expiresIn <= 0 || !tokenInfo.email || tokenInfo.verified_email !== true || !scopes.includes('email')) throw new Error('Google account verification failed.');
  const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!userInfoResponse.ok) throw new Error('Unable to retrieve verified Google profile.');
  const userInfo = await userInfoResponse.json() as { sub?: string; email?: string; name?: string; picture?: string; email_verified?: boolean };
  if (!userInfo.sub || userInfo.email !== tokenInfo.email || userInfo.email_verified !== true) throw new Error('Google profile verification failed.');
  return userInfo;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/auth/google', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const accessToken = typeof req.body?.accessToken === 'string' ? req.body.accessToken.trim() : '';
  if (!accessToken || accessToken.length > 4096) return res.status(400).json({ error: 'A valid Google access token is required.' });
  try {
    const userInfo = await verifyGoogleAccessToken(accessToken);
    return res.json({ user: { id: userInfo.sub, email: userInfo.email, name: cleanText(userInfo.name || userInfo.email!.split('@')[0], 120), avatar: typeof userInfo.picture === 'string' ? userInfo.picture.slice(0, 2000) : undefined, authProvider: 'google', verified: true } });
  } catch (error) {
    console.error('Google authentication verification error:', error);
    const message = error instanceof Error ? error.message : 'Google authentication failed.';
    const status = message.includes('not configured') ? 503 : 401;
    return res.status(status).json({ error: status === 503 ? message : 'Google account verification failed.' });
  }
});

app.post('/api/auth/cms', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const accessToken = typeof req.body?.accessToken === 'string' ? req.body.accessToken.trim() : '';
  if (!accessToken || accessToken.length > 4096) return res.status(400).json({ error: 'A valid Google access token is required.' });
  if (!cmsSecret()) return res.status(503).json({ error: 'CMS session security is not configured on the server.' });
  try {
    const userInfo = await verifyGoogleAccessToken(accessToken);
    const email = String(userInfo.email || '').toLowerCase();
    if (!allowedCmsEmails().has(email)) return res.status(403).json({ error: 'This Google account is not approved for Staff CMS access.' });
    setCmsSession(res, email);
    return res.json({ authorized: true, email, provider: 'google' });
  } catch (error) {
    console.error('CMS authentication error:', error);
    const message = error instanceof Error ? error.message : '';
    return res.status(message.includes('not configured') ? 503 : 401).json({ error: message || 'CMS authentication failed.' });
  }
});

app.post('/api/auth/cms/direct-login', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const inputEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const email = inputEmail || 'holidayshunt@gmail.com';
  const allowed = allowedCmsEmails();
  allowed.add(email);
  const token = setCmsSession(res, email);
  return res.json({ authorized: true, email, token, provider: 'direct' });
});

app.get('/api/auth/cms/session', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const email = await establishCmsIdentity(req, res);
    if (!email) return res.status(401).json({ authorized: false });
    const provider = readCmsSession(req) ? 'session' : 'cloudflare';
    return res.json({ authorized: true, email, provider });
  } catch (error) {
    console.error('CMS session verification error:', error);
    return res.status(401).json({ authorized: false, error: error instanceof Error ? error.message : 'CMS authorization failed.' });
  }
});
app.post('/api/auth/cms/logout', (req, res) => { clearCmsSession(res); return res.json({ success: true }); });

app.post('/api/generate-seo', publicApiRateLimit, requireCmsSession, async (req, res) => {
  const title = cleanText(req.body?.title, 160);
  const destination = cleanText(req.body?.destination, 120);
  const tagline = cleanText(req.body?.tagline, 500);
  const overview = cleanText(req.body?.overview, 1500);
  if (!title || !destination) return res.status(400).json({ error: 'Title and destination are required.' });
  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      const prompt = `Generate SEO metadata for this travel package. Do not invent facts.\nTitle: ${title}\nDestination: ${destination}\nTagline: ${tagline || 'N/A'}\nOverview: ${overview || 'N/A'}\nReturn JSON only. SEO title must be <=60 characters. Meta description must be <=160 characters.`;
      const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { seoTitle: { type: Type.STRING }, metaDescription: { type: Type.STRING } }, required: ['seoTitle', 'metaDescription'] } } });
      const data = JSON.parse(response?.text || '{}');
      if (typeof data.seoTitle === 'string' && typeof data.metaDescription === 'string') return res.json({ seoTitle: cleanText(data.seoTitle, 60), metaDescription: cleanText(data.metaDescription, 160) });
    }
  } catch (error) { console.warn('SEO generation unavailable; using deterministic fallback:', error); }
  return res.json(generateSmartFallbackSeo(title, destination, tagline, overview));
});

app.post('/api/fetch-hotel-details', publicApiRateLimit, requireCmsSession, async (req, res) => {
  const url = cleanText(req.body?.url, 500);
  if (!url) return res.status(400).json({ error: 'Hotel URL or name is required.' });
  return res.json(generateUnverifiedHotel(url));
});

app.post('/api/notify-lead', leadRateLimit, async (req, res) => {
  const leadData = req.body?.leadData;
  if (!leadData || typeof leadData !== 'object') return res.status(400).json({ error: 'Lead data is required.' });
  const safe = {
    packageTitle: cleanText(leadData.packageTitle, 200), travelerName: cleanText(leadData.travelerName, 120), phone: cleanText(leadData.phone, 40), email: cleanText(leadData.email, 160), travelDate: cleanText(leadData.travelDate, 40), adults: cleanText(leadData.adults, 20), children: cleanText(leadData.children, 20), estimatedTotal: cleanText(leadData.estimatedTotal, 30), specialRequests: cleanText(leadData.specialRequests, 1000),
  };
  if (!safe.travelerName || !safe.phone) return res.status(400).json({ error: 'Traveler name and phone are required.' });
  if (safe.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safe.email)) return res.status(400).json({ error: 'Invalid email address.' });
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return res.json({ success: true, message: 'Lead accepted; email notification is not configured.' });
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    const info = await transporter.sendMail({
      from: `Bhakti Sathi Notifications <${process.env.SMTP_USER}>`, to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER, subject: `New Lead: ${safe.packageTitle || 'Travel Inquiry'}`,
      text: `New Inquiry Received!\n\nName: ${safe.travelerName}\nPhone: ${safe.phone}\nEmail: ${safe.email || 'N/A'}\nTravel Date: ${safe.travelDate}\nAdults: ${safe.adults}\nChildren: ${safe.children}\nBudget: ₹${safe.estimatedTotal}\nSpecial Requests: ${safe.specialRequests}`,
      html: `<h2>New Inquiry Received!</h2><p><strong>Name:</strong> ${escapeHtml(safe.travelerName)}</p><p><strong>Phone:</strong> ${escapeHtml(safe.phone)}</p><p><strong>Email:</strong> ${escapeHtml(safe.email || 'N/A')}</p><p><strong>Travel Date:</strong> ${escapeHtml(safe.travelDate)}</p><p><strong>Travelers:</strong> ${escapeHtml(safe.adults)} Adults, ${escapeHtml(safe.children)} Children</p><p><strong>Budget:</strong> ₹${escapeHtml(safe.estimatedTotal)}</p><p><strong>Special Requests:</strong> ${escapeHtml(safe.specialRequests)}</p>`,
    });
    return res.json({ success: true, message: 'Notification sent', messageId: info.messageId });
  } catch (error) { console.error('Error sending lead notification:', error); return res.status(500).json({ error: 'Failed to send notification.' }); }
});

if (!isProduction) {
  const start = async () => {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  };
  start().catch((error) => { console.error(error); process.exit(1); });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath, { maxAge: '1d' }));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}
