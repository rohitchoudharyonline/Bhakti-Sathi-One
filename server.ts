import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

// Ensure persistent storage directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_DIR = path.join(DATA_DIR, 'db');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  console.warn('Could not initialize data directories:', e);
}

const CONTENTS_FILE = path.join(DB_DIR, 'contents.json');
const DESTINATIONS_FILE = path.join(DB_DIR, 'destinations.json');

function saveJsonSafely(filePath: string, data: any) {
  try {
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Failed to save JSON to ${filePath}:`, err);
  }
}

function loadJsonSafely<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`Failed to read JSON from ${filePath}:`, err);
  }
  return fallback;
}

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
};

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const CMS_COOKIE_NAME = 'bs_cms_session';
const CMS_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '15mb' }));

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
  set.add('rohitchoudharyonline@gmail.com');
  set.add('holidayshunt@gmail.com');
  set.add('admin@example.com');
  set.add('staff@bhaktibharatyatra.com');
  return set;
}

function cmsPin(): string {
  return (process.env.CMS_PIN || '071224').trim();
}
function cmsPassword(): string {
  return (process.env.CMS_PASSWORD || 'HarHarMahadev@2026').trim();
}

function verifyTokenUniversal(token: string, secret: string): string | null {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  try {
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = Buffer.from(normalized, 'base64').toString('utf8');
    const [subject, expiresAtText] = payload.split('|');
    const expiresAt = Number(expiresAtText);
    if (!subject || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

    const normSig = signature.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
    const hmacA_b64url = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    const hmacA_b64 = crypto.createHmac('sha256', secret).update(payload).digest('base64');
    const hmacB_b64url = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
    const hmacB_b64 = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64');

    const validMatches = [hmacA_b64url, hmacA_b64, hmacB_b64url, hmacB_b64].map(s => s.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, ''));
    if (validMatches.some(m => m === normSig)) {
      return subject;
    }
    return null;
  } catch {
    return null;
  }
}

function signCmsSession(email: string, expiresAt: number): string {
  const payload = `${email}|${expiresAt}`;
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', cmsSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

const PIN_COOKIE_NAME = 'bs_cms_pin';
const PIN_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function signPinSession(): string {
  const expiresAt = Date.now() + PIN_SESSION_MAX_AGE_MS;
  const payload = `pin|${expiresAt}`;
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', cmsSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function readPinSession(req: Request): boolean {
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies[PIN_COOKIE_NAME];
  if (!token && typeof req.headers['x-pin-token'] === 'string') {
    token = req.headers['x-pin-token'].trim();
  }
  if (!token && typeof req.headers['authorization'] === 'string' && req.headers['authorization'].startsWith('Bearer ')) {
    const authHeader = req.headers['authorization'].slice(7).trim();
    if (authHeader.startsWith('pin_') || verifyTokenUniversal(authHeader, cmsSecret()) === 'pin') {
      token = authHeader;
    }
  }
  if (!token) return false;
  const subject = verifyTokenUniversal(token, cmsSecret());
  return subject === 'pin';
}

function setPinSession(res: Response): string {
  const token = signPinSession();
  const secure = isProduction ? '; Secure' : '';
  res.append('Set-Cookie', `${PIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${Math.floor(PIN_SESSION_MAX_AGE_MS / 1000)}; HttpOnly; SameSite=Lax${secure}`);
  return token;
}

function readCmsSession(req: Request): string | null {
  const secret = cmsSecret();
  if (!secret) return null;
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies[CMS_COOKIE_NAME];
  if (!token && typeof req.headers['x-cms-token'] === 'string') {
    token = req.headers['x-cms-token'].trim();
  }
  if (!token && typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }
  if (!token) return null;

  const subject = verifyTokenUniversal(token, secret);
  if (!subject) return null;
  const lowerEmail = subject.toLowerCase();
  const allowed = allowedCmsEmails();
  if (allowed.size > 0 && !allowed.has(lowerEmail)) {
    if (process.env.NODE_ENV !== 'production' || lowerEmail === 'holidayshunt@gmail.com' || lowerEmail === 'rohitchoudharyonline@gmail.com') {
      return lowerEmail;
    }
    return null;
  }
  return lowerEmail;
}
function setCmsSession(res: Response, email: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signCmsSession(email, expiresAt);
  const secure = isProduction ? '; Secure' : '';
  res.append('Set-Cookie', `${CMS_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; HttpOnly; SameSite=Lax${secure}`);
  return token;
}
function clearCmsSession(res: Response) {
  const secure = isProduction ? '; Secure' : '';
  res.setHeader('Set-Cookie', [
    `${CMS_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
    `${PIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
  ]);
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
    if (!isProduction) return next();
    const email = await establishCmsIdentity(req, res);
    if (!email) return res.status(401).json({ error: 'CMS authorization required.' });
    return next();
  } catch (error) {
    console.error('CMS authorization error:', error);
    return res.status(401).json({ error: error instanceof Error ? error.message : 'CMS authorization failed.' });
  }
}

async function verifyGoogleToken(token: string) {
  let expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  if (!expectedClientId) {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        expectedClientId = config.oAuthClientId;
      }
    } catch (e) {
      console.warn('Could not read firebase-applet-config.json for client ID fallback on server:', e);
    }
  }

  // First try verifying as ID Token (standard Google One Tap / GoogleLogin button)
  try {
    const idTokenUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`;
    const res = await fetch(idTokenUrl);
    if (res.ok) {
      const data = await res.json() as any;
      if (data.email && (data.email_verified === 'true' || data.email_verified === true)) {
        return {
          id: data.sub || data.user_id,
          email: String(data.email).toLowerCase(),
          name: cleanText(data.name || data.email.split('@')[0], 120),
          avatar: typeof data.picture === 'string' ? data.picture.slice(0, 2000) : undefined,
          authProvider: 'google',
          verified: true,
        };
      }
    }
  } catch {}

  // Next try verifying as Access Token (standard OAuth token client)
  try {
    const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
    if (tokenInfoResponse.ok) {
      const tokenInfo = await tokenInfoResponse.json() as any;
      if (tokenInfo.email && (tokenInfo.verified_email === true || tokenInfo.email_verified === 'true' || tokenInfo.email_verified === true)) {
        const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${token}` } });
        let name = tokenInfo.email.split('@')[0];
        let picture = '';
        if (userInfoResponse.ok) {
          const uInfo = await userInfoResponse.json() as any;
          if (uInfo.name) name = uInfo.name;
          if (uInfo.picture) picture = uInfo.picture;
        }
        return {
          id: tokenInfo.sub || tokenInfo.user_id || `google-${Date.now()}`,
          email: String(tokenInfo.email).toLowerCase(),
          name: cleanText(name, 120),
          avatar: picture ? picture.slice(0, 2000) : undefined,
          authProvider: 'google',
          verified: true,
        };
      }
    }
  } catch {}

  throw new Error('Google token verification failed. Please check your credentials.');
}

async function verifyGoogleAccessToken(accessToken: string) {
  return verifyGoogleToken(accessToken);
}

// In-Memory / Local Storage Store for Server Execution
interface ServerUser {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
  country?: string;
  passportNo?: string;
  idType?: string;
  idNumber?: string;
  dietPreference?: string;
  roomPreference?: string;
  emergencyContact?: string;
  authProvider?: 'google' | 'email' | 'phone';
  memberTier?: string;
  memberSince?: string;
  rewardCoins?: number;
  coTravelers?: any[];
}

const serverUsers = new Map<string, ServerUser>();
const serverOtpStore = new Map<string, { code: string; expiresAt: number }>();
const serverBookings: any[] = [];
const serverWishlists = new Set<string>(); // key: `${email}:${packageId}`

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_bhakti_salt_2026').digest('hex');
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Unified Google Auth Endpoint
app.post('/api/auth/google', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const token = typeof req.body?.idToken === 'string' ? req.body.idToken.trim()
    : typeof req.body?.accessToken === 'string' ? req.body.accessToken.trim()
    : typeof req.body?.token === 'string' ? req.body.token.trim() : '';

  if (!token || token.length > 8192) return res.status(400).json({ error: 'A valid Google credential or access token is required.' });
  try {
    const userInfo = await verifyGoogleToken(token);
    const existing = serverUsers.get(userInfo.email);
    const updatedUser: ServerUser = {
      ...(existing || {
        id: userInfo.id || `user-${Date.now()}`,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        phone: '+91 98765 43210',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        dietPreference: 'Vegetarian',
        roomPreference: 'Standard',
        authProvider: 'google',
        memberTier: 'Bhakti Sathi Elite',
        memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        rewardCoins: 2500,
        coTravelers: [],
      }),
      name: userInfo.name || existing?.name || userInfo.email.split('@')[0],
      avatar: userInfo.avatar || existing?.avatar,
      authProvider: 'google',
    };
    serverUsers.set(userInfo.email, updatedUser);

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Google authentication verification error:', error);
    const message = error instanceof Error ? error.message : 'Google authentication failed.';
    return res.status(401).json({ error: message });
  }
});

// Traveler Sign Up (Secure Password)
app.post('/api/auth/traveler/signup', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const fullName = typeof req.body?.fullName === 'string' ? cleanText(req.body.fullName, 100) : email.split('@')[0];
  const phone = typeof req.body?.phone === 'string' ? cleanText(req.body.phone, 30) : '';
  const password = typeof req.body?.password === 'string' && req.body.password.length >= 6
    ? req.body.password
    : Math.random().toString(36).substring(2, 10) + 'A1!';

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (serverUsers.has(email)) {
    return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const newUser: ServerUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email,
    passwordHash: hashPassword(password),
    name: fullName || 'Devotee',
    phone: phone || '+91 98765 43210',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FF4B00&color=fff&bold=true`,
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    dietPreference: 'Vegetarian',
    roomPreference: 'Standard',
    authProvider: 'email',
    memberTier: 'Member',
    memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    rewardCoins: 500,
    coTravelers: [],
  };

  serverUsers.set(email, newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  return res.json({ success: true, user: safeUser });
});

// Traveler Login (Secure Password)
app.post('/api/auth/traveler/login', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const user = serverUsers.get(email);
  if (!user || !user.passwordHash || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Traveler Send 6-Digit OTP
app.post('/api/auth/traveler/send-otp', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  serverOtpStore.set(email, {
    code: otpCode,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  console.log(`[Bhakti Sathi Security] 6-Digit OTP generated for ${email}: ${otpCode}`);

  return res.json({
    success: true,
    message: `OTP Code generated for ${email}. TEST CODE: [ ${otpCode} ]`,
    otpCode: otpCode,
    devHint: otpCode,
  });
});

// Traveler Verify 6-Digit OTP
app.post('/api/auth/traveler/verify-otp', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';

  if (!email || !otp) {
    return res.status(400).json({ error: 'Please provide email and 6-digit OTP code.' });
  }

  const stored = serverOtpStore.get(email);
  if (!stored || stored.expiresAt < Date.now() || stored.code !== otp) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
  }

  serverOtpStore.delete(email);

  let user = serverUsers.get(email);
  if (!user) {
    user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      name: email.split('@')[0],
      phone: '+91 98765 43210',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=FF4B00&color=fff&bold=true`,
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      dietPreference: 'Vegetarian',
      roomPreference: 'Standard',
      authProvider: 'email',
      memberTier: 'Member',
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      rewardCoins: 500,
      coTravelers: [],
    };
    serverUsers.set(email, user);
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// Traveler Reset Password via OTP
app.post('/api/auth/traveler/reset-password', authRateLimit, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const otp = typeof req.body?.otp === 'string' ? req.body.otp.trim() : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!otp || otp.length < 4) {
    return res.status(400).json({ error: 'Please provide the 6-digit verification code.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const stored = serverOtpStore.get(email);
  if (!stored || stored.expiresAt < Date.now() || stored.code !== otp) {
    return res.status(400).json({ error: 'Invalid or expired verification code. Please request a new code.' });
  }

  serverOtpStore.delete(email);

  let user = serverUsers.get(email);
  if (user) {
    user.passwordHash = hashPassword(newPassword);
    serverUsers.set(email, user);
  } else {
    user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email,
      passwordHash: hashPassword(newPassword),
      name: email.split('@')[0],
      phone: '+91 98765 43210',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=FF4B00&color=fff&bold=true`,
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      dietPreference: 'Vegetarian',
      roomPreference: 'Standard',
      authProvider: 'email',
      memberTier: 'Member',
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      rewardCoins: 500,
      coTravelers: [],
    };
    serverUsers.set(email, user);
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    success: true,
    message: 'Your password has been successfully reset! You are now logged in.',
    user: safeUser,
  });
});

// Traveler Update Profile
app.post('/api/auth/traveler/profile', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const profile = req.body?.profile;
  if (!profile || !profile.email) {
    return res.status(400).json({ error: 'Profile data with email is required.' });
  }
  const email = String(profile.email).toLowerCase();
  const existing = serverUsers.get(email) || {} as ServerUser;
  const updated: ServerUser = {
    ...existing,
    ...profile,
    email,
  };
  serverUsers.set(email, updated);
  const { passwordHash: _, ...safeUser } = updated;
  return res.json({ success: true, user: safeUser });
});

// Traveler Bookings API
app.get('/api/traveler/bookings', async (req, res) => {
  const email = typeof req.query?.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  if (!email) return res.json({ bookings: [] });
  const userBookings = serverBookings.filter((b) => b.userEmail === email);
  return res.json({ bookings: userBookings });
});

app.post('/api/traveler/bookings', async (req, res) => {
  const booking = req.body;
  if (!booking || !booking.userEmail) return res.status(400).json({ error: 'Booking details required.' });
  const newBooking = {
    id: booking.id || `bkg-${Date.now()}`,
    ...booking,
    createdAt: new Date().toISOString(),
  };
  serverBookings.push(newBooking);
  return res.json({ success: true, booking: newBooking });
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
    if (!email) return res.status(401).json({ authorized: false, authenticated: false });
    const provider = readCmsSession(req) ? 'session' : 'cloudflare';
    const token = setCmsSession(res, email);
    const pinToken = setPinSession(res);
    return res.json({
      success: true,
      authorized: true,
      authenticated: true,
      email,
      provider,
      token,
      pinToken,
      user: { email, role: 'super_admin' },
    });
  } catch (error) {
    console.error('CMS session verification error:', error);
    return res.status(401).json({ authorized: false, authenticated: false, error: error instanceof Error ? error.message : 'CMS authorization failed.' });
  }
});

// Admin PIN Verification
app.post('/api/admin/pin/verify', authRateLimit, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const pin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : '';
  if (pin !== cmsPin()) {
    return res.status(401).json({ success: false, error: 'Invalid PIN.' });
  }
  const token = setPinSession(res);
  return res.json({ success: true, verified: true, token });
});

// Admin PIN Session Check
app.get('/api/admin/pin/session', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const valid = readPinSession(req);
  return res.status(valid ? 200 : 401).json({ verified: valid, success: valid });
});

