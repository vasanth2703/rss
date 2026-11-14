import { Env, FeedItem, CreateFeedItemInput, ContentType } from './types';

// Standard CORS headers for cross-origin API access (for frontend, n8n, curl)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

// JSON response helper with CORS headers
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

// OPTIONS preflight response
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Route API requests
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err: any) {
        console.error('API Error:', err);
        return jsonResponse(
          {
            success: false,
            error: 'Internal Server Error',
            message: err?.message || 'An unexpected error occurred',
          },
          500
        );
      }
    }

    // Serve static assets if ASSETS binding exists (Worker Static Assets)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Fallback response for root
    return new Response(
      JSON.stringify({
        name: 'LogiPulse API',
        description: 'Logistics & Supply Chain News Feed API',
        version: '1.0.0',
        endpoints: {
          'GET /api/feed': 'List latest feed items (supports ?category, ?limit, ?offset, ?content_type, ?q)',
          'POST /api/feed': 'Create a new feed item (for n8n or testing)',
          'GET /api/categories': 'List categories with item counts',
          'GET /api/health': 'Health check endpoint',
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, ''); // Strip trailing slash

  // Health check endpoint
  if (path === '/api/health' && request.method === 'GET') {
    return jsonResponse({
      status: 'ok',
      service: 'LogiPulse API',
      timestamp: new Date().toISOString(),
    });
  }

  // Real-time WebSocket connection for live feed sync
  if (path === '/api/feed/ws') {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      // Fetch the latest item ID immediately upon connection
      env.DB.prepare('SELECT MAX(id) as max_id, COUNT(*) as count FROM feed_items')
        .first<{ max_id: number; count: number }>()
        .then((stat) => {
          server.send(
            JSON.stringify({
              type: 'init',
              latest_id: stat?.max_id || 0,
              total_count: stat?.count || 0,
              timestamp: new Date().toISOString(),
            })
          );
        });

      server.addEventListener('message', async (event) => {
        try {
          const msg = JSON.parse(event.data.toString());
          if (msg.type === 'ping' || msg.type === 'check') {
            const stat = await env.DB.prepare('SELECT MAX(id) as max_id, COUNT(*) as count FROM feed_items').first<{
              max_id: number;
              count: number;
            }>();
            server.send(
              JSON.stringify({
                type: 'pong',
                latest_id: stat?.max_id || 0,
                total_count: stat?.count || 0,
                timestamp: new Date().toISOString(),
              })
            );
          }
        } catch {
          // ignore malformed messages
        }
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: corsHeaders,
      });
    }
  }

  // Lightweight latest ID check for real-time live sync polling
  if (path === '/api/feed/latest-id' && request.method === 'GET') {
    const stat = await env.DB.prepare('SELECT MAX(id) as latest_id, COUNT(*) as total_count FROM feed_items').first<{
      latest_id: number;
      total_count: number;
    }>();
    return jsonResponse({
      success: true,
      latest_id: stat?.latest_id || 0,
      total_count: stat?.total_count || 0,
      timestamp: new Date().toISOString(),
    });
  }

  // Get categories with counts
  if (path === '/api/categories' && request.method === 'GET') {
    const result = await env.DB.prepare(
      `SELECT category, COUNT(*) as count 
       FROM feed_items 
       WHERE category IS NOT NULL 
       GROUP BY category 
       ORDER BY count DESC`
    ).all();

    return jsonResponse({
      success: true,
      categories: result.results,
    });
  }

  // Main feed endpoint: GET /api/feed & POST /api/feed
  if (path === '/api/feed') {
    if (request.method === 'GET') {
      return handleGetFeed(url, env);
    } else if (request.method === 'POST') {
      return handlePostFeed(request, env, url);
    } else {
      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405);
    }
  }

  return jsonResponse({ success: false, error: 'Endpoint Not Found' }, 404);
}

/**
 * GET /api/feed
 * Query parameters:
 *  - category: e.g. "robotics", "AI & Robotics", "Warehousing", "India"
 *  - limit: default 20, max 100
 *  - offset: default 0 (for pagination)
 *  - content_type: "news" | "ai_insight" | "trend"
 *  - q / search: keyword search in title or description
 */
