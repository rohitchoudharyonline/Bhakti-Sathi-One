import { GoogleGenAI } from '@google/genai';

const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
// D1 has historically stored this registry both as an object keyed by slug and
// as an array of destination records. Normalize both shapes before filtering so
// a valid restored registry can never become an empty destination response.
function normalizeDestinationRegistry(value: unknown): Record<string, any> {
  let parsed: any = value;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return {}; }
  }
  if (Array.isArray(parsed)) {
    const map: Record<string, any> = {};
    for (const destination of parsed) {
      const slug = text(destination?.slug || destination?.id, 200).toLowerCase();
      if (slug && destination && typeof destination === 'object') map[slug] = destination;
    }
    return map;
  }
  if (parsed && typeof parsed === 'object') return parsed as Record<string, any>;
  return {};
}

function getDestinationMap(value: unknown): Record<string, any> {
  return normalizeDestinationRegistry(value);
}
const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4))));

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))));
}
async function signedToken(subject: string, secret: string, ttl = 8 * 60 * 60) {
  const payload = `${subject}|${Date.now() + ttl * 1000}`;
  return `${b64(payload)}.${await hmac(payload, secret)}`;
}
async function verifyToken(token: string | undefined, secret: string): Promise<string | null> {
  if (!token || !secret) return null;
  const [p, sig] = token.split('.');
  if (!p || !sig) return null;
  try {
    const payload = unb64(p);
    const [subject, expiry] = payload.split('|');
    if (!subject || !Number.isFinite(Number(expiry)) || Number(expiry) <= Date.now()) return null;
    const expected = await hmac(payload, secret);
    if (sig.length !== expected.length) return null;
    let diff = 0; for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0 ? subject : null;
  } catch { return null; }
}
function cookies(request: Request) {
  const out: Record<string,string> = {};
  for (const part of (request.headers.get('cookie') || '').split(';')) { const i = part.indexOf('='); if (i > 0) out[part.slice(0,i).trim()] = decodeURIComponent(part.slice(i+1).trim()); }
  return out;
}
function cookie(name: string, value: string, maxAge: number, request?: Request) {
  const isSecure = request ? new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https' : true;
  const secureFlag = isSecure ? '; Secure' : '';
  const expires = maxAge > 0
    ? `; Expires=${new Date(Date.now() + maxAge * 1000).toUTCString()}`
    : '; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}${expires}; HttpOnly${secureFlag}; SameSite=Lax`;
}