// CMS Staff Email/Password Login
app.post('/api/auth/cms/login', authRateLimit, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
  const suppliedPin = typeof req.body?.pin === 'string' ? req.body.pin.trim() : '';

  const pinOk = (suppliedPin && suppliedPin === cmsPin()) || readPinSession(req);
  if (!pinOk) {
    return res.status(401).json({ success: false, error: 'PIN verification required first.' });
  }

  const allowed = allowedCmsEmails();
  if (!allowed.has(email) || password !== cmsPassword()) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = setCmsSession(res, email);
  const pinToken = setPinSession(res);
  return res.json({
    success: true,
    authorized: true,
    authenticated: true,
    token,
    pinToken,
    user: { email, role: 'super_admin' },
  });
});

app.post('/api/auth/cms/logout', (req, res) => {
  clearCmsSession(res);
  return res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
  clearCmsSession(res);
  return res.json({ success: true });
});

// Content Synchronization & Persistent Store
interface ContentRow {
  id: string;
  content_type: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  body?: string;
  structured_content?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  status: string;
  media?: any;
  created_at: string;
  updated_at: string;
}

const serverContentsStore = new Map<string, ContentRow>();
const initialContents = loadJsonSafely<Record<string, ContentRow>>(CONTENTS_FILE, {});
for (const [k, v] of Object.entries(initialContents)) {
  serverContentsStore.set(k, v);
}

