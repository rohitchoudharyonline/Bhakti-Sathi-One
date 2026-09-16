import { GoogleGenAI } from '@google/genai';

const text = (v: unknown, max = 2000) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
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

function decodePathSegments(pathname: string): string[] {
  const raw = pathname.replace(/^\/api\/files\/?/, '').replace(/^\/+/, '');
  const candidates = [raw];
  try { candidates.push(decodeURIComponent(raw)); } catch { /* keep raw candidate */ }
  return Array.from(new Set(candidates.map((value) => value.replace(/^\/+/, '').replace(/\/+/g, '/')))).filter(Boolean);
}

function contentTypeForKey(key: string): string | null {
  const ext = key.toLowerCase().split('?')[0].split('.').pop() || '';
  const types: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml', pdf: 'application/pdf' };
  return types[ext] || null;
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url), pathname = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders(env, request) });

    const cmsSecret = String(env.CMS_SESSION_SECRET || 'bhakti-bharat-yatra-cms-secret-session-key-32-chars-ok').trim();
    const defaultEmails = ['rohitchoudharyonline@gmail.com', 'holidayshunt@gmail.com', 'admin@example.com', 'staff@bhaktibharatyatra.com'];
    const cmsEmails = new Set([...defaultEmails, ...String(env.CMS_STAFF_EMAILS || '').split(',').map(text).map((x) => x.toLowerCase()).filter(Boolean)]);
    const cmsPassword = String(env.CMS_PASSWORD || 'HarHarMahadev@2026').trim();
    const cmsPin = String(env.CMS_PIN || '071224').trim();

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
          await env.DB.prepare('UPDATE users SET full_name=?,phone=?,metadata=?,updated_at=? WHERE email=?').bind(text(p.name,120),text(p.phone,40),metadata,new Date().toISOString(),email).run();
          return json({success:true},200,privateHeaders(env,request));
        }

        if(pathname.startsWith('/api/files/')&&request.method==='GET'){
          if(!env.BUCKET)return json({error:'Not found'},404,publicCacheHeaders(env,request));
          const keys = decodePathSegments(pathname);
          if(!keys.length || keys.some((key) => key.includes('..') || key.startsWith('/') || key.includes('\\'))){
            return json({error:'Invalid file key'},400,publicCacheHeaders(env,request));
          }
          let object: any = null;
          let resolvedKey = '';
          for (const key of keys) {
            const candidate = await env.BUCKET.get(key);
            if (candidate) { object = candidate; resolvedKey = key; break; }
          }
          if(!object)return json({error:'File not found'},404,publicCacheHeaders(env,request));
          const h=new Headers(publicCacheHeaders(env,request));
          object.writeHttpMetadata(h);
          if(!h.get('Content-Type')){
            const inferred = contentTypeForKey(resolvedKey);
            if(inferred)h.set('Content-Type',inferred);
          }
          h.set('ETag',object.httpEtag);
          h.set('Cache-Control','public, max-age=31536000, immutable');
          return new Response(object.body,{headers:h});
        }
        if(pathname==='/api/upload'&&request.method==='POST'){const e=await requireCms();if(!e||!env.BUCKET)return json({error:'Unauthorized.'},401,privateHeaders(env,request));const form=await request.formData(),file=form.get('file');if(!(file instanceof File))return json({error:'No file provided.'},400,privateHeaders(env,request));if(file.size>10*1024*1024)return json({error:'File too large.'},413,privateHeaders(env,request));const allowed=new Set(['image/jpeg','image/png','image/webp','image/avif','image/gif']);if(!allowed.has(file.type))return json({error:'Unsupported file type.'},415,privateHeaders(env,request));const name=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-150),key=`media/${crypto.randomUUID()}-${name}`;await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}});return json({success:true,r2_key:key,url:`/api/files/${encodeURIComponent(key)}`},201,privateHeaders(env,request));}
        if(pathname==='/api/notify-lead'&&request.method==='POST'){if(!env.DB)return json({error:'Database unavailable.'},503,privateHeaders(env,request));const b=await request.json().catch(()=>({})),name=text(b.name,120),phone=text(b.phone,40),pack=text(b.package,200);if(!name||!phone)return json({error:'Name and phone are required.'},400,privateHeaders(env,request));await env.DB.prepare('INSERT INTO leads (name,phone,package,created_at) VALUES (?,?,?,?)').bind(name,phone,pack,new Date().toISOString()).run();return json({success:true},201,publicHeaders(env,request));}
        if(['/api/generate-seo','/api/generate-guide-article','/api/generate-guide-faqs','/api/generate-guide-seo','/api/fetch-hotel-details'].includes(pathname)){const e=await requireCms();if(!e)return json({error:'Unauthorized.'},401,privateHeaders(env,request));const key=String(env.GEMINI_API_KEY||'');if(!key)return json({error:'AI service not configured.'},503,privateHeaders(env,request));const b=await request.json().catch(()=>({})),title=text(b.title||b.hotelName||'Sacred destination',300),ai=new GoogleGenAI({apiKey:key});const prompt=pathname==='/api/generate-seo'?`Generate concise SEO title and meta description for ${title}.`:`Create accurate editorial content for ${title}. Do not invent facts, ratings, reviews or amenities.`;const r=await ai.models.generateContent({model:'gemini-2.5-flash',contents:prompt});return json({success:true,result:r.text},200,privateHeaders(env,request));}

        return json({error:'API endpoint not found'},404,publicHeaders(env,request));
      } catch(e:any) { console.error('Worker error',e); return json({error:'Internal server error'},500,privateHeaders(env,request)); }
    }
    try{const asset=await env.ASSETS.fetch(request);if(asset.status!==404)return asset;return env.ASSETS.fetch(new Request(new URL('/',request.url),request));}catch{return new Response('Asset fetch error',{status:500});}
  }
};