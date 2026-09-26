import { GoogleGenAI } from '@google/genai';

const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
const APPROVED_DESTINATION_SLUGS = new Set(['jammu-kashmir']);
const PROTECTED_TOUR_SLUGS = new Set([
  'kashmir-pilgrimage-tour-package',
  '6-days-kashmir-honeymoon-package-srinagar-gulmarg-pahalgam',
  'kashmir-tour-package-5-nights-6-days',
  '5-days-kashmir-tour-itinerary',
]);

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

function getApprovedDestinationMap(value: unknown): Record<string, any> {
  const map = normalizeDestinationRegistry(value);
  return Object.fromEntries(
    Object.entries(map).filter(([slug, destination]) => APPROVED_DESTINATION_SLUGS.has(String(slug).toLowerCase()) && destination)
  );
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

    // Safely retrieve or generate random fallbacks for edge runtime
    const cmsSecret = (env.CMS_SESSION_SECRET && String(env.CMS_SESSION_SECRET).trim().length >= 32) 
      ? String(env.CMS_SESSION_SECRET).trim() 
      : crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''); // Generate 64 char random fallback

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

    if (pathname.startsWith('/api/')) {
      try {
        if (pathname === '/api/health') return json({ status: 'ok' }, 200, publicHeaders(env, request));

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
                map = getApprovedDestinationMap(typeof parsed.value === 'string' ? parsed.value : (parsed.value || {}));
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
                map = typeof parsed.value === 'string' ? JSON.parse(parsed.value) : (parsed.value || {});
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
              if (slug !== 'jammu-kashmir') {
                return json({ error: 'Only the Jammu & Kashmir destination is allowed.' }, 409, privateHeaders(env, request));
              }
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

                const isProtectedTour = (pkg: any) => PROTECTED_TOUR_SLUGS.has(String(pkg?.slug || '').trim().toLowerCase());
                const isDeleted = (pkg: any) => {
                  if (isProtectedTour(pkg)) return false;
                  const pkgId = String(pkg?.id || '').trim().toLowerCase();
                  const pkgSlug = String(pkg?.slug || '').trim().toLowerCase();
                  return (pkgId && deletedSet.has(pkgId)) || (pkgSlug && deletedSet.has(pkgSlug));
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
                      const incomingIds = new Set(incoming.map((pkg: any) => String(pkg?.id || '')));
                      const incomingSlugs = new Set(incoming.map((pkg: any) => String(pkg?.slug || '').trim().toLowerCase()));
                      const merged = [
                        ...incoming,
                        ...existingTours.filter((pkg: any) => {
                          const pkgId = String(pkg?.id || '').trim().toLowerCase();
                          const pkgSlug = String(pkg?.slug || '').trim().toLowerCase();
                          const id = String(pkg?.id || '');
                          return id &&
                            !isDeleted(pkg) &&
                            !incomingIds.has(id) &&
                            (!pkgSlug || !incomingSlugs.has(pkgSlug));
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
                // Himachal and Amritsar were intentionally deleted. Reject any stale
                // browser registry that still contains them so refresh/hydration can
                // never resurrect those destinations.
                if (incoming.has('himachal') || incoming.has('amritsar')) {
                  return json({ error: 'Deleted destinations cannot be restored.' }, 409, privateHeaders(env, request));
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
        if(pathname==='/api/notify-lead'&&request.method==='POST'){if(!env.DB)return json({error:'Database unavailable.'},503,privateHeaders(env,request));const b=await request.json().catch(()=>({})),name=text(b.name,120),phone=text(b.phone,40),pack=text(b.package,200);if(!name||!phone)return json({error:'Name and phone are required.'},400,privateHeaders(env,request));await env.DB.prepare('INSERT INTO leads (name,phone,package,created_at) VALUES (?,?,?,?)').bind(name,phone,pack,new Date().toISOString()).run();return json({success:true},201,publicHeaders(env,request));}
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
    try{const asset=await env.ASSETS.fetch(request);if(asset.status!==404)return asset;return env.ASSETS.fetch(new Request(new URL('/',request.url),request));}catch{return new Response('Asset fetch error',{status:500});}
  }
};