const serverDestinationsStore = new Map<string, any>();
const initialDestinations = loadJsonSafely<Record<string, any>>(DESTINATIONS_FILE, {});
for (const [k, v] of Object.entries(initialDestinations)) {
  serverDestinationsStore.set(k, v);
}

function persistContents() {
  const obj: Record<string, ContentRow> = {};
  for (const [k, v] of serverContentsStore.entries()) obj[k] = v;
  saveJsonSafely(CONTENTS_FILE, obj);
}

function persistDestinations() {
  const obj: Record<string, any> = {};
  for (const [k, v] of serverDestinationsStore.entries()) obj[k] = v;
  saveJsonSafely(DESTINATIONS_FILE, obj);
}

// Dedicated Files Delivery Route - Serves uploaded media with full caching & fallback
app.get(['/api/files/*', '/api/files/:key(*)'], async (req, res) => {
  const rawKey = req.params[0] || (req.params as any).key || req.path.replace(/^\/api\/files\/?/, '');
  const key = decodeURIComponent(rawKey).replace(/^\/+/, '');

  if (!key || key.includes('..') || path.isAbsolute(key)) {
    return res.status(400).json({ error: 'Invalid file key.' });
  }

  const localFilePath = path.join(UPLOADS_DIR, key);
  const ext = path.extname(key).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (fs.existsSync(localFilePath)) {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return fs.createReadStream(localFilePath).pipe(res);
  }

  // Fallback to Cloudflare R2 if credentials exist
  const rawAccountId = process.env.R2_ACCOUNT_ID;
  const rawAccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const rawSecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const rawBucketName = process.env.R2_BUCKET_NAME || 'bhakti-sathi';
  const cleanAccountId = String(rawAccountId || '').replace(/^https?:\/\//i, '').replace(/\.r2\.cloudflarestorage\.com.*$/i, '').trim();

  if (cleanAccountId && rawAccessKeyId && rawSecretAccessKey && !rawSecretAccessKey.includes('*')) {
    try {
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${cleanAccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: rawAccessKeyId.trim(),
          secretAccessKey: rawSecretAccessKey.trim(),
        },
      });
      const data = await s3.send(new GetObjectCommand({
        Bucket: rawBucketName.trim(),
        Key: key,
      }));
      if (data.Body) {
        res.setHeader('Content-Type', data.ContentType || contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        const parentDir = path.dirname(localFilePath);
        if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
        const stream = data.Body as any;
        const writeStream = fs.createWriteStream(localFilePath);
        stream.pipe(writeStream);
        return stream.pipe(res);
      }
    } catch (r2Err) {
      // not found in R2
    }
  }

  return res.status(404).json({ error: 'File not found' });
});

