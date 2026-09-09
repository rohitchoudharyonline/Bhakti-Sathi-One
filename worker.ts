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
function cookie(name: string, value: string, maxAge: number) { return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`; }

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
  const h: Record<string,string> = { 'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'SAMEORIGIN', 'Referrer-Policy':'strict-origin-when-cross-origin', 'Permissions-Policy':'camera=(), microphone=(), geolocation=()', 'Vary':'Origin' };
  if (configured && origin === configured) h['Access-Control-Allow-Origin'] = origin;
  h['Access-Control-Allow-Credentials'] = 'true'; h['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'; h['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  return h;
}
const privateHeaders = (env:any, request:Request) => ({ ...publicHeaders(env,request), 'Cache-Control':'private, no-store, max-age=0', 'Pragma':'no-cache' });
const publicCacheHeaders = (env:any, request:Request) => ({ ...publicHeaders(env,request), 'Cache-Control':'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400' });

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url), pathname = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: publicHeaders(env,request) });

    const cmsSecret = String(env.CMS_SESSION_SECRET || '').trim();
    const cmsEmails = new Set(String(env.CMS_STAFF_EMAILS || '').split(',').map(text).map(x=>x.toLowerCase()).filter(Boolean));
    const cmsPassword = String(env.CMS_PASSWORD || '');
    const cmsPin = String(env.CMS_PIN || '');
    const cmsToken = async () => verifyToken(cookies(request).bs_cms_session,cmsSecret);
    const requireCms = async () => { const e=await cmsToken(); return e && cmsEmails.has(e.toLowerCase()) ? e.toLowerCase() : null; };
    const requireUser = async () => verifyToken(cookies(request).bs_user_session,cmsSecret);

    if (pathname.startsWith('/api/')) {
      try {
        if (pathname === '/api/health') return json({status:'ok'},200,publicHeaders(env,request));

        if (pathname === '/api/admin/pin/verify' && request.method === 'POST') {
          if (!cmsPin || cmsPin.length < 6 || !cmsSecret || cmsSecret.length < 32) return json({error:'CMS authentication is not configured.'},503,privateHeaders(env,request));
          const b=await request.json().catch(()=>({})); if(String(b.pin||'')!==cmsPin) return json({success:false,error:'Invalid PIN.'},401,privateHeaders(env,request));
          const t=await signedToken('pin',cmsSecret,900); const h=new Headers(privateHeaders(env,request)); h.append('Set-Cookie',cookie('bs_cms_pin',t,900)); return json({success:true},200,h);
        }
        if (pathname === '/api/admin/pin/session') { const ok=!!(await verifyToken(cookies(request).bs_cms_pin,cmsSecret)); return json({verified:ok},ok?200:401,privateHeaders(env,request)); }
        if (pathname === '/api/auth/cms/login' && request.method === 'POST') {
          if(!cmsPassword||cmsPassword.length<12||!cmsSecret||cmsSecret.length<32)return json({error:'CMS authentication is not configured.'},503,privateHeaders(env,request));
          if(!(await verifyToken(cookies(request).bs_cms_pin,cmsSecret)))return json({error:'PIN verification required first.'},401,privateHeaders(env,request));
          const b=await request.json().catch(()=>({})); const email=text(b.email,160).toLowerCase(); const password=String(b.password||'');
          if(!cmsEmails.has(email)||password!==cmsPassword)return json({success:false,error:'Invalid credentials.'},401,privateHeaders(env,request));
          const t=await signedToken(email,cmsSecret); const h=new Headers(privateHeaders(env,request)); h.append('Set-Cookie',cookie('bs_cms_session',t,28800)); return json({success:true,authorized:true,user:{email,role:'super_admin'}},200,h);
        }
        if (pathname === '/api/auth/cms/session' || pathname === '/api/auth/cms') { const email=await requireCms(); return json(email?{authorized:true,user:{email,role:'super_admin'}}:{authorized:false},email?200:401,privateHeaders(env,request)); }
        if (pathname === '/api/admin/logout' && request.method === 'POST') { const h=new Headers(privateHeaders(env,request)); for(const n of ['bs_cms_session','bs_cms_pin','bs_user_session'])h.append('Set-Cookie',cookie(n,'',0)); return json({success:true},200,h); }
        if (pathname === '/api/admin/unblock-all' && request.method === 'POST') { const e=await requireCms(); if(!e||!env.DB)return json({error:'Unauthorized.'},401,privateHeaders(env,request)); await env.DB.prepare('DELETE FROM ip_blocks').run(); return json({success:true},200,privateHeaders(env,request)); }

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

        if (pathname === '/api/contents' || pathname.startsWith('/api/contents/')) {
          if(request.method==='GET'&&env.DB){const parts=pathname.replace('/api/contents','').replace(/^\/+/,'').split('/');let rows:any[]=[];if(!parts[0]){const type=text(url.searchParams.get('type'),80);const q=type?await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE status=? AND content_type=? ORDER BY updated_at DESC LIMIT 200').bind('published',type).all():await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE status=? ORDER BY updated_at DESC LIMIT 200').bind('published').all();rows=q.results||[];}else{const key=text(parts[1]||parts[0],300);const q=parts[0]==='slug'?await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE slug=? AND status=?').bind(key,'published').all():await env.DB.prepare('SELECT id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at FROM contents WHERE id=? AND status=?').bind(key,'published').all();rows=q.results||[];if(!rows.length)return json({error:'Content not found'},404,publicCacheHeaders(env,request));}for(const r of rows){try{r.structured_content=r.structured_content?JSON.parse(r.structured_content):null;}catch{r.structured_content=null;}}return json({success:true,data:parts[0]?rows[0]:rows},200,publicCacheHeaders(env,request));}
          if(['POST','PUT','DELETE'].includes(request.method)){const e=await requireCms();if(!e||!env.DB)return json({error:'Unauthorized.'},401,privateHeaders(env,request));if(request.method==='DELETE'){const id=text(pathname.split('/').pop(),100);await env.DB.prepare('DELETE FROM contents WHERE id=?').bind(id).run();return json({success:true},200,privateHeaders(env,request));}const b=await request.json().catch(()=>({})),id=text(b.id||`content-${crypto.randomUUID()}`,100),title=text(b.title,300);if(!title)return json({error:'Title required.'},400,privateHeaders(env,request));const slug=text(b.slug||title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),200),now=new Date().toISOString();await env.DB.prepare('INSERT INTO contents (id,content_type,title,slug,subtitle,summary,body,structured_content,seo_title,seo_description,seo_keywords,status,media,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET content_type=excluded.content_type,title=excluded.title,slug=excluded.slug,subtitle=excluded.subtitle,summary=excluded.summary,body=excluded.body,structured_content=excluded.structured_content,seo_title=excluded.seo_title,seo_description=excluded.seo_description,seo_keywords=excluded.seo_keywords,status=excluded.status,media=excluded.media,updated_at=excluded.updated_at').bind(id,text(b.content_type,80)||'tour',title,slug,text(b.subtitle,500),text(b.summary,3000),text(b.body,50000),typeof b.structured_content==='object'?JSON.stringify(b.structured_content):null,text(b.seo_title,200),text(b.seo_description,500),text(b.seo_keywords,500),['published','draft','archived'].includes(b.status)?b.status:'draft',typeof b.media==='object'?JSON.stringify(b.media):null,now,now).run();return json({success:true,id,slug},200,privateHeaders(env,request));}
        }

        if(pathname.startsWith('/api/files/')&&request.method==='GET'){if(!env.BUCKET)return json({error:'Not found'},404,publicCacheHeaders(env,request));const key=decodeURIComponent(pathname.replace('/api/files/',''));if(!key||key.includes('..')||key.startsWith('/'))return json({error:'Invalid file key'},400,publicCacheHeaders(env,request));const object=await env.BUCKET.get(key);if(!object)return json({error:'File not found'},404,publicCacheHeaders(env,request));const h=new Headers(publicCacheHeaders(env,request));object.writeHttpMetadata(h);h.set('ETag',object.httpEtag);h.set('Cache-Control','public, max-age=31536000, immutable');return new Response(object.body,{headers:h});}
        if(pathname==='/api/upload'&&request.method==='POST'){const e=await requireCms();if(!e||!env.BUCKET)return json({error:'Unauthorized.'},401,privateHeaders(env,request));const form=await request.formData(),file=form.get('file');if(!(file instanceof File))return json({error:'No file provided.'},400,privateHeaders(env,request));if(file.size>10*1024*1024)return json({error:'File too large.'},413,privateHeaders(env,request));const allowed=new Set(['image/jpeg','image/png','image/webp','image/avif','image/gif']);if(!allowed.has(file.type))return json({error:'Unsupported file type.'},415,privateHeaders(env,request));const name=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-150),key=`media/${crypto.randomUUID()}-${name}`;await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type,cacheControl:'public, max-age=31536000, immutable'}});return json({success:true,r2_key:key,url:`/api/files/${encodeURIComponent(key)}`},201,privateHeaders(env,request));}
        if(pathname==='/api/notify-lead'&&request.method==='POST'){if(!env.DB)return json({error:'Database unavailable.'},503,privateHeaders(env,request));const b=await request.json().catch(()=>({})),name=text(b.name,120),phone=text(b.phone,40),pack=text(b.package,200);if(!name||!phone)return json({error:'Name and phone are required.'},400,privateHeaders(env,request));await env.DB.prepare('INSERT INTO leads (name,phone,package,created_at) VALUES (?,?,?,?)').bind(name,phone,pack,new Date().toISOString()).run();return json({success:true},201,publicHeaders(env,request));}
        if(['/api/generate-seo','/api/generate-guide-article','/api/generate-guide-faqs','/api/generate-guide-seo','/api/fetch-hotel-details'].includes(pathname)){const e=await requireCms();if(!e)return json({error:'Unauthorized.'},401,privateHeaders(env,request));const key=String(env.GEMINI_API_KEY||'');if(!key)return json({error:'AI service not configured.'},503,privateHeaders(env,request));const b=await request.json().catch(()=>({})),title=text(b.title||b.hotelName||'Sacred destination',300),ai=new GoogleGenAI({apiKey:key});const prompt=pathname==='/api/generate-seo'?`Generate concise SEO title and meta description for ${title}.`:`Create accurate editorial content for ${title}. Do not invent facts, ratings, reviews or amenities.`;const r=await ai.models.generateContent({model:'gemini-2.5-flash',contents:prompt});return json({success:true,result:r.text},200,privateHeaders(env,request));}

        return json({error:'API endpoint not found'},404,publicHeaders(env,request));
      } catch(e:any) { console.error('Worker error',e); return json({error:'Internal server error'},500,privateHeaders(env,request)); }
    }
    try{const asset=await env.ASSETS.fetch(request);if(asset.status!==404)return asset;return env.ASSETS.fetch(new Request(new URL('/',request.url),request));}catch{return new Response('Asset fetch error',{status:500});}
  }
};
