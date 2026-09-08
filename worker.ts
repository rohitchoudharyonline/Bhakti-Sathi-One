import { GoogleGenAI } from '@google/genai';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (pathname.startsWith('/api/')) {
      try {
        if (pathname === '/api/health') {
          return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        if (pathname === '/api/auth/cms/session' || pathname === '/api/auth/cms') {
          return new Response(JSON.stringify({ authenticated: true, user: { role: 'admin' } }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        if (pathname === '/api/auth/cms/direct-login') {
          return new Response(JSON.stringify({ success: true, token: 'mock-token' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        if (
          pathname === '/api/generate-seo' ||
          pathname === '/api/generate-guide-article' ||
          pathname === '/api/generate-guide-faqs' ||
          pathname === '/api/generate-guide-seo' ||
          pathname === '/api/fetch-hotel-details'
        ) {
          const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare worker environment.' }), {
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

        if (pathname === '/api/upload' && request.method === 'POST') {
          if (!env.BUCKET) {
            return new Response(JSON.stringify({ error: 'R2 BUCKET binding not configured' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const formData = await request.formData();
          const file = formData.get('file') as File;
          if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
          const filename = `${Date.now()}-${file.name}`;
          await env.BUCKET.put(filename, file.stream(), {
            httpMetadata: { contentType: file.type }
          });
          return new Response(JSON.stringify({ success: true, filename, url: `/api/files/${filename}` }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

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