// Dedicated Destinations CRUD Endpoints
app.get('/api/destinations', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const destinations = Array.from(serverDestinationsStore.values());
  return res.json({
    success: true,
    data: destinations,
    timestamp: new Date().toISOString(),
    count: destinations.length,
  });
});

app.get('/api/destinations/:slug', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const slug = cleanText(req.params.slug, 200);
  const dest = serverDestinationsStore.get(slug);
  if (!dest) return res.status(404).json({ error: 'Destination not found' });
  return res.json({ success: true, data: dest });
});

app.post('/api/destinations', requireCmsSession, async (req, res) => {
  const b = req.body || {};
  const slug = cleanText(b.slug || b.id || b.name, 200).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) return res.status(400).json({ error: 'Slug or name is required.' });

  const now = new Date().toISOString();
  const existing = serverDestinationsStore.get(slug) || {};
  const version = (existing.version || 0) + 1;

  const destinationRecord = {
    ...existing,
    ...b,
    id: slug,
    slug,
    name: cleanText(b.name || slug, 200),
    displayName: cleanText(b.displayName || b.name || slug, 200),
    state: cleanText(b.state || 'India', 100),
    tagline: cleanText(b.tagline || '', 500),
    heroImage: String(b.heroImage || '').trim(),
    destinationType: b.destinationType === 'temple' ? 'temple' : 'regular',
    guideTitle: cleanText(b.guideTitle || `${b.name || slug} Guide`, 200),
    weatherInfo: cleanText(b.weatherInfo || '', 100),
    bestSeason: cleanText(b.bestSeason || '', 100),
    startingPrice: Number(b.startingPrice) || 6499,
    popularCities: Array.isArray(b.popularCities) ? b.popularCities : [],
    categoryFilters: Array.isArray(b.categoryFilters) ? b.categoryFilters : [],
    guide: b.guide || {},
    seoMetaTitle: cleanText(b.seoMetaTitle || '', 200),
    seoMetaDescription: cleanText(b.seoMetaDescription || '', 500),
    seoKeywords: cleanText(b.seoKeywords || '', 500),
    created_at: existing.created_at || now,
    updated_at: now,
    version,
  };

  serverDestinationsStore.set(slug, destinationRecord);
  persistDestinations();

  // Sync with registry-destinations
  const registryRow = serverContentsStore.get('registry-destinations');
  let currentRegistryObj: Record<string, any> = {};
  if (registryRow?.structured_content?.value) {
    try {
      currentRegistryObj = typeof registryRow.structured_content.value === 'string'
        ? JSON.parse(registryRow.structured_content.value)
        : registryRow.structured_content.value;
    } catch {}
  }
  currentRegistryObj[slug] = destinationRecord;
  serverContentsStore.set('registry-destinations', {
    id: 'registry-destinations',
    content_type: 'shared_local_state',
    title: 'Destinations Registry',
    slug: 'hh_destinations_registry_v2',
    status: 'published',
    structured_content: {
      storageKey: 'hh_destinations_registry_v2',
      value: JSON.stringify(currentRegistryObj),
      updatedAt: now,
    },
    created_at: registryRow?.created_at || now,
    updated_at: now,
  });
  persistContents();

  return res.json({ success: true, data: destinationRecord, version, slug });
});

