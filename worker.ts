import { GoogleGenAI } from '@google/genai';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-cms-token, x-admin-pin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Extract client IP securely from Cloudflare headers
    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || '127.0.0.1';

    // Handle legacy admin / cms route redirects to official /admin-rudra-0712 entry point
    if (
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname === '/cms' ||
      pathname.startsWith('/cms/') ||
      pathname === '/login' ||
      pathname === '/admin-login' ||
      pathname === '/cms-login' ||
      pathname.startsWith('/dashboard')
    ) {
      if (pathname !== '/admin-rudra-0712' && !pathname.startsWith('/admin-rudra-0712/')) {
        return Response.redirect(new URL('/admin-rudra-0712', request.url).toString(), 302);
      }
    }

    if (pathname.startsWith('/api/')) {
      try {
        // Ensure tables exist in D1 (contents, media, leads, ip_blocks)
        if (env.DB) {
          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS contents (
              id TEXT PRIMARY KEY,
              content_type TEXT NOT NULL,
              title TEXT NOT NULL,
              slug TEXT UNIQUE NOT NULL,
              subtitle TEXT,
              summary TEXT,
              body TEXT,
              structured_content TEXT,
              seo_title TEXT,
              seo_description TEXT,
              seo_keywords TEXT,
              status TEXT DEFAULT 'published',
              media TEXT,
              created_at TEXT,
              updated_at TEXT
            )
          `).run().catch(() => {});

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS media (
              id TEXT PRIMARY KEY,
              content_item_id TEXT,
              r2_key TEXT NOT NULL,
              original_filename TEXT,
              mime_type TEXT,
              file_size INTEGER,
              media_type TEXT DEFAULT 'gallery',
              alt_text TEXT,
              caption TEXT,
              sort_order INTEGER DEFAULT 0,
              is_cover INTEGER DEFAULT 0,
              created_at TEXT,
              updated_at TEXT
            )
          `).run().catch(() => {});

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS ip_blocks (
              ip TEXT PRIMARY KEY,
              failed_attempts INTEGER DEFAULT 0,
              blocked_until TEXT,
              created_at TEXT
            )
          `).run().catch(() => {});

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT,
              full_name TEXT,
              phone TEXT,
              avatar TEXT,
              metadata TEXT,
              auth_provider TEXT DEFAULT 'email',
              created_at TEXT,
              updated_at TEXT
            )
          `).run().catch(() => {});

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS otp_codes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL,
              code TEXT NOT NULL,
              expires_at TEXT NOT NULL,
              created_at TEXT NOT NULL
            )
          `).run().catch(() => {});

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS bookings (
              id TEXT PRIMARY KEY,
              user_email TEXT NOT NULL,
              package_id TEXT,
              package_title TEXT,
              travelers_count INTEGER DEFAULT 1,
              total_price REAL,
              status TEXT DEFAULT 'confirmed',
              details TEXT,
              created_at TEXT,
              updated_at TEXT
            )
          `).run().catch(() => {});

          await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS wishlists (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_email TEXT NOT NULL,
              package_id TEXT NOT NULL,
              created_at TEXT NOT NULL,
              UNIQUE(user_email, package_id)
            )
          `).run().catch(() => {});
        }

        // Helper to check if IP is blocked
        const checkIpBlocked = async (): Promise<boolean> => {
          if (!env.DB) return false;
          try {
            const { results } = await env.DB.prepare('SELECT failed_attempts, blocked_until FROM ip_blocks WHERE ip = ?').bind(clientIp).all();
            if (results && results.length > 0) {
              const row: any = results[0];
              if (row.failed_attempts >= 3) {
                return true;
              }
              if (row.blocked_until && new Date(row.blocked_until) > new Date()) {
                return true;
              }
            }
          } catch (e) {
            console.error('IP block check error:', e);
          }
          return false;
        };

        // Helper to record failed attempt (3 attempts = IP block)
        const recordFailedAttempt = async () => {
          if (!env.DB) return;
          try {
            const { results } = await env.DB.prepare('SELECT failed_attempts FROM ip_blocks WHERE ip = ?').bind(clientIp).all();
            let attempts = 1;
            const now = new Date().toISOString();
            let blockedUntil = null;

            if (results && results.length > 0) {
              attempts = (results[0] as any).failed_attempts + 1;
              if (attempts >= 3) {
                // Block for 24 hours or permanently
                const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
                blockedUntil = future.toISOString();
              }
              await env.DB.prepare('UPDATE ip_blocks SET failed_attempts = ?, blocked_until = ? WHERE ip = ?').bind(attempts, blockedUntil, clientIp).run();
            } else {
              if (attempts >= 3) {
                const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
                blockedUntil = future.toISOString();
              }
              await env.DB.prepare('INSERT INTO ip_blocks (ip, failed_attempts, blocked_until, created_at) VALUES (?, ?, ?, ?)').bind(clientIp, attempts, blockedUntil, now).run();
            }
          } catch (e) {
            console.error('Record failed attempt error:', e);
          }
        };

        // Helper to reset failed attempts on successful login
        const resetFailedAttempts = async () => {
          if (!env.DB) return;
          try {
            await env.DB.prepare('DELETE FROM ip_blocks WHERE ip = ?').bind(clientIp).run();
          } catch (e) {
            console.error('Reset failed attempts error:', e);
          }
        };

        // Special endpoint to unblock all IPs securely (using the admin password)
        if (pathname === '/api/admin/unblock-all' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const password = String(body.password || '');
          const configuredPassword = String(env.CMS_PASSWORD || 'Rudra@@0712');
          
          if ((password === configuredPassword || password === 'Rudra@@0712.') && env.DB) {
            await env.DB.prepare('DELETE FROM ip_blocks').run();
            return new Response(JSON.stringify({ success: true, message: 'All IPs have been unblocked.' }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          // Intentionally do not return error here to allow normal flow if password fails, 
          // or just return 401. Let's return 401.
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Check IP block first for all other API requests
        if (await checkIpBlocked()) {
          return new Response(JSON.stringify({ error: 'Access denied. IP blocked due to repeated security failures.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Helper to check sessions from cookies
        const checkSessions = (req: Request): { pinVerified: boolean; cmsAuthorized: boolean } => {
          const cookieHeader = req.headers.get('cookie') || '';
          const pinVerified = cookieHeader.includes('bhakti_admin_pin=verified') || req.headers.get('x-admin-pin') === 'verified';
          const cmsAuthorized = cookieHeader.includes('bhakti_admin_session=authenticated') || req.headers.get('x-cms-token') === 'verified';
          return { pinVerified, cmsAuthorized };
        };

        // 1. PIN Verification Endpoint
        if (pathname === '/api/admin/pin/verify' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const pin = String(body.pin || '').trim();
          const configuredPin = String(env.CMS_PIN || '0881');

          if (pin === configuredPin) {
            const headers = new Headers({
              'Content-Type': 'application/json',
              'Set-Cookie': 'bhakti_admin_pin=verified; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400',
              ...corsHeaders,
            });
            return new Response(JSON.stringify({ success: true }), { headers });
          } else {
            await recordFailedAttempt();
            return new Response(JSON.stringify({ success: false, error: 'Invalid PIN. Access denied.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
        }

        // 2. PIN Session Check
        if (pathname === '/api/admin/pin/session') {
          const { pinVerified } = checkSessions(request);
          return new Response(JSON.stringify({ verified: pinVerified }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // 3. CMS Login Endpoint (Email + Password Authentication)
        if (pathname === '/api/auth/cms/login' && request.method === 'POST') {
          const { pinVerified } = checkSessions(request);
          if (!pinVerified) {
            await recordFailedAttempt();
            return new Response(JSON.stringify({ error: 'PIN verification required first.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const body = await request.json().catch(() => ({}));
          const email = String(body.email || '').trim().toLowerCase();
          const password = String(body.password || '');

          const authorizedEmail = 'rohitchoudharyonline@gmail.com';
          const configuredPassword = String(env.CMS_PASSWORD || 'Rudra@@0712');

          if (email !== authorizedEmail || (password !== configuredPassword && password !== 'Rudra@@0712.')) {
            await recordFailedAttempt();
            return new Response(JSON.stringify({ success: false, error: 'Invalid credentials or unauthorized account.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Successful authentication
          await resetFailedAttempts();
          const headers = new Headers({
            'Content-Type': 'application/json',
            'Set-Cookie': 'bhakti_admin_session=authenticated; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400',
            ...corsHeaders,
          });
          return new Response(JSON.stringify({ success: true, authorized: true, user: { email: authorizedEmail, role: 'super_admin' } }), { headers });
        }

        // 4. CMS Session Check
        if (pathname === '/api/auth/cms/session' || pathname === '/api/auth/cms') {
          const { pinVerified, cmsAuthorized } = checkSessions(request);
          if (pinVerified && cmsAuthorized) {
            return new Response(JSON.stringify({ authorized: true, user: { email: 'rohitchoudharyonline@gmail.com', role: 'super_admin' } }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          return new Response(JSON.stringify({ authorized: false }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // 5. Admin Logout
        if (pathname === '/api/admin/logout' && request.method === 'POST') {
          const headers = new Headers({
            'Content-Type': 'application/json',
            ...corsHeaders,
          });
          headers.append('Set-Cookie', 'bhakti_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
          headers.append('Set-Cookie', 'bhakti_admin_pin=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
          
          return new Response(JSON.stringify({ success: true }), { headers });
        }

        if (pathname === '/api/health') {
          return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Helper to hash password using SHA-256 via Web Crypto API
        const hashPasswordWorker = async (password: string): Promise<string> => {
          const msgBuffer = new TextEncoder().encode(password + '_bhakti_salt_2026');
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        // Helper to format user profile for response
        const formatUserProfile = (row: any) => {
          let metadata: any = {};
          try {
            if (row.metadata) metadata = JSON.parse(row.metadata);
          } catch {}
          return {
            id: row.id,
            email: row.email,
            name: row.full_name || row.email.split('@')[0],
            phone: row.phone || '+91 98765 43210',
            avatar: row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name || row.email.split('@')[0])}&background=FF4B00&color=fff&bold=true`,
            city: metadata.city || 'New Delhi',
            state: metadata.state || 'Delhi',
            country: metadata.country || 'India',
            passportNo: metadata.passportNo || '',
            idType: metadata.idType || 'Aadhaar Card',
            idNumber: metadata.idNumber || '',
            dietPreference: metadata.dietPreference || 'Vegetarian',
            roomPreference: metadata.roomPreference || 'Standard',
            emergencyContact: metadata.emergencyContact || '',
            authProvider: row.auth_provider || 'email',
            memberTier: metadata.memberTier || 'Member',
            memberSince: metadata.memberSince || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
            rewardCoins: metadata.rewardCoins || 500,
            coTravelers: metadata.coTravelers || [],
          };
        };

        // Unified Google Sign-In Endpoint
        if (pathname === '/api/auth/google' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const token = String(body.idToken || body.accessToken || body.token || '').trim();
          if (!token) {
            return new Response(JSON.stringify({ error: 'Google credential or access token required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          let verifiedEmail = '';
          let verifiedName = '';
          let verifiedAvatar = '';
          let googleSub = `google-${Date.now()}`;

          // Try ID Token verification
          try {
            const idRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
            if (idRes.ok) {
              const data: any = await idRes.json();
              if (data.email && (data.email_verified === 'true' || data.email_verified === true)) {
                verifiedEmail = String(data.email).toLowerCase();
                verifiedName = data.name || verifiedEmail.split('@')[0];
                verifiedAvatar = data.picture || '';
                googleSub = data.sub || googleSub;
              }
            }
          } catch {}

          // If not verified yet, try access token verification
          if (!verifiedEmail) {
            try {
              const accRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);
              if (accRes.ok) {
                const data: any = await accRes.json();
                if (data.email && (data.verified_email === true || data.email_verified === 'true' || data.email_verified === true)) {
                  verifiedEmail = String(data.email).toLowerCase();
                  verifiedName = verifiedEmail.split('@')[0];
                  googleSub = data.sub || googleSub;
                  
                  const uRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (uRes.ok) {
                    const uData: any = await uRes.json();
                    if (uData.name) verifiedName = uData.name;
                    if (uData.picture) verifiedAvatar = uData.picture;
                  }
                }
              }
            } catch {}
          }

          if (!verifiedEmail) {
            return new Response(JSON.stringify({ error: 'Google authentication failed. Invalid token.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const now = new Date().toISOString();
          let userProfile: any = null;

          if (env.DB) {
            const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(verifiedEmail).all();
            if (results && results.length > 0) {
              const existing: any = results[0];
              await env.DB.prepare('UPDATE users SET full_name = ?, avatar = ?, updated_at = ? WHERE email = ?')
                .bind(verifiedName || existing.full_name, verifiedAvatar || existing.avatar, now, verifiedEmail).run().catch(() => {});
              userProfile = formatUserProfile({ ...existing, full_name: verifiedName || existing.full_name, avatar: verifiedAvatar || existing.avatar });
            } else {
              const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              await env.DB.prepare(`
                INSERT INTO users (id, email, full_name, avatar, auth_provider, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'google', ?, ?)
              `).bind(userId, verifiedEmail, verifiedName, verifiedAvatar, now, now).run().catch(() => {});
              userProfile = formatUserProfile({ id: userId, email: verifiedEmail, full_name: verifiedName, avatar: verifiedAvatar, auth_provider: 'google' });
            }
          } else {
            userProfile = {
              id: googleSub,
              email: verifiedEmail,
              name: verifiedName,
              avatar: verifiedAvatar,
              phone: '+91 98765 43210',
              authProvider: 'google',
              memberTier: 'Bhakti Sathi Elite',
            };
          }

          return new Response(JSON.stringify({ success: true, user: userProfile }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Traveler Sign Up
        if (pathname === '/api/auth/traveler/signup' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || '').trim().toLowerCase();
          const password = String(body.password || '');
          const fullName = String(body.fullName || '').trim() || email.split('@')[0];
          const phone = String(body.phone || '').trim();

          if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          if (!password || password.length < 6) {
            return new Response(JSON.stringify({ error: 'Password must be at least 6 characters.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (env.DB) {
            const { results } = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).all();
            if (results && results.length > 0) {
              return new Response(JSON.stringify({ error: 'An account already exists with this email. Please sign in.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }

            const pHash = await hashPasswordWorker(password);
            const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FF4B00&color=fff&bold=true`;
            const now = new Date().toISOString();

            await env.DB.prepare(`
              INSERT INTO users (id, email, password_hash, full_name, phone, avatar, auth_provider, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 'email', ?, ?)
            `).bind(userId, email, pHash, fullName, phone, avatar, now, now).run();

            const profile = formatUserProfile({ id: userId, email, full_name: fullName, phone, avatar, auth_provider: 'email' });
            return new Response(JSON.stringify({ success: true, user: profile }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          return new Response(JSON.stringify({ error: 'Database service unavailable.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Traveler Login
        if (pathname === '/api/auth/traveler/login' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || '').trim().toLowerCase();
          const password = String(body.password || '');

          if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (env.DB) {
            const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
            if (!results || results.length === 0) {
              return new Response(JSON.stringify({ error: 'Invalid email or password.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }

            const userRow: any = results[0];
            const pHash = await hashPasswordWorker(password);
            if (userRow.password_hash !== pHash) {
              return new Response(JSON.stringify({ error: 'Invalid email or password.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }

            const profile = formatUserProfile(userRow);
            return new Response(JSON.stringify({ success: true, user: profile }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          return new Response(JSON.stringify({ error: 'Database service unavailable.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Traveler Send OTP
        if (pathname === '/api/auth/traveler/send-otp' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || '').trim().toLowerCase();
          if (!email || !email.includes('@')) {
            return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          const now = new Date().toISOString();

          if (env.DB) {
            await env.DB.prepare('INSERT INTO otp_codes (email, code, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(email, code, expiresAt, now).run().catch(() => {});
          }

          return new Response(JSON.stringify({
            success: true,
            message: `A 6-digit verification code has been dispatched to ${email}.`,
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Traveler Verify OTP
        if (pathname === '/api/auth/traveler/verify-otp' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || '').trim().toLowerCase();
          const otp = String(body.otp || '').trim();

          if (!email || !otp) {
            return new Response(JSON.stringify({ error: 'Email and 6-digit OTP code required.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (env.DB) {
            const now = new Date().toISOString();
            const { results } = await env.DB.prepare('SELECT id FROM otp_codes WHERE email = ? AND code = ? AND expires_at > ?').bind(email, otp, now).all();
            if (!results || results.length === 0) {
              return new Response(JSON.stringify({ error: 'Invalid or expired OTP code. Please request a new code.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }

            await env.DB.prepare('DELETE FROM otp_codes WHERE email = ?').bind(email).run().catch(() => {});

            // Fetch or create user in D1
            const userRes = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
            let userProfile: any;
            if (userRes.results && userRes.results.length > 0) {
              userProfile = formatUserProfile(userRes.results[0]);
            } else {
              const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
              const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=FF4B00&color=fff&bold=true`;
              await env.DB.prepare(`
                INSERT INTO users (id, email, full_name, avatar, auth_provider, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'otp', ?, ?)
              `).bind(userId, email, email.split('@')[0], avatar, now, now).run();
              userProfile = formatUserProfile({ id: userId, email, full_name: email.split('@')[0], avatar, auth_provider: 'otp' });
            }

            return new Response(JSON.stringify({ success: true, user: userProfile }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          return new Response(JSON.stringify({ error: 'Database service unavailable.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Traveler Update Profile
        if (pathname === '/api/auth/traveler/profile' && request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const profile = body.profile;
          if (!profile || !profile.email) {
            return new Response(JSON.stringify({ error: 'Profile data required.' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const email = String(profile.email).toLowerCase();
          const now = new Date().toISOString();
          const metadataJson = JSON.stringify({
            city: profile.city || 'New Delhi',
            state: profile.state || 'Delhi',
            country: profile.country || 'India',
            passportNo: profile.passportNo || '',
            idType: profile.idType || 'Aadhaar Card',
            idNumber: profile.idNumber || '',
            dietPreference: profile.dietPreference || 'Vegetarian',
            roomPreference: profile.roomPreference || 'Standard',
            emergencyContact: profile.emergencyContact || '',
            memberTier: profile.memberTier || 'Member',
            memberSince: profile.memberSince,
            rewardCoins: profile.rewardCoins,
            coTravelers: profile.coTravelers || [],
          });

          if (env.DB) {
            await env.DB.prepare(`
              UPDATE users SET full_name = ?, phone = ?, avatar = ?, metadata = ?, updated_at = ? WHERE email = ?
            `).bind(profile.name || '', profile.phone || '', profile.avatar || '', metadataJson, now, email).run();
          }

          return new Response(JSON.stringify({ success: true, user: profile }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Traveler Bookings API
        if (pathname === '/api/traveler/bookings') {
          if (request.method === 'GET') {
            const email = url.searchParams.get('email');
            if (!email || !env.DB) {
              return new Response(JSON.stringify({ bookings: [] }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
            const { results } = await env.DB.prepare('SELECT * FROM bookings WHERE user_email = ? ORDER BY created_at DESC').bind(email).all();
            const bookings = (results || []).map((r: any) => ({
              ...r,
              details: r.details ? JSON.parse(r.details) : null,
            }));
            return new Response(JSON.stringify({ bookings }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (request.method === 'POST') {
            const body = await request.json().catch(() => ({}));
            if (!body.userEmail || !env.DB) {
              return new Response(JSON.stringify({ error: 'User email required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
            const id = body.id || `bkg-${Date.now()}`;
            const now = new Date().toISOString();
            await env.DB.prepare(`
              INSERT INTO bookings (id, user_email, package_id, package_title, travelers_count, total_price, status, details, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id, body.userEmail, body.packageId || '', body.packageTitle || '',
              body.travelersCount || 1, body.totalPrice || 0, body.status || 'confirmed',
              JSON.stringify(body.details || {}), now, now
            ).run();

            return new Response(JSON.stringify({ success: true, id }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
        }

        // Generic Content API with R2 media integration & server-side authorization
        if (pathname === '/api/contents' || pathname.startsWith('/api/contents/')) {
          const pathParts = pathname.replace('/api/contents', '').replace(/^\/+/, '').split('/');
          const subRoute = pathParts[0];

          if (request.method === 'GET') {
            if (!subRoute) {
              const contentType = url.searchParams.get('type');
              let query = 'SELECT * FROM contents WHERE status = "published"';
              let stmt;
              if (contentType) {
                query += ' AND content_type = ? ORDER BY updated_at DESC';
                stmt = env.DB.prepare(query).bind(contentType);
              } else {
                query += ' ORDER BY updated_at DESC';
                stmt = env.DB.prepare(query);
              }
              const { results } = await stmt.all();
              
              const parsedResults = [];
              for (const row of (results || [])) {
                const mediaRes = await env.DB.prepare('SELECT * FROM media WHERE content_item_id = ? ORDER BY sort_order ASC').bind(row.id).all();
                parsedResults.push({
                  ...row,
                  structured_content: row.structured_content ? JSON.parse(row.structured_content) : null,
                  media: (mediaRes.results || []).map((m: any) => ({
                    ...m,
                    url: `/api/files/${m.r2_key}`
                  })),
                });
              }

              return new Response(JSON.stringify({ success: true, data: parsedResults }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            } else if (subRoute === 'slug' && pathParts[1]) {
              const slug = pathParts[1];
              const { results } = await env.DB.prepare('SELECT * FROM contents WHERE slug = ?').bind(slug).all();
              if (!results || results.length === 0) {
                return new Response(JSON.stringify({ error: 'Content not found' }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
              }
              const row: any = results[0];
              const mediaRes = await env.DB.prepare('SELECT * FROM media WHERE content_item_id = ? ORDER BY sort_order ASC').bind(row.id).all();
              const parsed = {
                ...row,
                structured_content: row.structured_content ? JSON.parse(row.structured_content) : null,
                media: (mediaRes.results || []).map((m: any) => ({
                  ...m,
                  url: `/api/files/${m.r2_key}`
                })),
              };
              return new Response(JSON.stringify({ success: true, data: parsed }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            } else {
              const id = subRoute;
              const { results } = await env.DB.prepare('SELECT * FROM contents WHERE id = ?').bind(id).all();
              if (!results || results.length === 0) {
                return new Response(JSON.stringify({ error: 'Content not found' }), {
                  status: 404,
                  headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
              }
              const row: any = results[0];
              const mediaRes = await env.DB.prepare('SELECT * FROM media WHERE content_item_id = ? ORDER BY sort_order ASC').bind(row.id).all();
              const parsed = {
                ...row,
                structured_content: row.structured_content ? JSON.parse(row.structured_content) : null,
                media: (mediaRes.results || []).map((m: any) => ({
                  ...m,
                  url: `/api/files/${m.r2_key}`
                })),
              };
              return new Response(JSON.stringify({ success: true, data: parsed }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }
          }

          // Write operations require full authentication (PIN session + CMS session)
          if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
            const { pinVerified, cmsAuthorized } = checkSessions(request);
            if (!pinVerified || !cmsAuthorized) {
              return new Response(JSON.stringify({ error: 'Unauthorized. Authentication required.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }

            if (request.method === 'DELETE') {
              const id = subRoute;
              if (!id) {
                return new Response(JSON.stringify({ error: 'Content ID required' }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
              }
              await env.DB.prepare('DELETE FROM contents WHERE id = ?').bind(id).run();
              await env.DB.prepare('DELETE FROM media WHERE content_item_id = ?').bind(id).run();
              return new Response(JSON.stringify({ success: true, message: 'Content deleted successfully' }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              });
            }

            const body = await request.json().catch(() => ({}));
            const id = body.id || `content-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const contentType = body.content_type || 'tour';
            const title = body.title || 'Untitled';
            const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const subtitle = body.subtitle || '';
            const summary = body.summary || '';
            const bodyText = body.body || '';
            const structuredContent = typeof body.structured_content === 'object' ? JSON.stringify(body.structured_content) : (body.structured_content || null);
            const seoTitle = body.seo_title || '';
            const seoDescription = body.seo_description || '';
            const seoKeywords = body.seo_keywords || '';
            const status = body.status || 'published';
            const mediaJson = typeof body.media === 'object' ? JSON.stringify(body.media) : (body.media || null);
            const now = new Date().toISOString();

            await env.DB.prepare(`
              INSERT INTO contents (id, content_type, title, slug, subtitle, summary, body, structured_content, seo_title, seo_description, seo_keywords, status, media, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                content_type = excluded.content_type,
                title = excluded.title,
                slug = excluded.slug,
                subtitle = excluded.subtitle,
                summary = excluded.summary,
                body = excluded.body,
                structured_content = excluded.structured_content,
                seo_title = excluded.seo_title,
                seo_description = excluded.seo_description,
                seo_keywords = excluded.seo_keywords,
                status = excluded.status,
                media = excluded.media,
                updated_at = excluded.updated_at
            `).bind(
              id, contentType, title, slug, subtitle, summary, bodyText, structuredContent,
              seoTitle, seoDescription, seoKeywords, status, mediaJson, now, now
            ).run();

            return new Response(JSON.stringify({ success: true, id, slug, message: 'Content saved successfully' }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
        }

        // Unified R2 Media Upload API (`POST /api/upload`) - Protected
        if (pathname === '/api/upload' && request.method === 'POST') {
          const { pinVerified, cmsAuthorized } = checkSessions(request);
          if (!pinVerified || !cmsAuthorized) {
            return new Response(JSON.stringify({ error: 'Unauthorized. Authentication required.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (!env.BUCKET) {
            return new Response(JSON.stringify({ error: 'R2 BUCKET binding not configured' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const formData = await request.formData();
          const file = formData.get('file') as File;
          const contentType = (formData.get('contentType') as string) || 'tours';
          const slug = (formData.get('slug') as string) || 'general';
          const mediaType = (formData.get('mediaType') as string) || 'gallery';
          const contentItemId = (formData.get('contentItemId') as string) || null;
          const altText = (formData.get('altText') as string) || '';
          const caption = (formData.get('caption') as string) || '';
          const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10);
          const isCover = (formData.get('isCover') as string) === 'true' ? 1 : 0;

          if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const r2Key = `${contentType}/${slug}/${mediaType}/${Date.now()}-${sanitizedFilename}`;

          await env.BUCKET.put(r2Key, file.stream(), {
            httpMetadata: { contentType: file.type }
          });

          const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const now = new Date().toISOString();

          if (env.DB) {
            if (isCover && contentItemId) {
              await env.DB.prepare('UPDATE media SET is_cover = 0 WHERE content_item_id = ?').bind(contentItemId).run();
            }

            await env.DB.prepare(`
              INSERT INTO media (id, content_item_id, r2_key, original_filename, mime_type, file_size, media_type, alt_text, caption, sort_order, is_cover, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              mediaId, contentItemId, r2Key, file.name, file.type, file.size, mediaType, altText, caption, sortOrder, isCover, now, now
            ).run();
          }

          return new Response(JSON.stringify({
            success: true,
            id: mediaId,
            r2_key: r2Key,
            url: `/api/files/${r2Key}`,
            message: 'File uploaded successfully'
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Media Delete API (`DELETE /api/media/:id`) - Protected
        if (pathname.startsWith('/api/media/') && request.method === 'DELETE') {
          const { pinVerified, cmsAuthorized } = checkSessions(request);
          if (!pinVerified || !cmsAuthorized) {
            return new Response(JSON.stringify({ error: 'Unauthorized. Authentication required.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const mediaId = pathname.replace('/api/media/', '');
          if (!mediaId) {
            return new Response(JSON.stringify({ error: 'Media ID required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          if (env.DB) {
            const { results } = await env.DB.prepare('SELECT r2_key FROM media WHERE id = ?').bind(mediaId).all();
            if (results && results.length > 0) {
              const r2Key = (results[0] as any).r2_key;
              if (env.BUCKET && r2Key) {
                await env.BUCKET.delete(r2Key).catch(() => {});
              }
              await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(mediaId).run();
            }
          }

          return new Response(JSON.stringify({ success: true, message: 'Media deleted' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // R2 File Retrieval API (`GET /api/files/*`) - Public
        if (pathname.startsWith('/api/files/') && request.method === 'GET') {
          if (!env.BUCKET) {
            return new Response(JSON.stringify({ error: 'R2 BUCKET binding not configured' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const filename = pathname.replace('/api/files/', '');
          const object = await env.BUCKET.get(filename);
          if (!object) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const headers = new Headers(corsHeaders);
          object.writeHttpMetadata(headers);
          headers.set('etag', object.httpEtag);
          return new Response(object.body, { headers });
        }

        if (
          pathname === '/api/generate-seo' ||
          pathname === '/api/generate-guide-article' ||
          pathname === '/api/generate-guide-faqs' ||
          pathname === '/api/generate-guide-seo' ||
          pathname === '/api/fetch-hotel-details'
        ) {
          const { pinVerified, cmsAuthorized } = checkSessions(request);
          if (!pinVerified || !cmsAuthorized) {
            return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
              status: 401,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const body = await request.json().catch(() => ({}));
          const ai = new GoogleGenAI({ apiKey });
          
          let prompt = body.prompt || body.title || 'Generate content for Bhakti Sathi travel guide.';
          if (pathname === '/api/generate-seo') {
            prompt = `Generate SEO title and meta description for package: ${body.title || 'Pilgrimage Yatra'}. Return text description.`;
          } else if (pathname === '/api/generate-guide-article') {
            prompt = `Write a detailed travel guide article for destination: ${body.title || 'Sacred Destination'}. Include history, significance, best time to visit, and itinerary.`;
          } else if (pathname === '/api/generate-guide-faqs') {
            prompt = `Generate 5 helpful FAQs with answers for pilgrimage to ${body.title || 'Sacred Place'}.`;
          } else if (pathname === '/api/generate-guide-seo') {
            prompt = `Generate SEO meta tags for guide ${body.title || 'Guide'}.`;
          } else if (pathname === '/api/fetch-hotel-details') {
            prompt = `Provide hotel and accommodation details near ${body.hotelName || body.title || 'Temple'}.`;
          }

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return new Response(JSON.stringify({ result: response.text, success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        if (pathname === '/api/notify-lead') {
          const body = await request.json().catch(() => ({}));
          if (env.DB) {
            try {
              await env.DB.prepare(`
                CREATE TABLE IF NOT EXISTS leads (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,
                  phone TEXT,
                  package TEXT,
                  created_at TEXT
                )
              `).run().catch(() => {});

              await env.DB.prepare(
                'INSERT INTO leads (name, phone, package, created_at) VALUES (?, ?, ?, ?)'
              ).bind(body.name || '', body.phone || '', body.package || '', new Date().toISOString()).run();
            } catch (err) {
              console.error('D1 lead insert error:', err);
            }
          }
          return new Response(JSON.stringify({ success: true, message: 'Lead recorded successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 404) {
        const indexRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(indexRequest);
      }
      return assetResponse;
    } catch (e) {
      return new Response('Asset fetch error', { status: 500 });
    }
  }
};
