import { GoogleGenAI } from '@google/genai';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (pathname.startsWith('/api/')) {
      try {
        // Ensure tables exist in D1
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
        }

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

        // Generic Content API with R2 media integration
        if (pathname === '/api/contents' || pathname.startsWith('/api/contents/')) {
          const pathParts = pathname.replace('/api/contents', '').replace(/^\/+/, '').split('/');
          const subRoute = pathParts[0];

          if (request.method === 'GET') {
            if (!subRoute) {
              const contentType = url.searchParams.get('type');
              let query = 'SELECT * FROM contents';
              let stmt;
              if (contentType) {
                query += ' WHERE content_type = ? ORDER BY updated_at DESC';
                stmt = env.DB.prepare(query).bind(contentType);
              } else {
                query += ' ORDER BY updated_at DESC';
                stmt = env.DB.prepare(query);
              }
              const { results } = await stmt.all();
              
              // Fetch media for each content item
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

          if (request.method === 'POST' || request.method === 'PUT') {
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

            return new Response(JSON.stringify({ success: true, id, slug, message: 'Content and metadata saved successfully in D1' }), {
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
            // Optional: cleanup associated media objects from R2 if desired, or keep metadata
            await env.DB.prepare('DELETE FROM contents WHERE id = ?').bind(id).run();
            await env.DB.prepare('DELETE FROM media WHERE content_item_id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true, message: 'Content and references deleted successfully' }), {
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
        }

        // Unified R2 Media Upload API (`POST /api/upload`)
        if (pathname === '/api/upload' && request.method === 'POST') {
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

          // Generate predictable safe R2 object key
          const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const r2Key = `${contentType}/${slug}/${mediaType}/${Date.now()}-${sanitizedFilename}`;

          // Upload to R2 bucket bhakti-sathi (BUCKET)
          await env.BUCKET.put(r2Key, file.stream(), {
            httpMetadata: { contentType: file.type }
          });

          const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const now = new Date().toISOString();

          if (env.DB) {
            // If isCover is true, reset other covers for this content item
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
            message: 'File uploaded successfully to R2 bhakti-sathi bucket and indexed in D1'
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Media Delete API (`DELETE /api/media/:id`)
        if (pathname.startsWith('/api/media/') && request.method === 'DELETE') {
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

          return new Response(JSON.stringify({ success: true, message: 'Media deleted from R2 and D1 successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // R2 File Retrieval API (`GET /api/files/*`)
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
            return new Response(JSON.stringify({ error: 'File not found in R2 bhakti-sathi' }), {
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