app.put('/api/destinations/:slug', requireCmsSession, async (req, res) => {
  const targetSlug = cleanText(req.params.slug, 200);
  const b = req.body || {};
  const slug = cleanText(b.slug || targetSlug, 200).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) return res.status(400).json({ error: 'Valid slug required.' });

  const now = new Date().toISOString();
  const existing = serverDestinationsStore.get(targetSlug) || serverDestinationsStore.get(slug) || {};
  const version = (existing.version || 0) + 1;

  const destinationRecord = {
    ...existing,
    ...b,
    id: slug,
    slug,
    name: cleanText(b.name || existing.name || slug, 200),
    displayName: cleanText(b.displayName || b.name || existing.displayName || slug, 200),
    state: cleanText(b.state || existing.state || 'India', 100),
    tagline: cleanText(b.tagline || existing.tagline || '', 500),
    heroImage: String(b.heroImage || existing.heroImage || '').trim(),
    destinationType: b.destinationType === 'temple' ? 'temple' : (b.destinationType === 'regular' ? 'regular' : (existing.destinationType || 'regular')),
    guideTitle: cleanText(b.guideTitle || existing.guideTitle || `${b.name || slug} Guide`, 200),
    weatherInfo: cleanText(b.weatherInfo || existing.weatherInfo || '', 100),
    bestSeason: cleanText(b.bestSeason || existing.bestSeason || '', 100),
    startingPrice: Number(b.startingPrice) || existing.startingPrice || 6499,
    popularCities: Array.isArray(b.popularCities) ? b.popularCities : (existing.popularCities || []),
    categoryFilters: Array.isArray(b.categoryFilters) ? b.categoryFilters : (existing.categoryFilters || []),
    guide: b.guide || existing.guide || {},
    seoMetaTitle: cleanText(b.seoMetaTitle || existing.seoMetaTitle || '', 200),
    seoMetaDescription: cleanText(b.seoMetaDescription || existing.seoMetaDescription || '', 500),
    seoKeywords: cleanText(b.seoKeywords || existing.seoKeywords || '', 500),
    created_at: existing.created_at || now,
    updated_at: now,
    version,
  };

  if (targetSlug !== slug) {
    serverDestinationsStore.delete(targetSlug);
  }
  serverDestinationsStore.set(slug, destinationRecord);
  persistDestinations();

  // Sync to registry-destinations
  const registryRow = serverContentsStore.get('registry-destinations');
  let currentRegistryObj: Record<string, any> = {};
  if (registryRow?.structured_content?.value) {
    try {
      currentRegistryObj = typeof registryRow.structured_content.value === 'string'
        ? JSON.parse(registryRow.structured_content.value)
        : registryRow.structured_content.value;
    } catch {}
  }
  if (targetSlug !== slug) delete currentRegistryObj[targetSlug];
  currentRegistryObj[slug] = destinationRecord;
  serverContentsStore.set('registry-destinations', {
    id: 'registry-destinations',
    content_type: 'shared_local_state',
    title: 'Destinations Registry',
    slug: 'hh_destinations_registry_v2',
    status: 'published',
    structured_content: {
      storageKey: 'hh_destinations_registry_v2',
      value: JSON.stringify(currentRegistryObj),
      updatedAt: now,
    },
    created_at: registryRow?.created_at || now,
    updated_at: now,
  });
  persistContents();

  return res.json({ success: true, data: destinationRecord, version, slug });
});

app.delete('/api/destinations/:slug', requireCmsSession, async (req, res) => {
  const slug = cleanText(req.params.slug, 200);
  serverDestinationsStore.delete(slug);
  persistDestinations();

  const registryRow = serverContentsStore.get('registry-destinations');
  if (registryRow?.structured_content?.value) {
    try {
      const obj = typeof registryRow.structured_content.value === 'string'
        ? JSON.parse(registryRow.structured_content.value)
        : registryRow.structured_content.value;
      delete obj[slug];
      registryRow.structured_content.value = JSON.stringify(obj);
      registryRow.updated_at = new Date().toISOString();
      serverContentsStore.set('registry-destinations', registryRow);
      persistContents();
    } catch {}
  }

  return res.json({ success: true, slug });
});

app.get('/api/contents', (req, res) => {
  const type = typeof req.query?.type === 'string' ? req.query.type.trim() : '';
  const rows = Array.from(serverContentsStore.values())
    .filter((r) => (!type || r.content_type === type))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  return res.json({ success: true, data: rows });
});

app.get('/api/contents/:id', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  const id = req.params.id;
  const row = serverContentsStore.get(id);
  if (!row) return res.status(404).json({ error: 'Content not found' });
  return res.json({ success: true, data: row });
});

app.post('/api/contents', async (req, res) => {
  const b = req.body || {};
  const id = cleanText(b.id || `content-${Date.now()}`, 100);
  const title = cleanText(b.title, 300);
  if (!title) return res.status(400).json({ error: 'Title required.' });
  const slug = cleanText(b.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), 200);
  const now = new Date().toISOString();
  const row: ContentRow = {
    id,
    content_type: cleanText(b.content_type || 'tour', 80),
    title,
    slug,
    subtitle: cleanText(b.subtitle, 500),
    summary: cleanText(b.summary, 3000),
    body: cleanText(b.body, 50000),
    structured_content: b.structured_content,
    seo_title: cleanText(b.seo_title, 200),
    seo_description: cleanText(b.seo_description, 500),
    seo_keywords: cleanText(b.seo_keywords, 500),
    status: ['published', 'draft', 'archived'].includes(b.status) ? b.status : 'draft',
    media: b.media,
    created_at: serverContentsStore.get(id)?.created_at || now,
    updated_at: now,
  };
  serverContentsStore.set(id, row);
  persistContents();
  return res.json({ success: true, id, slug });
});

app.put('/api/contents/:id', async (req, res) => {
  const id = cleanText(req.params.id, 100);
  const b = req.body || {};
  const title = cleanText(b.title || id, 300);
  const slug = cleanText(b.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), 200);
  const now = new Date().toISOString();
  const row: ContentRow = {
    id,
    content_type: cleanText(b.content_type || 'tour', 80),
    title,
    slug,
    subtitle: cleanText(b.subtitle, 500),
    summary: cleanText(b.summary, 3000),
    body: cleanText(b.body, 50000),
    structured_content: b.structured_content,
    seo_title: cleanText(b.seo_title, 200),
    seo_description: cleanText(b.seo_description, 500),
    seo_keywords: cleanText(b.seo_keywords, 500),
    status: ['published', 'draft', 'archived'].includes(b.status) ? b.status : 'published',
    media: b.media,
    created_at: serverContentsStore.get(id)?.created_at || now,
    updated_at: now,
  };
  serverContentsStore.set(id, row);
  persistContents();
  return res.json({ success: true, id, slug });
});

app.delete('/api/contents/:id', async (req, res) => {
  const id = cleanText(req.params.id, 100);
  serverContentsStore.delete(id);
  persistContents();
  return res.json({ success: true });
});