async function handleGetFeed(url: URL, env: Env): Promise<Response> {
  const categoryParam = url.searchParams.get('category')?.trim();
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');
  const sinceIdParam = url.searchParams.get('since_id');
  const contentTypeParam = url.searchParams.get('content_type')?.trim().toLowerCase();
  const searchQuery = (url.searchParams.get('q') || url.searchParams.get('search'))?.trim().toLowerCase();

  const limit = Math.min(Math.max(parseInt(limitParam || '20', 10) || 20, 1), 100);
  const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0);
  const sinceId = sinceIdParam ? parseInt(sinceIdParam, 10) : null;

  const whereClauses: string[] = [];
  const params: any[] = [];

  // Filter newer than since_id (for live feed updates)
  if (sinceId !== null && !isNaN(sinceId) && sinceId > 0) {
    whereClauses.push('id > ?');
    params.push(sinceId);
  }

  // Filter by category if provided and not "all"
  if (categoryParam && categoryParam.toLowerCase() !== 'all') {
    // Support exact match or substring match (e.g. "robotics" matches "AI & Robotics")
    whereClauses.push('(LOWER(category) = LOWER(?) OR LOWER(category) LIKE ?)');
    params.push(categoryParam, `%${categoryParam.toLowerCase()}%`);
  }

  // Filter by content_type if provided and valid
  if (contentTypeParam && ['news', 'ai_insight', 'trend'].includes(contentTypeParam)) {
    whereClauses.push('content_type = ?');
    params.push(contentTypeParam);
  }

  // Text search query across title, description, and source
  if (searchQuery) {
    whereClauses.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(source) LIKE ?)');
    const term = `%${searchQuery}%`;
    params.push(term, term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total matching items
  const countQuery = `SELECT COUNT(*) as total FROM feed_items ${whereSql}`;
  const countStmt = env.DB.prepare(countQuery);
  const countResult = await (params.length > 0 ? countStmt.bind(...params) : countStmt).first<{ total: number }>();
  const total = countResult?.total || 0;

  // Fetch paginated items ordered by published_at DESC
  const query = `
    SELECT id, title, description, source, source_url, image_url, category, published_at, content_type, created_at
    FROM feed_items
    ${whereSql}
    ORDER BY datetime(published_at) DESC, id DESC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, limit, offset];
  const itemsResult = await env.DB.prepare(query).bind(...queryParams).all<FeedItem>();

  return jsonResponse({
    success: true,
    count: itemsResult.results.length,
    total,
    limit,
    offset,
    data: itemsResult.results,
    items: itemsResult.results, // For convenience
  });
}

/**
 * POST /api/feed
 * Accepts JSON body:
 * {
 *   title: string (required)
 *   description?: string
 *   source?: string
 *   source_url: string (required, unique)
 *   image_url?: string
 *   category?: string
 *   published_at?: string (ISO string, defaults to current time)
 *   content_type?: "news" | "ai_insight" | "trend" (defaults to "news")
 * }
 */
async function handlePostFeed(request: Request, env: Env, url: URL): Promise<Response> {
  let body: CreateFeedItemInput;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'Invalid JSON',
        message: 'Request body must be a valid JSON object',
      },
      400
    );
  }

  // Required fields validation
  const title = body.title?.trim();
  const source_url = body.source_url?.trim();

  if (!title) {
    return jsonResponse(
      {
        success: false,
        error: 'Validation Error',
        message: 'Field "title" is required and cannot be empty',
      },
      400
    );
  }

  if (!source_url) {
    return jsonResponse(
      {
        success: false,
        error: 'Validation Error',
        message: 'Field "source_url" is required and cannot be empty',
      },
      400
    );
  }

  // Basic URL format validation
  try {
    new URL(source_url);
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'Validation Error',
        message: 'Field "source_url" must be a valid URL (including http:// or https://)',
      },
      400
    );
  }

  // Prevent duplicate articles using source_url
  const existing = await env.DB.prepare(
    'SELECT id, title, published_at FROM feed_items WHERE source_url = ? LIMIT 1'
  )
    .bind(source_url)
    .first<{ id: number; title: string; published_at: string }>();

  if (existing) {
    // If strict mode requested, return 409 Conflict. Otherwise return 200 with duplicate: true so automated pipelines succeed cleanly.
    const strictMode = url.searchParams.get('strict') === 'true';
    const status = strictMode ? 409 : 200;

    return jsonResponse(
      {
        success: !strictMode,
        status: 'duplicate_skipped',
        duplicate: true,
        message: `An article with this source_url already exists (ID: ${existing.id})`,
        existing_id: existing.id,
        existing_title: existing.title,
      },
      status
    );
  }

  // Normalize and sanitize values
  const description = body.description?.trim() || null;
  const image_url = body.image_url?.trim() || null;
  const category = body.category?.trim() || 'Logistics';

  // Normalize source - if omitted, extract domain from source_url
  let source = body.source?.trim() || null;
  if (!source) {
    try {
      const parsed = new URL(source_url);
      source = parsed.hostname.replace(/^www\./, '');
    } catch {
      source = 'Industry Source';
    }
  }

  // Normalize published_at
  let published_at = body.published_at?.trim() || null;
  if (!published_at || isNaN(Date.parse(published_at))) {
    published_at = new Date().toISOString();
  }

  // Normalize content_type
  let content_type: ContentType = 'news';
  const rawContentType = body.content_type?.toString().toLowerCase().trim();
  if (rawContentType === 'ai_insight' || rawContentType === 'trend' || rawContentType === 'news') {
    content_type = rawContentType;
  }

  // Insert into D1 database
  const insertStmt = env.DB.prepare(`
    INSERT INTO feed_items (title, description, source, source_url, image_url, category, published_at, content_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = await insertStmt
    .bind(title, description, source, source_url, image_url, category, published_at, content_type)
    .run();

  const newId = result.meta.last_row_id;

  const newItem: FeedItem = {
    id: Number(newId),
    title,
    description,
    source,
    source_url,
    image_url,
    category,
    published_at,
    content_type,
    created_at: new Date().toISOString(),
  };

  return jsonResponse(
    {
      success: true,
      message: 'Feed item created successfully',
      id: newId,
      data: newItem,
    },
    201
  );
}