async function passwordHash(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return b64(String.fromCharCode(...new Uint8Array(bits)));
}
async function makePasswordHash(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$120000$${b64(String.fromCharCode(...salt))}$${await passwordHash(password, salt)}`;
}
async function checkPassword(password: string, stored: string) {
  const p = stored.split('$');
  if (p.length !== 4 || p[0] !== 'pbkdf2') return false;
  try { const bytes = unescape(encodeURIComponent(unb64(p[2]))); const salt = Uint8Array.from(bytes, c => c.charCodeAt(0)); return (await passwordHash(password, salt)) === p[3]; } catch { return false; }
}

function publicHeaders(env: any, request: Request) {
  const configured = String(env.PUBLIC_ORIGIN || '').trim().replace(/\/$/, '');
  const origin = request.headers.get('Origin') || '';
  const isAllowedOrigin = !origin
    || origin === configured
    || origin.endsWith('.run.app')
    || origin.endsWith('.workers.dev')
    || origin.endsWith('.pages.dev')
    || origin.includes('holidayshunt.com')
    || origin.includes('mybhaktisathi.com')
    || origin.includes('localhost')
    || origin.includes('127.0.0.1');

  const h: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Vary': 'Origin',
  };

  if (origin && isAllowedOrigin) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Credentials'] = 'true';
  } else if (!origin) {
    h['Access-Control-Allow-Origin'] = configured || '*';
  }
  h['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CMS-Token, Cache-Control';
  return h;
}
const privateHeaders = (env: any, request: Request) => ({ ...publicHeaders(env, request), 'Cache-Control': 'private, no-store, max-age=0', 'Pragma': 'no-cache' });
const publicCacheHeaders = (env: any, request: Request) => ({ ...publicHeaders(env, request), 'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400' });

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url), pathname = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders(env, request) });

    // Safely retrieve or use deterministic fallback matching cms-auth-wrapper when CMS_SESSION_SECRET is not configured
    const cmsSecret = (env.CMS_SESSION_SECRET && String(env.CMS_SESSION_SECRET).trim().length >= 32)
      ? String(env.CMS_SESSION_SECRET).trim()
      : 'bhakti-bharat-yatra-cms-secret-session-key-32-chars-ok';

    const defaultEmails = ['rohitchoudharyonline@gmail.com', 'holidayshunt@gmail.com', 'admin@example.com', 'staff@bhaktibharatyatra.com'];
    const cmsEmails = new Set([...defaultEmails, ...String(env.CMS_STAFF_EMAILS || '').split(',').map(text).map((x) => x.toLowerCase()).filter(Boolean)]);
    
    const cmsPassword = (env.CMS_PASSWORD && String(env.CMS_PASSWORD).trim().length >= 8) 
      ? String(env.CMS_PASSWORD).trim() 
      : crypto.randomUUID(); // Random if not set

    const cmsPin = (env.CMS_PIN && String(env.CMS_PIN).trim().length >= 4) 
      ? String(env.CMS_PIN).trim() 
      : Math.floor(100000 + Math.random() * 900000).toString(); // Random 6 digit pin if not set

    const cmsToken = async () => {
      let tok = cookies(request).bs_cms_session;
      if (!tok && request.headers.get('x-cms-token')) tok = request.headers.get('x-cms-token')!.trim();
      if (!tok && request.headers.get('authorization')?.startsWith('Bearer ')) {
        const rawAuth = request.headers.get('authorization')!.slice(7).trim();
        if (!rawAuth.startsWith('pin_')) tok = rawAuth;
      }
      return verifyToken(tok, cmsSecret);
    };

    const pinTokenCheck = async () => {
      let tok = cookies(request).bs_cms_pin;
      if (!tok && request.headers.get('x-pin-token')) tok = request.headers.get('x-pin-token')!.trim();
      if (!tok && request.headers.get('authorization')?.startsWith('Bearer ')) {
        const rawAuth = request.headers.get('authorization')!.slice(7).trim();
        if (rawAuth.startsWith('pin_') || (await verifyToken(rawAuth, cmsSecret)) === 'pin') tok = rawAuth;
      }
      return tok ? (await verifyToken(tok, cmsSecret)) === 'pin' : false;
    };

    const requireCms = async () => { const e = await cmsToken(); return e && cmsEmails.has(e.toLowerCase()) ? e.toLowerCase() : null; };
    const requireUser = async () => verifyToken(cookies(request).bs_user_session, cmsSecret);

    if (pathname.startsWith('/api/') || pathname === '/sitemap.xml') {
      try {
        // Machine-readable XML sitemap for Google Search Console and other crawlers.
        // Keep /info/sitemap as the human-facing visual sitemap; /sitemap.xml is the actual XML sitemap.
        if (pathname === '/sitemap.xml' && request.method === 'GET') {
          const esc = (value: unknown) => String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
          const registryIds = [
            'registry-packages', 'registry-deleted-packages', 'registry-destinations',
            'registry-guides-v2', 'registry-custom-pages-v2'
          ];
          const placeholders = registryIds.map(() => '?').join(',');
          const rows = env.DB ? ((await env.DB.prepare(
            `SELECT id, structured_content, updated_at FROM contents WHERE status=? AND id IN (${placeholders})`
          ).bind('published', ...registryIds).all()).results || []) : [];
          const byId = new Map<string, any>();
          for (const row of rows) {
            try {
              const structured = row.structured_content ? JSON.parse(String(row.structured_content)) : {};
              const raw = structured?.value;
              byId.set(String(row.id), typeof raw === 'string' ? JSON.parse(raw) : raw);
            } catch { byId.set(String(row.id), null); }
          }

          const urls = new Map<string, string>();
          const add = (path: string, changefreq: string, priority: string, lastmod?: string) => {
            if (!path.startsWith('/')) return;
            const loc = `https://holidayshunt.com${path}`;
            urls.set(loc, `    <url>\n      <loc>${esc(loc)}</loc>\n      <lastmod>${esc(lastmod || new Date().toISOString().slice(0, 10))}</lastmod>\n      <changefreq>${changefreq}</changefreq>\n      <priority>${priority}</priority>\n    </url>`);
          };

          const today = new Date().toISOString().slice(0, 10);
          const core = [
            ['/', 'daily', '1.0'], ['/tours', 'weekly', '0.9'], ['/destinations', 'weekly', '0.8'],
            ['/guide', 'weekly', '0.8'], ['/panchang', 'daily', '0.6'], ['/rashifal', 'daily', '0.6'],
            ['/reviews', 'monthly', '0.5'], ['/info/about', 'monthly', '0.5'], ['/info/locate_us', 'monthly', '0.5'],
            ['/info/faq', 'monthly', '0.5'], ['/info/careers', 'monthly', '0.4'], ['/info/terms', 'yearly', '0.3'],
            ['/info/cancellation', 'monthly', '0.3'], ['/info/privacy', 'yearly', '0.3'], ['/info/security', 'monthly', '0.4'],
            ['/info/sitemap', 'weekly', '0.4']
          ];
          for (const [path, freq, priority] of core) add(path, freq, priority, today);

          const deletedRaw = byId.get('registry-deleted-packages');
          const deleted = new Set<string>(Array.isArray(deletedRaw) ? deletedRaw.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean) : []);
          const packages = byId.get('registry-packages');
          if (Array.isArray(packages)) for (const pkg of packages) {
            const id = String(pkg?.id || '').trim().toLowerCase();
            const slug = String(pkg?.slug || '').trim().toLowerCase();
            if (!id || !slug || deleted.has(id)) continue;
            add(`/tours/${encodeURIComponent(slug)}`, 'weekly', '0.9', pkg?.updatedAt || pkg?.updated_at || today);
          }

          const destinations = getDestinationMap(byId.get('registry-destinations'));
          for (const [slug, destination] of Object.entries(destinations)) {
            add(`/destination/${encodeURIComponent(slug)}`, 'weekly', '0.8', destination?.updatedAt || destination?.updated_at || today);
          }

          const guides = byId.get('registry-guides-v2');
          if (Array.isArray(guides)) for (const guide of guides) {
            const slug = String(guide?.slug || '').trim();
            if (!slug || guide?.status !== 'published') continue;
            add(`/guide/${encodeURIComponent(slug)}`, 'weekly', '0.8', guide?.updatedAt || guide?.updated_at || today);
          }

          const customPages = byId.get('registry-custom-pages-v2');
          if (Array.isArray(customPages)) for (const page of customPages) {
            const slug = String(page?.slug || '').trim();
            if (!slug || page?.status !== 'published') continue;
            add(`/page/${encodeURIComponent(slug)}`, 'monthly', '0.7', page?.updatedAt || page?.updated_at || today);
          }

          const body = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...Array.from(urls.values()),
            '</urlset>'
          ].join('\n');
          return new Response(body, {
            status: 200,
            headers: {
              'Content-Type': 'application/xml; charset=UTF-8',
              'Cache-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff'
            }
          });
        }

        if (pathname === '/api/health') return json({ status: 'ok' }, 200, publicHeaders(env, request));

        // Public homepage callback submissions are saved to D1 before WhatsApp opens.
        if (pathname === '/api/public/leads' && request.method === 'POST') {
          if (!env.DB) return json({ error: 'Lead storage is temporarily unavailable. Please try again.' }, 503, publicHeaders(env, request));
          const contentLength = Number(request.headers.get('content-length') || 0);
          if (contentLength > 12000) return json({ error: 'Enquiry is too large.' }, 413, publicHeaders(env, request));
          const b = await request.json().catch(() => null) as any;
          if (!b || typeof b !== 'object') return json({ error: 'Invalid enquiry.' }, 400, publicHeaders(env, request));

          const name = text(b.name, 120);
          const phone = text(b.phone, 40);
          const email = text(b.email, 160).toLowerCase();
          const city = text(b.city, 100);
          const destination = text(b.destination, 180);
          const requirements = text(b.requirements, 2000);
          const source = text(b.source || 'Homepage Callback Form', 120);
          const marketingConsent = b.marketingConsent === true ? 1 : 0;
          const digits = phone.replace(/\D/g, '');
          if (!name || digits.length < 10 || digits.length > 15) {
            return json({ error: 'Please provide your name and a valid phone number.' }, 400, publicHeaders(env, request));
          }
          if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return json({ error: 'Please provide a valid email address.' }, 400, publicHeaders(env, request));
          }

          const ip = request.headers.get('CF-Connecting-IP') || '';
          let ipHash = '';
          if (ip) {
            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
            ipHash = Array.from(new Uint8Array(digest)).map((v) => v.toString(16).padStart(2, '0')).join('');
            const recent = await env.DB.prepare(
              "SELECT COUNT(*) AS total FROM website_leads WHERE ip_hash=? AND created_at >= ?"
            ).bind(ipHash, new Date(Date.now() - 10 * 60 * 1000).toISOString()).first();
            if (Number((recent as any)?.total || 0) >= 5) {
              return json({ error: 'Too many enquiries from this connection. Please try again later.' }, 429, publicHeaders(env, request));
            }
          }

          const id = 'lead-' + crypto.randomUUID();
          const now = new Date().toISOString();
          await env.DB.prepare(
            'INSERT INTO website_leads (id, name, phone, email, city, destination, requirements, source, status, marketing_consent, ip_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(id, name, phone, email, city, destination, requirements, source, 'New', marketingConsent, ipHash, now, now).run();
          return json({ success: true, id, createdAt: now }, 201, privateHeaders(env, request));
        }

        if (pathname === '/api/cms/leads' || pathname.startsWith('/api/cms/leads/')) {
          const email = await requireCms();
          if (!email || !env.DB) return json({ error: 'Unauthorized.' }, 401, privateHeaders(env, request));
          if (request.method === 'GET' && pathname === '/api/cms/leads') {
            const limit = Math.min(10000, Math.max(1, Number(url.searchParams.get('limit')) || 5000));
            const result = await env.DB.prepare(
              'SELECT id, name, phone, email, city, destination, requirements, source, status, marketing_consent, created_at, updated_at FROM website_leads ORDER BY created_at DESC LIMIT ?'
            ).bind(limit).all();
            return json({ success: true, leads: result.results || [] }, 200, privateHeaders(env, request));
          }
          const leadId = text(pathname.slice('/api/cms/leads/'.length), 100);
          if (!leadId || leadId.includes('/')) return json({ error: 'Lead ID is required.' }, 400, privateHeaders(env, request));
          if (request.method === 'PATCH') {
            const b = await request.json().catch(() => ({})) as any;
            const allowedStatuses = ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'];
            const status = text(b.status, 30);
            if (!allowedStatuses.includes(status)) return json({ error: 'Invalid lead status.' }, 400, privateHeaders(env, request));
            const result = await env.DB.prepare('UPDATE website_leads SET status=?, updated_at=? WHERE id=?')
              .bind(status, new Date().toISOString(), leadId).run();
            if (!result.meta?.changes) return json({ error: 'Lead not found.' }, 404, privateHeaders(env, request));
            return json({ success: true }, 200, privateHeaders(env, request));
          }
          if (request.method === 'DELETE') {
            const result = await env.DB.prepare('DELETE FROM website_leads WHERE id=?').bind(leadId).run();
            if (!result.meta?.changes) return json({ error: 'Lead not found.' }, 404, privateHeaders(env, request));
            return json({ success: true }, 200, privateHeaders(env, request));
          }
          return json({ error: 'Method not allowed.' }, 405, privateHeaders(env, request));
        }

        if (pathname === '/api/admin/pin/verify' && request.method === 'POST') {
          const b = await request.json().catch(() => ({}));
          if (String(b.pin || '').trim() !== cmsPin) return json({ success: false, error: 'Invalid PIN.' }, 401, privateHeaders(env, request));
          const t = await signedToken('pin', cmsSecret, 86400);
          const h = new Headers(privateHeaders(env, request));
          h.append('Set-Cookie', cookie('bs_cms_pin', t, 86400, request));
          return json({ success: true, verified: true, token: t, pinToken: t }, 200, h);
        }
        if (pathname === '/api/admin/pin/session') {
          const ok = await pinTokenCheck();
          const t = ok ? await signedToken('pin', cmsSecret, 86400) : null;
          return json({ verified: ok, success: ok, token: t, pinToken: t }, ok ? 200 : 401, privateHeaders(env, request));
        }
        if (pathname === '/api/auth/cms/login' && request.method === 'POST') {
          const b = await request.json().catch(() => ({}));
          const email = text(b.email, 160).toLowerCase();
          const password = String(b.password || '').trim();
          const suppliedPin = String(b.pin || '').trim();
          const pinCookieOk = await pinTokenCheck();
          const pinOk = (suppliedPin && suppliedPin === cmsPin) || pinCookieOk;

          if (!pinOk) {
            return json({ success: false, error: 'PIN verification required first.' }, 401, privateHeaders(env, request));
          }
          if (!cmsEmails.has(email) || password !== cmsPassword) {
            return json({ success: false, error: 'Invalid email or password.' }, 401, privateHeaders(env, request));
          }
          const t = await signedToken(email, cmsSecret, 7 * 24 * 60 * 60);
          const pinTok = await signedToken('pin', cmsSecret, 86400);
          const h = new Headers(privateHeaders(env, request));
          h.append('Set-Cookie', cookie('bs_cms_session', t, 7 * 24 * 60 * 60, request));
          h.append('Set-Cookie', cookie('bs_cms_pin', pinTok, 86400, request));
          return json({ success: true, authorized: true, authenticated: true, token: t, pinToken: pinTok, user: { email, role: 'super_admin' } }, 200, h);
        }
        if (pathname === '/api/auth/cms/session' || pathname === '/api/auth/cms') {
          const email = await requireCms();
          if (email) {
            const t = await signedToken(email, cmsSecret, 7 * 24 * 60 * 60);
            const pinTok = await signedToken('pin', cmsSecret, 86400);
            return json(
              { success: true, authorized: true, authenticated: true, token: t, pinToken: pinTok, user: { email, role: 'super_admin' } },
              200,
              privateHeaders(env, request)
            );
          }
          return json({ authorized: false, authenticated: false }, 401, privateHeaders(env, request));
        }
        if ((pathname === '/api/admin/logout' || pathname === '/api/auth/cms/logout') && request.method === 'POST') {
          const h = new Headers(privateHeaders(env, request));
          for (const n of ['bs_cms_session', 'bs_cms_pin', 'bs_user_session']) {
            h.append('Set-Cookie', cookie(n, '', 0, request));
          }
          return json({ success: true }, 200, h);
        }
        if (pathname === '/api/admin/unblock-all' && request.method === 'POST') {
          const e = await requireCms();
          if (!e || !env.DB) return json({ error: 'Unauthorized.' }, 401, privateHeaders(env, request));
          await env.DB.prepare('DELETE FROM ip_blocks').run();
          return json({ success: true }, 200, privateHeaders(env, request));
        }

        if (pathname === '/api/auth/traveler/signup' && request.method === 'POST') {
          if(!env.DB||!cmsSecret||cmsSecret.length<32)return json({error:'Authentication service unavailable.'},503,privateHeaders(env,request));
          const b=await request.json().catch(()=>({})); const email=text(b.email,160).toLowerCase(); const password=String(b.password||''); const name=text(b.fullName||email.split('@')[0],120); const phone=text(b.phone,40);
          if(!/^\S+@\S+\.\S+$/.test(email)||password.length<10)return json({error:'Valid email and password of at least 10 characters are required.'},400,privateHeaders(env,request));
          const ex=await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).all(); if(ex.results?.length)return json({error:'An account already exists with this email.'},409,privateHeaders(env,request));
          const id=`user-${crypto.randomUUID()}`,hash=await makePasswordHash(password),now=new Date().toISOString(); await env.DB.prepare("INSERT INTO users (id,email,password_hash,full_name,phone,auth_provider,created_at,updated_at) VALUES (?,?,?,?,?,'email',?,?)").bind(id,email,hash,name,phone,now,now).run();
          const t=await signedToken(email,cmsSecret,30*24*60*60); const h=new Headers(privateHeaders(env,request)); h.append('Set-Cookie',cookie('bs_user_session',t,30*24*60*60)); return json({success:true,user:{id,email,name,phone,authProvider:'email'}},200,h);
        }
        if (pathname === '/api/auth/traveler/login' && request.method === 'POST') {
          if(!env.DB||!cmsSecret||cmsSecret.length<32)return json({error:'Authentication service unavailable.'},503,privateHeaders(env,request));
          const b=await request.json().catch(()=>({})); const email=text(b.email,160).toLowerCase(); const password=String(b.password||''); const q=await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).all(); const row:any=q.results?.[0];
          if(!row||!(await checkPassword(password,row.password_hash||'')))return json({error:'Invalid email or password.'},401,privateHeaders(env,request));
          const t=await signedToken(email,cmsSecret,30*24*60*60); const h=new Headers(privateHeaders(env,request)); h.append('Set-Cookie',cookie('bs_user_session',t,30*24*60*60)); return json({success:true,user:{id:row.id,email:row.email,name:row.full_name||row.email.split('@')[0],phone:row.phone||'',authProvider:row.auth_provider||'email'}},200,h);
        }
        if (pathname === '/api/auth/traveler/profile' && request.method === 'POST') {
          const email=await requireUser(); if(!email||!env.DB)return json({error:'Authentication required.'},401,privateHeaders(env,request)); const b=await request.json().catch(()=>({})); const p=b.profile||{}; if(String(p.email||'').toLowerCase()!==email)return json({error:'Forbidden.'},403,privateHeaders(env,request));
          const metadata=JSON.stringify({city:text(p.city,100),state:text(p.state,100),country:text(p.country,100),passportNo:text(p.passportNo,80),idType:text(p.idType,50),idNumber:text(p.idNumber,100),dietPreference:text(p.dietPreference,50),roomPreference:text(p.roomPreference,50),emergencyContact:text(p.emergencyContact,200),coTravelers:Array.isArray(p.coTravelers)?p.coTravelers.slice(0,10):[]});
          await env.DB.prepare('UPDATE users SET full_name=?,phone=?,avatar=?,metadata=?,updated_at=? WHERE email=?').bind(text(p.name,120),text(p.phone,40),text(p.avatar,500),metadata,new Date().toISOString(),email).run(); return json({success:true},200,privateHeaders(env,request));
        }
        if (pathname === '/api/traveler/bookings') {
          const email=await requireUser(); if(!email||!env.DB)return json({error:'Authentication required.'},401,privateHeaders(env,request));
          if(request.method==='GET'){const q=await env.DB.prepare('SELECT * FROM bookings WHERE user_email=? ORDER BY created_at DESC LIMIT 100').bind(email).all(); return json({bookings:q.results||[]},200,privateHeaders(env,request));}
          if(request.method==='POST'){const b=await request.json().catch(()=>({})); const id=`bkg-${crypto.randomUUID()}`,now=new Date().toISOString(),trav=Math.min(50,Math.max(1,Number(b.travelersCount)||1)),price=Math.max(0,Number(b.totalPrice)||0); await env.DB.prepare('INSERT INTO bookings (id,user_email,package_id,package_title,travelers_count,total_price,status,details,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,email,text(b.packageId,100),text(b.packageTitle,300),trav,price,'pending',JSON.stringify(b.details||{}),now,now).run(); return json({success:true,id},201,privateHeaders(env,request));}
        }

        if (pathname === '/api/destinations' || pathname.startsWith('/api/destinations/')) {
          const parts = pathname.replace('/api/destinations', '').replace(/^\/+/, '').split('/');
          const targetSlug = text(parts[0], 200);

          if (request.method === 'GET' && env.DB) {
            const q = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind('registry-destinations').first();
            let map: Record<string, any> = {};
            if (q && q.structured_content) {
              try {
                const parsed = JSON.parse(q.structured_content as string);
                map = getDestinationMap(typeof parsed.value === 'string' ? parsed.value : (parsed.value || {}));
              } catch {}
            }
            if (targetSlug) {
              const dest = map[targetSlug];
              if (!dest) return json({ error: 'Destination not found' }, 404, publicHeaders(env, request));
              return json({ success: true, data: dest }, 200, publicHeaders(env, request));
            }
            return json({ success: true, data: Object.values(map) }, 200, publicHeaders(env, request));
          }

          if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
            const e = await requireCms();
            if (!e || !env.DB) return json({ error: 'Unauthorized.' }, 401, privateHeaders(env, request));

            const q = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind('registry-destinations').first();
            let map: Record<string, any> = {};
            if (q && q.structured_content) {
              try {
                const parsed = JSON.parse(q.structured_content as string);
                map = normalizeDestinationRegistry(typeof parsed.value === 'string' ? parsed.value : (parsed.value || {}));
              } catch {}
            }

            if (request.method === 'DELETE') {
              if (targetSlug.toLowerCase() === 'jammu-kashmir') {
                return json({ error: 'The Jammu & Kashmir destination is permanently protected.' }, 409, privateHeaders(env, request));
              }
              if (targetSlug) delete map[targetSlug];
            } else {
              const b = await request.json().catch(() => ({}));
              const slug = text(b.slug || targetSlug, 200).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              if (!slug) return json({ error: 'Valid slug required.' }, 400, privateHeaders(env, request));
              map[slug] = { ...map[slug], ...b, slug, id: slug, updated_at: new Date().toISOString() };
            }

            const now = new Date().toISOString();
            const structuredContent = {
              storageKey: 'hh_destinations_registry_v2',
              value: JSON.stringify(map),
              updatedAt: now,
            };

            await env.DB.prepare(
              `INSERT INTO contents (id, content_type, title, slug, structured_content, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET structured_content=excluded.structured_content, updated_at=excluded.updated_at`
            ).bind(
              'registry-destinations',
              'shared_local_state',
              'Destinations Registry',
              'hh_destinations_registry_v2',
              JSON.stringify(structuredContent),
              'published',
              now,
              now
            ).run();

            return json({ success: true, data: request.method === 'DELETE' ? null : map[targetSlug || Object.keys(map)[0]] }, 200, privateHeaders(env, request));
          }
        }

        if (pathname === '/api/contents' || pathname.startsWith('/api/contents/')) {
          if (request.method === 'GET' && env.DB) {
            const parts = pathname.replace('/api/contents', '').replace(/^\/+/, '').split('/');
            let rows: any[] = [];
            const isSharedSync = url.searchParams.get('type') === 'shared_local_state' || url.searchParams.has('_nocache');

            if (!parts[0]) {
              const type = text(url.searchParams.get('type'), 80);
              const q = type
                ? await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE status=? AND content_type=? ORDER BY updated_at DESC LIMIT 200').bind('published', type).all()
                : await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE status=? ORDER BY updated_at DESC LIMIT 200').bind('published').all();
              rows = q.results || [];
            } else {
              const key = text(parts[1] || parts[0], 300);
              const q = parts[0] === 'slug'
                ? await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE slug=? AND status=?').bind(key, 'published').all()
                : await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE id=? AND status=?').bind(key, 'published').all();
              rows = q.results || [];
              if (!rows.length) return json({ error: 'Content not found' }, 404, isSharedSync ? privateHeaders(env, request) : publicCacheHeaders(env, request));
            }

            for (const r of rows) {
              try { r.structured_content = r.structured_content ? JSON.parse(r.structured_content) : null; } catch { r.structured_content = null; }
            }
            return json({ success: true, data: parts[0] ? rows[0] : rows }, 200, isSharedSync ? privateHeaders(env, request) : publicCacheHeaders(env, request));
          }

          if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
            const e = await requireCms();
            if (!e || !env.DB) return json({ error: 'Unauthorized.' }, 401, privateHeaders(env, request));
            if (request.method === 'DELETE') {
              const id = text(pathname.split('/').pop(), 100);
              await env.DB.prepare('DELETE FROM contents WHERE id=?').bind(id).run();
              return json({ success: true }, 200, privateHeaders(env, request));
            }
            const b = await request.json().catch(() => ({}));
            const id = text(b.id || `content-${crypto.randomUUID()}`, 100);
            const title = text(b.title, 300);
            if (!title) return json({ error: 'Title required.' }, 400, privateHeaders(env, request));
            const slug = text(b.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), 200);
            const now = new Date().toISOString();

            // Tour registry safety:
            // Every CMS-created tour is durable. A normal browser sync may add/update
            // tours, but it can never resurrect a tour recorded in the server deletion
            // tombstone registry. Explicit CMS deletion may intentionally remove tours.
            // Deletion tombstones are append-only. A stale browser is never
            // allowed to replace the server's permanent deletion history.
            if (id === 'registry-deleted-packages' || slug === 'hh_deleted_package_ids') {
              try {
                const structured = typeof b.structured_content === 'string'
                  ? JSON.parse(b.structured_content)
                  : (b.structured_content || {});
                const rawValue = typeof structured?.value === 'string' ? structured.value : structured?.value;
                const incomingValue = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                if (!Array.isArray(incomingValue)) {
                  return json({ error: 'Deleted package registry rejected: invalid payload.' }, 400, privateHeaders(env, request));
                }
                const existingRow = await env.DB.prepare(
                  'SELECT structured_content FROM contents WHERE id=?'
                ).bind('registry-deleted-packages').first();
                let existingIds: string[] = [];
                if (existingRow?.structured_content) {
                  try {
                    const existingStructured = JSON.parse(existingRow.structured_content as string);
                    const existingValue = typeof existingStructured?.value === 'string'
                      ? JSON.parse(existingStructured.value)
                      : existingStructured?.value;
                    if (Array.isArray(existingValue)) existingIds = existingValue.map((x: any) => String(x).trim().toLowerCase());
                  } catch {}
                }
                const mergedIds = Array.from(new Set([
                  ...existingIds,
                  ...incomingValue.map((x: any) => String(x).trim().toLowerCase()),
                ].filter(Boolean)));
                b.structured_content = {
                  ...structured,
                  storageKey: 'hh_deleted_package_ids',
                  value: JSON.stringify(mergedIds),
                  updatedAt: new Date().toISOString(),
                };
              } catch {
                return json({ error: 'Deleted package registry rejected: invalid payload.' }, 400, privateHeaders(env, request));
              }
            }

            // Guide registries: deletions are permanent and stale browser copies
            // can never resurrect a deleted guide or guide category.
            if (id === 'registry-deleted-guides' || slug === 'hh_deleted_guide_ids' ||
                id === 'registry-deleted-guide-categories' || slug === 'hh_deleted_guide_category_ids') {
              try {
                const isGuideTombstone = id === 'registry-deleted-guides' || slug === 'hh_deleted_guide_ids';
                const tombstoneId = isGuideTombstone ? 'registry-deleted-guides' : 'registry-deleted-guide-categories';
                const tombstoneKey = isGuideTombstone ? 'hh_deleted_guide_ids' : 'hh_deleted_guide_category_ids';
                const registryId = isGuideTombstone ? 'registry-guides-v2' : 'registry-guide-categories-v2';
                const structured = typeof b.structured_content === 'string' ? JSON.parse(b.structured_content) : (b.structured_content || {});
                const rawValue = typeof structured?.value === 'string' ? structured.value : structured?.value;
                const incoming = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                if (!Array.isArray(incoming)) return json({ error: 'Guide deletion registry rejected: invalid payload.' }, 400, privateHeaders(env, request));

                const existingRow = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind(tombstoneId).first();
                let existingIds: string[] = [];
                if (existingRow?.structured_content) {
                  try {
                    const existingStructured = JSON.parse(existingRow.structured_content as string);
                    const existingValue = typeof existingStructured?.value === 'string' ? JSON.parse(existingStructured.value) : existingStructured?.value;
                    if (Array.isArray(existingValue)) existingIds = existingValue.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean);
                  } catch {}
                }
                const deletedSet = new Set<string>([
                  ...existingIds,
                  ...incoming.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean),
                ]);
                const now = new Date().toISOString();
                const tombstoneStructured = { storageKey: tombstoneKey, value: JSON.stringify(Array.from(deletedSet)), updatedAt: now };
                await env.DB.prepare(
                  `INSERT INTO contents (id,content_type,title,slug,structured_content,status,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET structured_content=excluded.structured_content,status=excluded.status,updated_at=excluded.updated_at`
                ).bind(
                  tombstoneId, 'shared_local_state',
                  isGuideTombstone ? 'Deleted Guide IDs' : 'Deleted Guide Category IDs',
                  tombstoneKey, JSON.stringify(tombstoneStructured), 'published', now, now
                ).run();

                const registryRow = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind(registryId).first();
                if (registryRow?.structured_content) {
                  try {
                    const registryStructured = JSON.parse(registryRow.structured_content as string);
                    const registryValue = typeof registryStructured?.value === 'string' ? JSON.parse(registryStructured.value) : registryStructured?.value;
                    if (Array.isArray(registryValue)) {
                      const clean = registryValue.filter((item: any) => {
                        const itemId = String(item?.id || '').trim().toLowerCase();
                        const itemSlug = String(item?.slug || '').trim().toLowerCase();
                        return itemId && !deletedSet.has(itemId) && !deletedSet.has(itemSlug);
                      });
                      await env.DB.prepare('UPDATE contents SET structured_content=?,updated_at=? WHERE id=?')
                        .bind(JSON.stringify({ ...registryStructured, value: JSON.stringify(clean), updatedAt: now }), now, registryId).run();
                    }
                  } catch {}
                }
                b.structured_content = tombstoneStructured;
              } catch {
                return json({ error: 'Guide deletion registry rejected: invalid payload.' }, 400, privateHeaders(env, request));
              }
            }

            if (id === 'registry-guides-v2' || slug === 'hh_guide_articles_v2' ||
                id === 'registry-guide-categories-v2' || slug === 'hh_guide_categories_v2') {
              try {
                const isGuideRegistry = id === 'registry-guides-v2' || slug === 'hh_guide_articles_v2';
                const registryId = isGuideRegistry ? 'registry-guides-v2' : 'registry-guide-categories-v2';
                const tombstoneId = isGuideRegistry ? 'registry-deleted-guides' : 'registry-deleted-guide-categories';
                const structured = typeof b.structured_content === 'string' ? JSON.parse(b.structured_content) : (b.structured_content || {});
                const rawValue = typeof structured?.value === 'string' ? structured.value : structured?.value;
                const incoming = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                if (!Array.isArray(incoming)) return json({ error: 'Guide registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));

                const deletedRow = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind(tombstoneId).first();
                let deletedIds: string[] = [];
                if (deletedRow?.structured_content) {
                  try {
                    const deletedStructured = JSON.parse(deletedRow.structured_content as string);
                    const deletedValue = typeof deletedStructured?.value === 'string' ? JSON.parse(deletedStructured.value) : deletedStructured?.value;
                    if (Array.isArray(deletedValue)) deletedIds = deletedValue.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean);
                  } catch {}
                }
                const deletedSet = new Set(deletedIds);
                const cleanIncoming = incoming.filter((item: any) => {
                  const itemId = String(item?.id || '').trim().toLowerCase();
                  const itemSlug = String(item?.slug || '').trim().toLowerCase();
                  return itemId && !deletedSet.has(itemId) && !deletedSet.has(itemSlug);
                });

                const existingRow = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind(registryId).first();
                let merged = cleanIncoming;
                if (existingRow?.structured_content) {
                  try {
                    const existingStructured = JSON.parse(existingRow.structured_content as string);
                    const existingValue = typeof existingStructured?.value === 'string' ? JSON.parse(existingStructured.value) : existingStructured?.value;
                    if (Array.isArray(existingValue)) {
                      const incomingIds = new Set(cleanIncoming.map((item: any) => String(item?.id || '').trim().toLowerCase()));
                      const incomingSlugs = new Set(cleanIncoming.map((item: any) => String(item?.slug || '').trim().toLowerCase()));
                      const existingLive = existingValue.filter((item: any) => {
                        const itemId = String(item?.id || '').trim().toLowerCase();
                        const itemSlug = String(item?.slug || '').trim().toLowerCase();
                        return itemId && !deletedSet.has(itemId) && !deletedSet.has(itemSlug) && !incomingIds.has(itemId) && !incomingSlugs.has(itemSlug);
                      });
                      merged = [...cleanIncoming, ...existingLive];
                    }
                  } catch {}
                }
                b.structured_content = { ...structured, storageKey: isGuideRegistry ? 'hh_guide_articles_v2' : 'hh_guide_categories_v2', value: JSON.stringify(merged), updatedAt: new Date().toISOString() };
              } catch {
                return json({ error: 'Guide registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
              }
            }

            // Blog registries: deletions are permanent and survive stale browser syncs.
            // A deleted post/category is recorded in an append-only tombstone registry.
            // The server also removes it from the live registry immediately so hydration
            // can never resurrect it.
            if (id === 'registry-deleted-blog-posts' || slug === 'hh_deleted_blog_post_ids' ||
                id === 'registry-deleted-blog-categories' || slug === 'hh_deleted_blog_category_ids') {
              try {
                const isPostTombstone = id === 'registry-deleted-blog-posts' || slug === 'hh_deleted_blog_post_ids';
                const tombstoneId = isPostTombstone ? 'registry-deleted-blog-posts' : 'registry-deleted-blog-categories';
                const tombstoneKey = isPostTombstone ? 'hh_deleted_blog_post_ids' : 'hh_deleted_blog_category_ids';
                const registryId = isPostTombstone ? 'registry-blog-posts-v2' : 'registry-blog-categories-v2';
                const structured = typeof b.structured_content === 'string'
                  ? JSON.parse(b.structured_content)
                  : (b.structured_content || {});
                const rawValue = typeof structured?.value === 'string' ? structured.value : structured?.value;
                const incomingValue = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                if (!Array.isArray(incomingValue)) {
                  return json({ error: 'Blog deletion registry rejected: invalid payload.' }, 400, privateHeaders(env, request));
                }

                const existingRow = await env.DB.prepare(
                  'SELECT structured_content FROM contents WHERE id=?'
                ).bind(tombstoneId).first();
                let existingIds: string[] = [];
                if (existingRow?.structured_content) {
                  try {
                    const existingStructured = JSON.parse(existingRow.structured_content as string);
                    const existingValue = typeof existingStructured?.value === 'string'
                      ? JSON.parse(existingStructured.value)
                      : existingStructured?.value;
                    if (Array.isArray(existingValue)) {
                      existingIds = existingValue.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean);
                    }
                  } catch {}
                }

                const deletedSet = new Set<string>([
                  ...existingIds,
                  ...incomingValue.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean),
                ]);

                const now = new Date().toISOString();
                const tombstoneStructured = {
                  storageKey: tombstoneKey,
                  value: JSON.stringify(Array.from(deletedSet)),
                  updatedAt: now,
                };

                await env.DB.prepare(
                  `INSERT INTO contents (id,content_type,title,slug,structured_content,status,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET
                     structured_content=excluded.structured_content,
                     status=excluded.status,
                     updated_at=excluded.updated_at`
                ).bind(
                  tombstoneId,
                  'shared_local_state',
                  isPostTombstone ? 'Deleted Blog Post IDs' : 'Deleted Blog Category IDs',
                  tombstoneKey,
                  JSON.stringify(tombstoneStructured),
                  'published',
                  now,
                  now
                ).run();

                // Immediately remove every tombstoned record from the live server registry.
                const registryRow = await env.DB.prepare(
                  'SELECT structured_content FROM contents WHERE id=?'
                ).bind(registryId).first();
                if (registryRow?.structured_content) {
                  try {
                    const registryStructured = JSON.parse(registryRow.structured_content as string);
                    const registryValue = typeof registryStructured?.value === 'string'
                      ? JSON.parse(registryStructured.value)
                      : registryStructured?.value;
                    if (Array.isArray(registryValue)) {
                      const clean = registryValue.filter((item: any) => {
                        const itemId = String(item?.id || '').trim().toLowerCase();
                        return itemId && !deletedSet.has(itemId);
                      });
                      await env.DB.prepare(
                        'UPDATE contents SET structured_content=?, updated_at=? WHERE id=?'
                      ).bind(
                        JSON.stringify({
                          ...registryStructured,
                          value: JSON.stringify(clean),
                          updatedAt: now,
                        }),
                        now,
                        registryId
                      ).run();
                    }
                  } catch {}
                }

                b.structured_content = tombstoneStructured;
              } catch {
                return json({ error: 'Blog deletion registry rejected: invalid payload.' }, 400, privateHeaders(env, request));
              }
            }

            if (id === 'registry-blog-posts-v2' || slug === 'hh_blog_posts_v2' ||
                id === 'registry-blog-categories-v2' || slug === 'hh_blog_categories_v2') {
              try {
                const isPostRegistry = id === 'registry-blog-posts-v2' || slug === 'hh_blog_posts_v2';
                const registryId = isPostRegistry ? 'registry-blog-posts-v2' : 'registry-blog-categories-v2';
                const tombstoneId = isPostRegistry ? 'registry-deleted-blog-posts' : 'registry-deleted-blog-categories';
                const structured = typeof b.structured_content === 'string'
                  ? JSON.parse(b.structured_content)
                  : (b.structured_content || {});
                const rawValue = typeof structured?.value === 'string' ? structured.value : structured?.value;
                const incoming = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                if (!Array.isArray(incoming)) {
                  return json({ error: 'Blog registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
                }

                const deletedRow = await env.DB.prepare(
                  'SELECT structured_content FROM contents WHERE id=?'
                ).bind(tombstoneId).first();
                let deletedIds: string[] = [];
                if (deletedRow?.structured_content) {
                  try {
                    const deletedStructured = JSON.parse(deletedRow.structured_content as string);
                    const deletedValue = typeof deletedStructured?.value === 'string'
                      ? JSON.parse(deletedStructured.value)
                      : deletedStructured?.value;
                    if (Array.isArray(deletedValue)) {
                      deletedIds = deletedValue.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean);
                    }
                  } catch {}
                }
                const deletedSet = new Set(deletedIds);
                const cleanIncoming = incoming.filter((item: any) => {
                  const itemId = String(item?.id || '').trim().toLowerCase();
                  return itemId && !deletedSet.has(itemId);
                });

                // Normal browser sync must not shrink the server registry. It may add/update,
                // while the permanent tombstones above are the only way records disappear.
                const existingRow = await env.DB.prepare(
                  'SELECT structured_content FROM contents WHERE id=?'
                ).bind(registryId).first();
                let merged = cleanIncoming;
                if (existingRow?.structured_content) {
                  try {
                    const currentStructured = JSON.parse(existingRow.structured_content as string);
                    const currentValue = typeof currentStructured?.value === 'string'
                      ? JSON.parse(currentStructured.value)
                      : currentStructured?.value;
                    if (Array.isArray(currentValue)) {
                      const incomingIds = new Set(cleanIncoming.map((item: any) => String(item?.id || '').trim().toLowerCase()));
                      const existingLive = currentValue.filter((item: any) => {
                        const itemId = String(item?.id || '').trim().toLowerCase();
                        return itemId && !deletedSet.has(itemId) && !incomingIds.has(itemId);
                      });
                      merged = [...cleanIncoming, ...existingLive];
                    }
                  } catch {}
                }

                b.structured_content = {
                  ...structured,
                  storageKey: isPostRegistry ? 'hh_blog_posts_v2' : 'hh_blog_categories_v2',
                  value: JSON.stringify(merged),
                  updatedAt: new Date().toISOString(),
                };
              } catch {
                return json({ error: 'Blog registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
              }
            }

            if (id === 'registry-packages' || slug === 'hh_tour_packages_v2') {
              try {
                const structured = typeof b.structured_content === 'string'
                  ? JSON.parse(b.structured_content)
                  : (b.structured_content || {});
                const rawValue = structured && typeof structured.value === 'string'
                  ? structured.value
                  : structured?.value;
                const incomingRaw = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                if (!Array.isArray(incomingRaw)) {
                  return json({ error: 'Tour registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
                }

                const clientDeletedRaw = Array.isArray(structured?.deletedPackageIds)
                  ? structured.deletedPackageIds
                  : [];
                const deletedRow = await env.DB.prepare(
                  'SELECT structured_content FROM contents WHERE id=?'
                ).bind('registry-deleted-packages').first();

                let serverDeleted: string[] = [];
                if (deletedRow?.structured_content) {
                  try {
                    const deletedStructured = JSON.parse(deletedRow.structured_content as string);
                    const deletedValue = typeof deletedStructured?.value === 'string'
                      ? JSON.parse(deletedStructured.value)
                      : deletedStructured?.value;
                    if (Array.isArray(deletedValue)) serverDeleted = deletedValue.map((x: any) => String(x).trim().toLowerCase());
                  } catch {}
                }

                const deletedSet = new Set<string>([
                  ...serverDeleted,
                  ...clientDeletedRaw.map((x: any) => String(x).trim().toLowerCase()),
                ].filter(Boolean));

                // Persist the deletion tombstones before accepting this package registry.
                // This makes the protection survive logout, refresh, another browser,
                // and later stale background syncs.
                if (deletedSet.size > 0) {
                  const deletedNow = new Date().toISOString();
                  const deletedStructured = {
                    storageKey: 'hh_deleted_package_ids',
                    value: JSON.stringify(Array.from(deletedSet)),
                    updatedAt: deletedNow,
                  };
                  await env.DB.prepare(
                    `INSERT INTO contents (id,content_type,title,slug,structured_content,status,created_at,updated_at)
                     VALUES (?,?,?,?,?,?,?,?)
                     ON CONFLICT(id) DO UPDATE SET
                       structured_content=excluded.structured_content,
                       status=excluded.status,
                       updated_at=excluded.updated_at`
                  ).bind(
                    'registry-deleted-packages',
                    'shared_local_state',
                    'Deleted Package IDs',
                    'hh_deleted_package_ids',
                    JSON.stringify(deletedStructured),
                    'published',
                    deletedNow,
                    deletedNow
                  ).run();
                }

                const isDeleted = (pkg: any) => {
                  const pkgId = String(pkg?.id || '').trim().toLowerCase();
                  return Boolean(pkgId && deletedSet.has(pkgId));
                };

                const incoming = incomingRaw.filter((pkg: any) => !isDeleted(pkg));
                const allowTourDeletion = structured?.allowTourDeletion === true;

                if (!allowTourDeletion) {
                  const existingRow = await env.DB.prepare(
                    'SELECT structured_content FROM contents WHERE id=?'
                  ).bind('registry-packages').first();

                  if (existingRow?.structured_content) {
                    try {
                      const existingStructured = JSON.parse(existingRow.structured_content as string);
                      const existingValue = typeof existingStructured?.value === 'string'
                        ? JSON.parse(existingStructured.value)
                        : existingStructured?.value;
                      const existingTours = Array.isArray(existingValue) ? existingValue : [];
                      const incomingIds = new Set(incoming.map((pkg: any) => String(pkg?.id || '').trim().toLowerCase()).filter(Boolean));
                      const merged = [
                        ...incoming,
                        ...existingTours.filter((pkg: any) => {
                          const pkgId = String(pkg?.id || '').trim().toLowerCase();
                          return pkgId &&
                            !isDeleted(pkg) &&
                            !incomingIds.has(pkgId);
                        }),
                      ];
                      b.structured_content = {
                        ...structured,
                        value: JSON.stringify(merged),
                        updatedAt: new Date().toISOString(),
                      };
                    } catch {}
                  }
                } else {
                  b.structured_content = {
                    ...structured,
                    value: JSON.stringify(incoming),
                    updatedAt: new Date().toISOString(),
                  };
                }
              } catch {
                return json({ error: 'Tour registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
              }
            }
            if (id === 'registry-destinations' || slug === 'hh_destinations_registry_v2') {
              try {
                const structured = typeof b.structured_content === 'string'
                  ? JSON.parse(b.structured_content)
                  : (b.structured_content || {});
                const rawValue = structured && typeof structured.value === 'string' ? structured.value : structured?.value;
                const destinations = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
                const incoming = new Set(
                  destinations && typeof destinations === 'object'
                    ? (Array.isArray(destinations)
                        ? destinations.map((d: any) => String(d?.slug || d?.id || '').trim().toLowerCase())
                        : Object.keys(destinations).map((k) => k.trim().toLowerCase()))
                    : []
                );
                if (!incoming.has('jammu-kashmir')) {
                  return json({ error: 'Destination registry rejected: Jammu & Kashmir must remain intact.' }, 409, privateHeaders(env, request));
                }
              } catch {
                return json({ error: 'Destination registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
              }
            }

            if (id === 'registry-media-assets-v2' || slug === 'hh_media_assets_v2') {
              try {
                const structured = typeof b.structured_content === 'string'
                  ? JSON.parse(b.structured_content)
                  : (b.structured_content || {});
                const rawValue = structured && typeof structured.value === 'string' ? structured.value : structured?.value;
                const incomingMedia = Array.isArray(typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue)
                  ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue)
                  : null;
                const allowMediaDeletion = structured?.allowMediaDeletion === true;
                if (!incomingMedia) {
                  return json({ error: 'Media registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
                }

                const existing = await env.DB.prepare('SELECT structured_content FROM contents WHERE id=?').bind('registry-media-assets-v2').first();
                if (existing?.structured_content && !allowMediaDeletion) {
                  try {
                    const currentStructured = JSON.parse(existing.structured_content as string);
                    const currentValue = typeof currentStructured?.value === 'string'
                      ? JSON.parse(currentStructured.value)
                      : currentStructured?.value;
                    const currentIds = new Set(
                      Array.isArray(currentValue) ? currentValue.map((asset: any) => String(asset?.id || '')) : []
                    );
                    const incomingIds = new Set(incomingMedia.map((asset: any) => String(asset?.id || '')));
                    const missingExisting = [...currentIds].some((assetId) => assetId && !incomingIds.has(assetId));
                    if (missingExisting) {
                      return json({ error: 'Media registry protected: stale browser state cannot remove existing photos.' }, 409, privateHeaders(env, request));
                    }
                  } catch {}
                }
              } catch {
                return json({ error: 'Media registry rejected: invalid registry payload.' }, 400, privateHeaders(env, request));
              }
            }

            await env.DB.prepare(
              'INSERT INTO contents (id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET content_type=excluded.content_type,title=excluded.title,slug=excluded.slug,subtitle=excluded.subtitle,summary=excluded.summary,body=excluded.body,structured_content=excluded.structured_content,seo_title=excluded.seo_title,seo_description=excluded.seo_description,seo_keywords=excluded.seo_keywords,status=excluded.status,media=excluded.media,updated_at=excluded.updated_at'
            ).bind(
              id,
              text(b.content_type, 80) || 'tour',
              title,
              slug,
              text(b.subtitle, 500),
              text(b.summary, 3000),
              text(b.body, 50000),
              typeof b.structured_content === 'object' ? JSON.stringify(b.structured_content) : null,
              text(b.seo_title, 200),
              text(b.seo_description, 500),
              text(b.seo_keywords, 500),
              ['published', 'draft', 'archived'].includes(b.status) ? b.status : 'draft',
              typeof b.media === 'object' ? JSON.stringify(b.media) : null,
              now,
              now
            ).run();
            return json({ success: true, id, slug }, 200, privateHeaders(env, request));
          }
        }

        if (pathname.startsWith('/api/files/') && request.method === 'GET') {
          if (!env.BUCKET) return json({ error: 'R2 storage bucket is not bound' }, 404, { ...publicHeaders(env, request), 'Cache-Control': 'no-cache, no-store, must-revalidate' });
          const rawPath = pathname.replace(/^\/api\/files\/?/, '');
          let key = rawPath;
          try { key = decodeURIComponent(rawPath); } catch {}
          key = key.replace(/^r2:\/\//i, '').replace(/^\/+/, '');
          if (!key || key.includes('..') || key.startsWith('/')) {
            return json({ error: 'Invalid file key' }, 400, { ...publicHeaders(env, request), 'Cache-Control': 'no-cache, no-store, must-revalidate' });
          }

          let object = await env.BUCKET.get(key);
          if (!object && key !== rawPath) object = await env.BUCKET.get(rawPath);
          if (!object && key.includes('/')) object = await env.BUCKET.get(key.replace(/\//g, '%2F'));
          if (!object && key.includes('%2F')) object = await env.BUCKET.get(key.replace(/%2F/gi, '/'));

          if (!object) {
            return json({ error: 'File not found', key }, 404, { ...publicHeaders(env, request), 'Cache-Control': 'no-cache, no-store, must-revalidate' });
          }

          const h = new Headers(publicHeaders(env, request));
          object.writeHttpMetadata(h);
          if (object.httpEtag) h.set('ETag', object.httpEtag);

          let contentType = h.get('Content-Type');
          if (!contentType || contentType === 'application/octet-stream') {
            const extMatch = key.match(/\.([a-zA-Z0-9]+)$/);
            const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '';
            const mimeMap: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.avif': 'image/avif',
              '.ico': 'image/x-icon',
              '.pdf': 'application/pdf',
            };
            contentType = mimeMap[ext] || 'image/jpeg';
            h.set('Content-Type', contentType);
          }

          h.set('Cache-Control', 'public, max-age=31536000, immutable');
          h.set('Access-Control-Allow-Origin', '*');
          return new Response(object.body, { headers: h });
        }

        if (pathname === '/api/upload' && request.method === 'POST') {
          const e = await requireCms();
          if (!e || !env.BUCKET) return json({ error: 'Unauthorized or bucket unavailable.' }, 401, privateHeaders(env, request));
          const form = await request.formData();
          const file = form.get('file');
          if (!(file instanceof File)) return json({ error: 'No file provided.' }, 400, privateHeaders(env, request));
          if (file.size > 15 * 1024 * 1024) return json({ error: 'File too large.' }, 413, privateHeaders(env, request));
          const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150);
          const key = `media/${crypto.randomUUID()}-${name}`;
          await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' } });
          const safePath = key.split('/').map(s => encodeURIComponent(s)).join('/');
          return json({ success: true, r2_key: key, url: `/api/files/${safePath}` }, 201, privateHeaders(env, request));
        }

        if (pathname === '/api/media/upload' && request.method === 'POST') {
          const e = await requireCms();
          if (!e || !env.BUCKET) return json({ error: 'Unauthorized or bucket unavailable.' }, 401, privateHeaders(env, request));
          const body = await request.json().catch(() => ({})) as any;
          if (!body.fileBase64 || !body.storagePath) return json({ error: 'fileBase64 and storagePath are required.' }, 400, privateHeaders(env, request));
          const cleanPath = String(body.storagePath).replace(/^r2:\/\//i, '').replace(/^\/+/, '');
          const base64Str = String(body.fileBase64).replace(/^data:[^;]+;base64,/, '');
          const binary = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0));
          await env.BUCKET.put(cleanPath, binary, { httpMetadata: { contentType: body.contentType || 'image/jpeg', cacheControl: 'public, max-age=31536000, immutable' } });
          const safePath = cleanPath.split('/').map(s => encodeURIComponent(s)).join('/');
          return json({ success: true, r2_key: cleanPath, url: `/api/files/${safePath}` }, 201, privateHeaders(env, request));
        }

        if (pathname === '/api/media/delete' && request.method === 'POST') {
          const e = await requireCms();
          if (!e || !env.BUCKET) return json({ error: 'Unauthorized or bucket unavailable.' }, 401, privateHeaders(env, request));
          const body = await request.json().catch(() => ({})) as any;
          if (body.storagePath) {
            const cleanPath = String(body.storagePath).replace(/^r2:\/\//i, '').replace(/^\/+/, '');
            await env.BUCKET.delete(cleanPath);
          }
          return json({ success: true }, 200, privateHeaders(env, request));
        }
        if(pathname==='/api/notify-lead'&&request.method==='POST'){
          if(!env.DB)return json({error:'Database unavailable.'},503,privateHeaders(env,request));
          const b=await request.json().catch(()=>({})),
                lead=b.leadData||b,
                name=text(lead.travelerName||lead.name,120),
                phone=text(lead.phone,40),
                pack=text(lead.packageTitle||lead.package,200),
                email=text(lead.email,160),
                notes=text(lead.specialRequests||lead.notes,1000);
          if(!name||!phone)return json({error:'Name and phone are required.'},400,privateHeaders(env,request));
          await env.DB.prepare('INSERT INTO leads (name,phone,package,created_at) VALUES (?,?,?,?)').bind(name,phone,pack,new Date().toISOString()).run();
          if(env.RESEND_API_KEY){
            try {
              await fetch('https://api.resend.com/emails',{
                method:'POST',
                headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
                body:JSON.stringify({
                  from: env.FROM_EMAIL || 'Holidays Hunt <onboarding@resend.dev>',
                  to:[env.NOTIFICATION_EMAIL || 'rohitchoudharyonline@gmail.com'],
                  subject:`New Lead: ${pack||'Tour Inquiry'} - ${name}`,
                  html:`<h2>New Lead Received!</h2><p><strong>Name:</strong> ${name}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Email:</strong> ${email||'N/A'}</p><p><strong>Package:</strong> ${pack||'Custom'}</p><p><strong>Notes:</strong> ${notes||'None'}</p>`
                })
              });
            } catch(e) { console.error('Cloudflare Worker email notification failed:', e); }
          }
          return json({success:true},201,publicHeaders(env,request));
        }
        if(pathname==='/api/generate-tour'&&request.method==='POST'){
          const e=await requireCms();
          if(!e)return json({error:'Unauthorized.'},401,privateHeaders(env,request));
          const key=String(env.GEMINI_API_KEY||'');
          if(!key)return json({error:'AI service not configured.'},503,privateHeaders(env,request));
          const b=await request.json().catch(()=>({}));
          const command=text(b.command,12000);
          if(!command)return json({error:'Tour command is required.'},400,privateHeaders(env,request));
          const ai=new GoogleGenAI({apiKey:key});
          const prompt=`You are the content assistant for Holidays Hunt, a professional Indian travel agency. Convert the user's tour command into ONE complete tour package draft.

Return ONLY valid JSON. Do not use markdown or code fences. Do not invent prices, hotel ratings, permits, ticket costs, reviews, or factual claims that were not supplied. If information is missing, use an empty string, empty array, or a safe neutral value.

Required JSON shape:
{
  "title": string,
  "tagline": string,
  "destination": string,
  "destinationTag": string,
  "country": string,
  "category": "Family"|"Honeymoon"|"Pilgrimage",
  "durationDays": number,
  "durationNights": number,
  "overview": string,
  "startLocation": string,
  "endLocation": string,
  "bestTimeToVisit": string,
  "tourType": string,
  "itinerary": [{"dayNumber":number,"title":string,"location":string,"description":string,"meals":string[],"stayHotel":string,"activities":string[]}],
  "inclusions": string[],
  "exclusions": string[],
  "hotels": [{"name":string,"city":string,"roomType":string,"nights":number,"mealPlan":string}],
  "seoTitle": string,
  "metaDescription": string,
  "seoKeywords": string,
  "importantNotes": string[],
  "policies": {"cancellationPolicy":string[],"termsAndConditions":string[],"paymentPolicy":string[]}
}

User command:
${command}`;
          try{
            const r=await ai.models.generateContent({
              model:'gemini-2.5-flash',
              contents:prompt,
              config:{responseMimeType:'application/json'}
            });
            const raw=String(r.text||'').trim();
            const clean=raw.replace(/^\`\`\`json\s*/i,'').replace(/^\`\`\`\s*/,'').replace(/\s*\`\`\`$/,'').trim();
            const tour=JSON.parse(clean);
            if(!tour||typeof tour!=='object'||!String(tour.title||'').trim()||!Array.isArray(tour.itinerary)){
              return json({error:'AI returned an incomplete tour draft.'},502,privateHeaders(env,request));
            }
            return json({success:true,tour},200,privateHeaders(env,request));
          }catch(err:any){
            console.error('Tour AI generation failed',err);
            return json({error:'AI could not create the tour draft. Please try again.'},502,privateHeaders(env,request));
          }
        }

        if(['/api/generate-seo','/api/generate-guide-article','/api/generate-guide-faqs','/api/generate-guide-seo','/api/fetch-hotel-details'].includes(pathname)){const e=await requireCms();if(!e)return json({error:'Unauthorized.'},401,privateHeaders(env,request));const key=String(env.GEMINI_API_KEY||'');if(!key)return json({error:'AI service not configured.'},503,privateHeaders(env,request));const b=await request.json().catch(()=>({})),title=text(b.title||b.hotelName||'Sacred destination',300),ai=new GoogleGenAI({apiKey:key});const prompt=pathname==='/api/generate-seo'?`Generate concise SEO title and meta description for ${title}.`:`Create accurate editorial content for ${title}. Do not invent facts, ratings, reviews or amenities.`;const r=await ai.models.generateContent({model:'gemini-2.5-flash',contents:prompt});return json({success:true,result:r.text},200,privateHeaders(env,request));}

        return json({error:'API endpoint not found'},404,publicHeaders(env,request));
      } catch(e:any) { console.error('Worker error',e); return json({error:'Internal server error'},500,privateHeaders(env,request)); }
    }
    const escHtml = (value: unknown) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const toPublicWorkerImageUrl = (rawUrl: unknown, origin: string): string => {
      const clean = String(rawUrl ?? '').trim();
      if (!clean || clean.startsWith('data:') || clean.startsWith('blob:')) return '';
      const baseOrigin = origin.replace(/\/$/, '');

      let storageKey = '';
      if (clean.startsWith('/api/files/')) {
        storageKey = clean.slice('/api/files/'.length);
      } else if (clean.startsWith('r2://')) {
        storageKey = clean.slice('r2://'.length);
      } else if (/^https?:\/\/[^/]+\/api\/files\//i.test(clean)) {
        storageKey = clean.replace(/^https?:\/\/[^/]+\/api\/files\//i, '');
      } else if (/^https?:\/\/media\.holidayshunt\.com\//i.test(clean)) {
        storageKey = clean.replace(/^https?:\/\/media\.holidayshunt\.com\//i, '');
      }

      if (storageKey) {
        const cleanKey = storageKey.split('?')[0].replace(/^\/+/, '');
        const encoded = cleanKey
          .split('/')
          .filter(Boolean)
          .map((seg) => {
            try {
              return encodeURIComponent(decodeURIComponent(seg));
            } catch {
              return encodeURIComponent(seg);
            }
          })
          .join('/');
        return `${baseOrigin}/api/files/${encoded}`;
      }

      if (clean.startsWith('/')) return `${baseOrigin}${clean}`;
      return clean;
    };

    const resolveDynamicPageSeo = async (reqUrl: URL): Promise<{
      title: string;
      description: string;
      keywords?: string;
      ogTitle: string;
      ogDescription: string;
      ogImage?: string;
      ogType?: string;
      canonicalUrl: string;
      robots?: string;
      jsonLd?: Record<string, any>;
    } | null> => {
      const normPath = reqUrl.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      if (normPath === '/admin-rudra-0712' || normPath.startsWith('/admin-rudra-0712/')) {
        return {
          title: 'Holidays Hunt Admin',
          description: 'Restricted CMS area',
          ogTitle: 'Holidays Hunt Admin',
          ogDescription: 'Restricted CMS area',
          canonicalUrl: `${reqUrl.origin}/`,
          robots: 'noindex, nofollow',
        };
      }

      if (!env.DB) return null;

      const origin = reqUrl.origin.startsWith('http') ? reqUrl.origin : 'https://holidayshunt.com';
      const registryIds = [
        'registry-packages',
        'registry-deleted-packages',
        'registry-destinations',
        'registry-guides-v2',
        'registry-blog-posts-v2',
        'registry-custom-pages-v2',
      ];
      const placeholders = registryIds.map(() => '?').join(',');
      const rows = (
        await env.DB.prepare(
          `SELECT id, structured_content FROM contents WHERE status=? AND id IN (${placeholders})`
        )
          .bind('published', ...registryIds)
          .all()
      ).results || [];

      const byId = new Map<string, any>();
      for (const row of rows) {
        try {
          const structured = row.structured_content ? JSON.parse(String(row.structured_content)) : {};
          const raw = structured?.value;
          byId.set(String(row.id), typeof raw === 'string' ? JSON.parse(raw) : raw);
        } catch {
          byId.set(String(row.id), null);
        }
      }

      const deletedRaw = byId.get('registry-deleted-packages');
      const deletedIds = new Set<string>(
        Array.isArray(deletedRaw) ? deletedRaw.map((x: any) => String(x).trim().toLowerCase()).filter(Boolean) : []
      );
      const packages = (Array.isArray(byId.get('registry-packages')) ? byId.get('registry-packages') : []).filter(
        (p: any) => p && p.id && !deletedIds.has(String(p.id).trim().toLowerCase())
      );
      const destinations = getDestinationMap(byId.get('registry-destinations'));
      const guides = Array.isArray(byId.get('registry-guides-v2')) ? byId.get('registry-guides-v2') : [];
      const blogPosts = Array.isArray(byId.get('registry-blog-posts-v2')) ? byId.get('registry-blog-posts-v2') : [];
      const customPages = Array.isArray(byId.get('registry-custom-pages-v2')) ? byId.get('registry-custom-pages-v2') : [];

      const slugifyTitle = (s: unknown) =>
        String(s ?? '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const findPackage = (seg: string) =>
        packages.find(
          (p: any) =>
            String(p?.id || '').toLowerCase() === seg ||
            String(p?.slug || '').toLowerCase() === seg ||
            slugifyTitle(p?.title) === seg
        );

      const findDestination = (seg: string) => {
        if (destinations[seg]) return destinations[seg];
        return Object.values(destinations).find(
          (d: any) =>
            String(d?.slug || '').toLowerCase() === seg ||
            String(d?.id || '').toLowerCase() === seg ||
            slugifyTitle(d?.name) === seg
        );
      };

      const tourCategories = new Set(['pilgrimage', 'family', 'honeymoon', 'group', 'luxury']);
      let matchedPkg: any = null;
      let matchedDest: any = null;
      let matchedGuide: any = null;
      let matchedPost: any = null;
      let matchedPage: any = null;
      let routeSeg = '';

      if (normPath.startsWith('/tours/')) {
        routeSeg = decodeURIComponent(normPath.slice('/tours/'.length).split('/')[0] || '').toLowerCase();
        if (routeSeg && !tourCategories.has(routeSeg)) {
          matchedPkg = findPackage(routeSeg);
          if (!matchedPkg) matchedDest = findDestination(routeSeg);
        }
      } else if (normPath.includes('/package/')) {
        routeSeg = decodeURIComponent(normPath.split('/package/')[1]?.split('/')[0] || '').toLowerCase();
        if (routeSeg) matchedPkg = findPackage(routeSeg);
      } else if (normPath.startsWith('/destination/') || normPath.startsWith('/destinations/') || normPath.startsWith('/holidays/')) {
        routeSeg = decodeURIComponent(
          normPath.replace(/^\/(destinations?|holidays)\//, '').split('/')[0] || ''
        ).toLowerCase();
        if (routeSeg) matchedDest = findDestination(routeSeg);
      } else if (normPath.startsWith('/guides/') || normPath.startsWith('/guide/')) {
        routeSeg = decodeURIComponent(normPath.replace(/^\/guides?\//, '').split('/')[0] || '').toLowerCase();
        if (routeSeg) {
          matchedGuide = guides.find(
            (g: any) =>
              g?.status === 'published' &&
              (String(g?.slug || '').toLowerCase() === routeSeg || String(g?.id || '').toLowerCase() === routeSeg)
          );
        }
      } else if (normPath.startsWith('/travel-blog/') || normPath.startsWith('/blog/')) {
        routeSeg = decodeURIComponent(normPath.replace(/^\/(travel-blog|blog)\//, '').split('/')[0] || '').toLowerCase();
        if (routeSeg) {
          matchedPost = blogPosts.find(
            (p: any) =>
              p?.status === 'published' &&
              (String(p?.slug || '').toLowerCase() === routeSeg || String(p?.id || '').toLowerCase() === routeSeg)
          );
          if (!matchedPost) {
            matchedGuide = guides.find(
              (g: any) =>
                g?.status === 'published' &&
                (String(g?.slug || '').toLowerCase() === routeSeg || String(g?.id || '').toLowerCase() === routeSeg)
            );
          }
        }
      } else if (normPath.startsWith('/page/')) {
        routeSeg = decodeURIComponent(normPath.slice('/page/'.length).split('/')[0] || '').toLowerCase();
        if (routeSeg) {
          matchedPage = customPages.find(
            (p: any) =>
              p?.status === 'published' &&
              (String(p?.slug || '').toLowerCase() === routeSeg || String(p?.id || '').toLowerCase() === routeSeg)
          );
        }
      }

      if (matchedPkg) {
        const title = text(matchedPkg.seoMetaTitle || matchedPkg.seoTitle || `${matchedPkg.title} | Holidays Hunt`, 160);
        const description = text(matchedPkg.seoMetaDescription || matchedPkg.metaDescription || matchedPkg.tagline || matchedPkg.overview, 300);
        const keywords = text(matchedPkg.seoKeywords, 400);
        const ogTitle = text(matchedPkg.ogTitle || title, 160);
        const ogDescription = text(matchedPkg.ogDescription || description, 300);
        const canonicalUrl = text(matchedPkg.canonicalUrl, 500) || `${origin}/tours/${encodeURIComponent(matchedPkg.slug || routeSeg)}`;
        const ogImage = toPublicWorkerImageUrl(matchedPkg.ogImage || matchedPkg.coverImage, origin);
        return {
          title,
          description,
          keywords,
          ogTitle,
          ogDescription,
          ogImage: ogImage || undefined,
          ogType: 'product',
          canonicalUrl,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: matchedPkg.title,
            description,
            url: canonicalUrl,
            ...(ogImage ? { image: [ogImage] } : {}),
            provider: {
              '@type': 'TravelAgency',
              name: 'Holidays Hunt',
              url: origin,
              telephone: '+919419915255',
            },
            ...(matchedPkg.startingPrice
              ? {
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'INR',
                    price: matchedPkg.startingPrice,
                    availability: 'https://schema.org/InStock',
                    url: canonicalUrl,
                  },
                }
              : {}),
          },
        };
      }

      if (matchedDest) {
        const title = text(matchedDest.seoMetaTitle || `${matchedDest.name} Tour Packages & Yatra Guide | Holidays Hunt`, 160);
        const description = text(matchedDest.seoMetaDescription || matchedDest.tourPackagesDescription || matchedDest.tagline, 300);
        const keywords = text(matchedDest.seoKeywords, 400);
        const ogTitle = text(matchedDest.ogTitle || title, 160);
        const ogDescription = text(matchedDest.ogDescription || description, 300);
        const canonicalUrl = text(matchedDest.canonicalUrl, 500) || `${origin}/destination/${encodeURIComponent(matchedDest.slug || routeSeg)}`;
        const ogImage = toPublicWorkerImageUrl(matchedDest.ogImage || matchedDest.heroImage, origin);
        return {
          title,
          description,
          keywords,
          ogTitle,
          ogDescription,
          ogImage: ogImage || undefined,
          ogType: 'website',
          canonicalUrl,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'TouristDestination',
            name: matchedDest.name,
            description,
            url: canonicalUrl,
            ...(ogImage ? { image: [ogImage] } : {}),
          },
        };
      }

      if (matchedGuide) {
        const title = text(matchedGuide.seo?.metaTitle || matchedGuide.seo?.seoTitle || `${matchedGuide.title} | Holidays Hunt`, 160);
        const description = text(matchedGuide.seo?.metaDescription || matchedGuide.excerpt, 300);
        const keywords = text(
          [matchedGuide.seo?.primaryKeyword, ...(Array.isArray(matchedGuide.seo?.secondaryKeywords) ? matchedGuide.seo.secondaryKeywords : [])]
            .filter(Boolean)
            .join(', '),
          400
        );
        const ogTitle = text(matchedGuide.seo?.ogTitle || title, 160);
        const ogDescription = text(matchedGuide.seo?.ogDescription || description, 300);
        const canonicalUrl = text(matchedGuide.seo?.canonicalUrl, 500) || `${origin}/guides/${encodeURIComponent(matchedGuide.slug || routeSeg)}`;
        const ogImage = toPublicWorkerImageUrl(matchedGuide.seo?.ogImage || matchedGuide.featuredImage, origin);
        return {
          title,
          description,
          keywords,
          ogTitle,
          ogDescription,
          ogImage: ogImage || undefined,
          ogType: 'article',
          canonicalUrl,
          robots: matchedGuide.seo?.noIndex ? 'noindex, follow' : undefined,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: matchedGuide.title,
            description,
            mainEntityOfPage: canonicalUrl,
            ...(ogImage ? { image: [ogImage] } : {}),
            datePublished: matchedGuide.publishedAt || matchedGuide.createdAt,
            dateModified: matchedGuide.updatedAt || matchedGuide.publishedAt || matchedGuide.createdAt,
            author: { '@type': 'Organization', name: matchedGuide.authorName || 'Holidays Hunt' },
            publisher: {
              '@type': 'Organization',
              name: 'Holidays Hunt',
              logo: { '@type': 'ImageObject', url: `${origin}/holidayshunt-logo.png` },
            },
          },
        };
      }

      if (matchedPost) {
        const title = text(matchedPost.seo?.metaTitle || `${matchedPost.title} | Holidays Hunt`, 160);
        const description = text(matchedPost.seo?.metaDescription || matchedPost.excerpt, 300);
        const keywords = text(
          matchedPost.seo?.focusKeyword || (Array.isArray(matchedPost.tags) ? matchedPost.tags.join(', ') : ''),
          400
        );
        const ogTitle = text(matchedPost.seo?.ogTitle || title, 160);
        const ogDescription = text(matchedPost.seo?.ogDescription || description, 300);
        const canonicalUrl = text(matchedPost.seo?.canonicalUrl, 500) || `${origin}/travel-blog/${encodeURIComponent(matchedPost.slug || routeSeg)}`;
        const ogImage = toPublicWorkerImageUrl(matchedPost.seo?.ogImage || matchedPost.featuredImage, origin);
        return {
          title,
          description,
          keywords,
          ogTitle,
          ogDescription,
          ogImage: ogImage || undefined,
          ogType: 'article',
          canonicalUrl,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': matchedPost.seo?.schemaType || 'BlogPosting',
            headline: matchedPost.title,
            description,
            mainEntityOfPage: canonicalUrl,
            ...(ogImage ? { image: [ogImage] } : {}),
            datePublished: matchedPost.publishedAt,
            dateModified: matchedPost.updatedAt || matchedPost.publishedAt,
            author: { '@type': 'Person', name: matchedPost.author?.name || 'Holidays Hunt Editorial Team' },
            publisher: {
              '@type': 'Organization',
              name: 'Holidays Hunt',
              logo: { '@type': 'ImageObject', url: `${origin}/holidayshunt-logo.png` },
            },
          },
        };
      }

      if (matchedPage) {
        const title = text(matchedPage.seo?.metaTitle || `${matchedPage.title} | Holidays Hunt`, 160);
        const description = text(matchedPage.seo?.metaDescription || matchedPage.subtitle || matchedPage.content, 300);
        const keywords = text(matchedPage.seo?.focusKeyword, 400);
        const ogTitle = text(matchedPage.seo?.ogTitle || title, 160);
        const ogDescription = text(matchedPage.seo?.ogDescription || description, 300);
        const canonicalUrl = `${origin}/page/${encodeURIComponent(matchedPage.slug || routeSeg)}`;
        const ogImage = toPublicWorkerImageUrl(matchedPage.seo?.ogImage || matchedPage.heroImage, origin);
        return {
          title,
          description,
          keywords,
          ogTitle,
          ogDescription,
          ogImage: ogImage || undefined,
          ogType: 'website',
          canonicalUrl,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description,
            url: canonicalUrl,
            ...(ogImage ? { primaryImageOfPage: ogImage, image: [ogImage] } : {}),
          },
        };
      }

      return null;
    };

    const injectSeoIntoHtml = async (htmlResponse: Response, reqUrl: URL): Promise<Response> => {
      try {
        const seo = await resolveDynamicPageSeo(reqUrl);
        if (!seo) return htmlResponse;

        let html = await htmlResponse.text();
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escHtml(seo.title)}</title>`);
        if (seo.description) {
          html = html.replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="description" content="${escHtml(seo.description)}" />`
          );
        }
        if (seo.keywords) {
          html = html.replace(
            /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="keywords" content="${escHtml(seo.keywords)}" />`
          );
        }
        html = html.replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
          `<link rel="canonical" href="${escHtml(seo.canonicalUrl)}" />`
        );
        html = html.replace(
          /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:type" content="${escHtml(seo.ogType || 'website')}" />`
        );
        html = html.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${escHtml(seo.ogTitle)}" />`
        );
        if (seo.ogDescription) {
          html = html.replace(
            /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:description" content="${escHtml(seo.ogDescription)}" />`
          );
        }
        html = html.replace(
          /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:url" content="${escHtml(seo.canonicalUrl)}" />`
        );
        html = html.replace(
          /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:title" content="${escHtml(seo.ogTitle)}" />`
        );
        if (seo.ogDescription) {
          html = html.replace(
            /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:description" content="${escHtml(seo.ogDescription)}" />`
          );
        }
        if (seo.ogImage) {
          html = html.replace(
            /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:image" content="${escHtml(seo.ogImage)}" />`
          );
          html = html.replace(
            /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:image:alt" content="${escHtml(seo.ogTitle)}" />`
          );
          html = html.replace(
            /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:image" content="${escHtml(seo.ogImage)}" />`
          );
        }

        const extraTags: string[] = [];
        extraTags.push(
          `<meta name="robots" content="${escHtml(seo.robots || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')}" />`
        );
        if (seo.ogImage) {
          extraTags.push(`<meta name="thumbnail" content="${escHtml(seo.ogImage)}" />`);
        }
        html = html.replace(/<\/head>/i, `    ${extraTags.join('\n    ')}\n  </head>`);

        if (seo.jsonLd) {
          const safeJson = JSON.stringify(seo.jsonLd).replace(/<\/script/gi, '<\\/script');
          if (/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i.test(html)) {
            html = html.replace(
              /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
              `<script type="application/ld+json">${safeJson}</script>`
            );
          } else {
            html = html.replace(/<\/head>/i, `    <script type="application/ld+json">${safeJson}</script>\n  </head>`);
          }
        }

        const headers = new Headers(htmlResponse.headers);
        headers.delete('content-length');
        headers.set('Cache-Control', 'no-cache');
        return new Response(html, { status: htmlResponse.status, headers });
      } catch (err) {
        console.error('SSR SEO injection notice:', err);
        return htmlResponse;
      }
    };

    try {
      let asset = await env.ASSETS.fetch(request);
      if (asset.status === 404) {
        asset = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }
      const contentType = asset.headers.get('content-type') || '';
      if ((request.method === 'GET' || request.method === 'HEAD') && contentType.includes('text/html')) {
        return await injectSeoIntoHtml(asset, url);
      }
      return asset;
    } catch {
      return new Response('Asset fetch error', { status: 500 });
    }
  }
};