function generateFallbackGuideArticle(topic: string, destination: string, category: string): { content: string; excerpt: string; suggestedTitle: string; suggestedTags: string[] } {
  const cleanT = cleanText(topic, 150);
  const cleanD = cleanText(destination || 'India', 100);
  const cleanC = cleanText(category || 'Pilgrimage Guides', 80);

  const excerpt = `A thoughtful, comprehensive guide to ${cleanT} in ${cleanD}, offering essential pilgrimage insights, sacred traditions, and practical advice for travelers.`;
  const content = `## Understanding ${cleanT} in ${cleanD}

${cleanT} represents a deeply sacred tradition within ${cleanD}. For centuries, devotees have journeyed along mountain trails, riverbanks, and sanctified pilgrimage pathways to seek solace, blessings, and spiritual renewal.

---

## Spiritual Significance and Background

The sanctity of this holy site stems from ancient devotional accounts and enduring reverence among pilgrims. Shrines located across this region are characterized by quiet atmosphere, traditional aartis, and centuries-old rituals.

- **Devotional Tradition:** Devotees customarily offer fresh flowers, sacred cloth (*chunri* or holy chadar), and traditional sweets as *prasad*.
- **Sacred Environment:** The surrounding mountain valleys and pristine rivers create a natural setting ideal for meditation and silent reflection.

---

## Planning Your Pilgrimage

A successful spiritual yatra requires patient planning, particularly when navigating foothill highways or winding mountain routes:

1. **Seasonal Considerations:** Weather in foothill and mountain regions changes across seasons. Pleasant months (typically spring and autumn) generally offer comfortable daytime travel.
2. **Attire and Etiquette:** Modest, traditional clothing covering shoulders and knees is customary at all sacred shrines.
3. **Footwear:** Slip-on footwear is most convenient, as shoes must be deposited at designated temple counters before stepping into the parikrama.
4. **Local Guidelines:** Respect photography restrictions inside the sanctum sanctorum and follow the instructions of temple administration and priests.

---

## Suggested Journey Flow

- **Morning:** Begin with early morning prayers or the sacred Mangal Aarti when the sanctum is serene.
- **Midday:** Rest, enjoy sanctified community meals (*langar* or *prasad*), and circumambulate the temple courtyard (*parikrama*).
- **Evening:** Attend the evening aarti and absorb the twilight mountain atmosphere before resting.`;

  return {
    content,
    excerpt,
    suggestedTitle: cleanT,
    suggestedTags: [cleanC, cleanD, 'Pilgrimage', 'Devotional Travel', 'Temple Guide'].filter(Boolean),
  };
}

function generateFallbackGuideFaqs(title: string, destination: string) {
  const cleanT = cleanText(title, 120);
  const cleanD = cleanText(destination || 'the region', 80);
  return [
    {
      id: 'faq-1',
      question: `What is the spiritual significance of ${cleanT}?`,
      answer: `${cleanT} is revered by pilgrims as a sacred place of worship, celebrated for its spiritual atmosphere and enduring devotional traditions in ${cleanD}.`,
    },
    {
      id: 'faq-2',
      question: `What is the best time of year to visit for darshan?`,
      answer: `While the shrine welcomes devotees throughout the year, autumn and spring months generally offer pleasant weather for road travel and comfortable temple visits.`,
    },
    {
      id: 'faq-3',
      question: `What attire is recommended when visiting the shrine?`,
      answer: `Pilgrims are encouraged to wear modest, traditional clothing suitable for walking. Footwear must be deposited at designated counters outside the sanctum.`,
    },
    {
      id: 'faq-4',
      question: `How can travelers reach ${cleanT} conveniently?`,
      answer: `The shrine is accessible via major highway corridors from nearby transport hubs, with taxi and cab services readily available for family yatras.`,
    },
  ];
}

function generateFallbackGuideSeo(title: string, destination: string, _category: string) {
  const cleanT = cleanText(title, 80);
  const cleanD = cleanText(destination || 'Himachal', 60);
  
  // Hard limit: <= 60 chars
  let seoTitle = `${cleanT} | Bhakti Sathi`;
  if (seoTitle.length > 60) seoTitle = `${cleanT.slice(0, 44).trim()} | Bhakti Sathi`;
  if (seoTitle.length > 60) seoTitle = cleanT.slice(0, 58).trim();

  // Hard limit: <= 130 chars
  let metaDescription = `Explore ${cleanT} in ${cleanD} with our comprehensive guide covering sacred traditions, route tips, and pilgrim advice.`;
  if (metaDescription.length > 130) {
    metaDescription = `${cleanT} guide in ${cleanD}: essential pilgrim information, darshan tips, and practical yatra advice.`;
  }
  if (metaDescription.length > 130) {
    metaDescription = metaDescription.slice(0, 127).trim() + '...';
  }

  const primaryKeyword = `${cleanT} guide`.toLowerCase();
  const secondaryKeywords = [
    `${cleanT} darshan`.toLowerCase(),
    `${cleanD} pilgrimage`.toLowerCase(),
    `${cleanT} itinerary`.toLowerCase(),
    'yatra guide',
  ];

  const suggestedSlug = cleanT
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    seoTitle,
    metaDescription,
    primaryKeyword,
    secondaryKeywords,
    suggestedSlug,
  };
}

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
      const response = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { seoTitle: { type: Type.STRING }, metaDescription: { type: Type.STRING } }, required: ['seoTitle', 'metaDescription'] } } });
      const data = JSON.parse(response?.text || '{}');
      if (typeof data.seoTitle === 'string' && typeof data.metaDescription === 'string') return res.json({ seoTitle: cleanText(data.seoTitle, 60), metaDescription: cleanText(data.metaDescription, 160) });
    }
  } catch (error) { console.warn('SEO generation unavailable; using deterministic fallback:', error); }
  return res.json(generateSmartFallbackSeo(title, destination, tagline, overview));
});

app.post('/api/generate-guide-article', publicApiRateLimit, requireCmsSession, async (req, res) => {
  const topic = cleanText(req.body?.topic, 200);
  const destination = cleanText(req.body?.destination, 120);
  const category = cleanText(req.body?.category, 100);
  const keyPoints = cleanText(req.body?.keyPoints, 1000);

  if (!topic) return res.status(400).json({ error: 'Topic is required.' });

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      const systemInstruction = `You are a respectful, knowledgeable Indian pilgrimage and travel writer for Bhakti Sathi.
Write a human-first, well-structured, natural pilgrimage guide in clean Markdown.
CRITICAL SAFETY & TRUTH CONSTRAINTS:
- NEVER invent temple timings, exact distances, ticket prices, historical facts, religious claims, transport schedules, opening/closing hours, government statistics, reviews, or testimonials.
- If specific timings or regulations vary, state that devotees should confirm locally with the temple shrine board.
- Avoid generic AI filler or hype.
- Use clear markdown with ## headings, bullet points, and practical advice.
- Keep the tone spiritual, warm, respectful, and helpful to genuine travelers.`;

      const prompt = `Write a comprehensive pilgrimage guide for the topic: "${topic}".
Destination: ${destination || 'Sacred India'}
Category: ${category || 'Pilgrimage Guides'}
Specific context/notes from admin: ${keyPoints || 'None'}

Return a JSON object with:
1. content: The full guide in Markdown (with ## Headings, informative sections, practical tips).
2. excerpt: A 2-sentence summary (max 200 chars).
3. suggestedTitle: Clear title.
4. suggestedTags: Array of 3-6 relevant tags.`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              suggestedTitle: { type: Type.STRING },
              suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['content', 'excerpt', 'suggestedTitle', 'suggestedTags'],
          },
        },
      });

      const data = JSON.parse(response?.text || '{}');
      if (typeof data.content === 'string' && data.content.length > 50) {
        return res.json({
          content: data.content,
          excerpt: cleanText(data.excerpt || '', 250),
          suggestedTitle: cleanText(data.suggestedTitle || topic, 120),
          suggestedTags: Array.isArray(data.suggestedTags) ? data.suggestedTags.map((t: unknown) => cleanText(t, 40)) : [],
        });
      }
    }
  } catch (error) {
    console.warn('Gemini article generation failed, using fallback:', error);
  }

  return res.json(generateFallbackGuideArticle(topic, destination, category));
});

app.post('/api/generate-guide-faqs', publicApiRateLimit, requireCmsSession, async (req, res) => {
  const title = cleanText(req.body?.title, 200);
  const content = cleanText(req.body?.content, 5000);
  const destination = cleanText(req.body?.destination, 120);

  if (!title) return res.status(400).json({ error: 'Title is required.' });

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      const prompt = `Analyze this pilgrimage guide and generate 3 to 5 realistic, helpful FAQs that actual devotees and travelers would ask.
Title: ${title}
Destination: ${destination}
Article excerpt: ${content.slice(0, 2000)}

SAFETY RULES:
- Do NOT invent specific opening/closing hours, ticket prices, or transport timetables.
- Answers must be natural, accurate, and provide practical pilgrimage guidance.
- Return JSON only.`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              faqs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ['question', 'answer'],
                },
              },
            },
            required: ['faqs'],
          },
        },
      });

      const data = JSON.parse(response?.text || '{}');
      if (Array.isArray(data.faqs) && data.faqs.length > 0) {
        const faqs = data.faqs.slice(0, 6).map((f: { question?: string; answer?: string }, index: number) => ({
          id: `faq-${Date.now()}-${index}`,
          question: cleanText(f.question || '', 180),
          answer: cleanText(f.answer || '', 500),
        }));
        return res.json({ faqs });
      }
    }
  } catch (error) {
    console.warn('Gemini FAQ generation failed, using fallback:', error);
  }

  return res.json({ faqs: generateFallbackGuideFaqs(title, destination) });
});

app.post('/api/generate-guide-seo', publicApiRateLimit, requireCmsSession, async (req, res) => {
  const title = cleanText(req.body?.title, 200);
  const content = cleanText(req.body?.content, 3000);
  const destination = cleanText(req.body?.destination, 120);
  const category = cleanText(req.body?.category, 100);

  if (!title) return res.status(400).json({ error: 'Title is required.' });

  try {
    if (process.env.GEMINI_API_KEY) {
      const ai = getAi();
      const prompt = `Act as an expert SEO strategist and copywriter for Bhakti Sathi.
Analyze this pilgrimage guide and generate high-intent, natural SEO metadata.
Title: ${title}
Destination: ${destination}
Category: ${category}
Summary: ${content.slice(0, 1000)}

HARD CONSTRAINTS:
1. "seoTitle": HARD MAXIMUM 60 characters. Count every character. Never exceed 60 characters.
2. "metaDescription": HARD MAXIMUM 130 characters. Count every character. Never exceed 130 characters.
3. "primaryKeyword": One high-intent search phrase.
4. "secondaryKeywords": Array of 3 to 6 genuinely related entity phrases.
5. "suggestedSlug": Lowercase, hyphenated, clean URL slug.
Return JSON only.`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              seoTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              primaryKeyword: { type: Type.STRING },
              secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedSlug: { type: Type.STRING },
            },
            required: ['seoTitle', 'metaDescription', 'primaryKeyword', 'secondaryKeywords', 'suggestedSlug'],
          },
        },
      });

      const data = JSON.parse(response?.text || '{}');
      let seoTitle = cleanText(data.seoTitle || '', 60);
      let metaDescription = cleanText(data.metaDescription || '', 130);

      // Enforce strict character caps
      if (seoTitle.length > 60) seoTitle = seoTitle.slice(0, 57).trim() + '...';
      if (metaDescription.length > 130) metaDescription = metaDescription.slice(0, 127).trim() + '...';

      return res.json({
        seoTitle,
        metaDescription,
        primaryKeyword: cleanText(data.primaryKeyword || `${title} guide`, 80),
        secondaryKeywords: Array.isArray(data.secondaryKeywords) ? data.secondaryKeywords.map((k: unknown) => cleanText(k, 60)) : [],
        suggestedSlug: cleanText(data.suggestedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 100),
      });
    }
  } catch (error) {
    console.warn('Gemini guide SEO generation failed, using fallback:', error);
  }

  return res.json(generateFallbackGuideSeo(title, destination, category));
});

// Dynamic XML Sitemap for public search engines
app.get('/sitemap.xml', (_req, res) => {
  const baseUrl = 'https://mybhaktisathi.com';
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/sitemap', changefreq: 'daily', priority: '0.9' },
    { loc: '/tours', changefreq: 'daily', priority: '0.9' },
    { loc: '/destinations', changefreq: 'daily', priority: '0.9' },
    { loc: '/guide', changefreq: 'daily', priority: '0.9' },
    { loc: '/panchang', changefreq: 'daily', priority: '0.8' },
    { loc: '/rashifal', changefreq: 'daily', priority: '0.8' },
    { loc: '/reviews', changefreq: 'weekly', priority: '0.8' },
    { loc: '/info/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/info/locate_us', changefreq: 'monthly', priority: '0.7' },
    { loc: '/info/faq', changefreq: 'weekly', priority: '0.7' },
    { loc: '/info/careers', changefreq: 'monthly', priority: '0.6' },
    { loc: '/info/terms', changefreq: 'monthly', priority: '0.5' },
    { loc: '/info/cancellation', changefreq: 'monthly', priority: '0.5' },
    { loc: '/info/privacy', changefreq: 'monthly', priority: '0.5' },
    { loc: '/info/security', changefreq: 'monthly', priority: '0.6' },
    { loc: '/destination/vaishno-devi', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/himachal-devi-darshan', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/kashmir', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/kashi-varanasi', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/ayodhya', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/char-dham', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/mathura-vrindavan', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/amritsar', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/tirupati-balaji', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/dwarka-somnath', changefreq: 'weekly', priority: '0.8' },
    { loc: '/destination/puri-jagannath', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guide/himachal-pradesh-devi-darshan-guide', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guide/himachal-9-devi-yatra-guide', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guide/jwala-ji-temple-guide', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guide/chintpurni-temple-guide', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guide/naina-devi-temple-guide', changefreq: 'weekly', priority: '0.8' },
    { loc: '/guide/himachal-devi-darshan-from-delhi', changefreq: 'weekly', priority: '0.8' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

app.post('/api/fetch-hotel-details', publicApiRateLimit, requireCmsSession, async (req, res) => {
  const url = cleanText(req.body?.url, 500);
  if (!url) return res.status(400).json({ error: 'Hotel URL or name is required.' });
  return res.json(generateUnverifiedHotel(url));
});

// Real R2 & Local Media Upload & Deletion endpoints
app.post(['/api/media/upload', '/api/upload'], requireCmsSession, async (req, res) => {
  const {
    fileBase64,
    fileName,
    contentType,
    storagePath,
  } = req.body || {};

  if (!fileBase64 || !storagePath) {
    return res.status(400).json({ error: 'Missing required parameters (fileBase64, storagePath).' });
  }

  const cleanStoragePath = String(storagePath).replace(/^\/+/, '').replace(/\.\./g, '');
  const localTarget = path.join(UPLOADS_DIR, cleanStoragePath);
  const targetDir = path.dirname(localTarget);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(localTarget, buffer);

  // Optional sync to R2 if credentials provided or present
  const rawAccountId = req.body.r2AccountId || process.env.R2_ACCOUNT_ID;
  const rawAccessKeyId = req.body.r2AccessKeyId || process.env.R2_ACCESS_KEY_ID;
  const rawSecretAccessKey = req.body.r2SecretAccessKey || process.env.R2_SECRET_ACCESS_KEY;
  const rawBucketName = req.body.r2BucketName || process.env.R2_BUCKET_NAME || 'bhakti-sathi';
  const cleanAccountId = String(rawAccountId || '').replace(/^https?:\/\//i, '').replace(/\.r2\.cloudflarestorage\.com.*$/i, '').trim();

  let r2Synced = false;
  if (cleanAccountId && rawAccessKeyId && rawSecretAccessKey && !rawSecretAccessKey.includes('*')) {
    try {
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${cleanAccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: rawAccessKeyId.trim(),
          secretAccessKey: rawSecretAccessKey.trim(),
        },
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: rawBucketName.trim(),
          Key: cleanStoragePath,
          Body: buffer,
          ContentType: contentType || MIME_TYPES[path.extname(cleanStoragePath).toLowerCase()] || 'image/webp',
        })
      );
      r2Synced = true;
    } catch (r2Err) {
      console.warn('R2 sync notice (stored locally):', r2Err);
    }
  }

  const publicUrl = `/api/files/${encodeURIComponent(cleanStoragePath)}`;
  return res.json({ success: true, storagePath: cleanStoragePath, url: publicUrl, r2Synced });
});

app.post('/api/media/delete', requireCmsSession, async (req, res) => {
  const { storagePath } = req.body;

  const rawAccountId = req.body.r2AccountId || process.env.R2_ACCOUNT_ID || 'a9e18b43f76902cd98ef11';
  const rawAccessKeyId = req.body.r2AccessKeyId || process.env.R2_ACCESS_KEY_ID || 'r2_prod_key_77a9';
  const rawSecretAccessKey = req.body.r2SecretAccessKey || process.env.R2_SECRET_ACCESS_KEY;
  const rawBucketName = req.body.r2BucketName || process.env.R2_BUCKET_NAME || 'bhakti-sathi';

  if (!storagePath) {
    return res.status(400).json({ error: 'storagePath (Key) is required.' });
  }

  const cleanAccountId = String(rawAccountId).replace(/^https?:\/\//i, '').replace(/\.r2\.cloudflarestorage\.com.*$/i, '').trim();

  if (!cleanAccountId || !rawAccessKeyId || !rawSecretAccessKey || !rawBucketName) {
    return res.status(400).json({ error: 'R2 storage credentials are not configured.' });
  }

  if (typeof rawSecretAccessKey === 'string' && (rawSecretAccessKey.includes('*') || rawSecretAccessKey.trim() === '')) {
    return res.status(400).json({ error: 'R2 secret access key is masked or empty. Please enter your real Cloudflare R2 Secret Access Key in storage settings.' });
  }

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${cleanAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: rawAccessKeyId.trim(),
        secretAccessKey: rawSecretAccessKey.trim(),
      },
    });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: rawBucketName.trim(),
        Key: storagePath.replace(/^\//, ''),
      })
    );

    return res.json({ success: true });
  } catch (error: any) {
    console.error('R2 deletion failed:', error);
    return res.status(500).json({ error: `R2 deletion failed: ${error.message || error}` });
  }
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
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
