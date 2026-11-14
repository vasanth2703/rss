# Live News Testing 📦⚡

**Production-ready Logistics & Freight News Feed** built with **React**, **Vite**, **Tailwind CSS**, **Cloudflare Workers**, and **Cloudflare D1**.

Engineered for testing automated content pipelines (e.g. **n8n**), displaying real-time freight forwarding, shipping, logistics, and import/export news with modern social-media feed aesthetics.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────┐
│       n8n Automation Engine     │
│  (RSS / Scrapers / Deduplicator)│
└────────────────┬────────────────┘
                 │ POST /api/feed (JSON)
                 ▼
┌─────────────────────────────────┐
│     Cloudflare Worker API       │
│      (Validates & Deduplicates) │
└────────────────┬────────────────┘
                 │ D1 Binding (SQL)
                 ▼
┌─────────────────────────────────┐
│     Cloudflare D1 Database      │
│     Table: feed_items           │
│     (ID: fba2b323-...)          │
└────────────────┬────────────────┘
                 │ Feed JSON (id DESC)
                 ▼
┌─────────────────────────────────┐
│   Live News Testing React UI    │
│  (Dark Mode • Filters • Search) │
└─────────────────────────────────┘
```

---

## 🚀 Features

- **Modern Feed UI**: Clean cards, lots of whitespace, rounded borders, subtle hover effects, mobile-first design.
- **Categorization**: All, Logistics, Supply Chain, AI & Robotics, Warehousing, Transportation, Shipping, India.
- **Content Type Distinction**:
  - `news`: Standard industry news.
  - `ai_insight`: Visually highlighted with a purple gradient pill and sparkle icon.
  - `trend`: Highlighted with an amber market trend indicator.
- **Interactive POST Test Tool**: Click **"Test POST"** in the header to simulate an n8n ingestion directly inside the browser.
- **Deduplication**: Prevents duplicate articles using a unique constraint on `source_url` (returns `409 Conflict`).
- **Dark & Light Mode**: Seamless toggle with persistent `localStorage` preference.
- **Instant Search & Filters**: Live search across title, description, and source with debouncing.
- **Skeleton & Error States**: Smooth shimmer loading and friendly error/retry handling.

---

## 📁 Project Structure

```text
newsupdate/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Worker API router, handlers & CORS
│   │   └── types.ts              # D1 & FeedItem TypeScript definitions
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # Logo, search, refresh, dark toggle
│   │   │   ├── CategoryNav.tsx    # Category pills (Freight Forwarding, Shipping, Logistics, Import & Export)
│   │   │   ├── ContentTypeFilter.tsx # News / Trends
│   │   │   ├── FeedCard.tsx       # Feed card with badges & timeago
│   │   │   ├── SkeletonCard.tsx   # Loading shimmer
│   │   │   ├── EmptyState.tsx     # Empty state display
│   │   │   └── ErrorState.tsx     # Error recovery display
│   │   ├── types/
│   │   │   └── feed.ts            # Frontend TypeScript types
│   │   ├── utils/
│   │   │   ├── api.ts             # Fetch client for Cloudflare Worker
│   │   │   └── date.ts            # Relative time ("2h ago", "1d ago")
│   │   ├── App.tsx                # Main feed view
│   │   ├── main.tsx
│   │   └── index.css              # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts             # Proxies /api to Worker in dev
├── migrations/
│   ├── 0001_initial_schema.sql    # D1 SQL schema with indexes
│   └── seed.sql                   # Realistic logistics seed records
├── wrangler.toml                  # Cloudflare Worker, D1 & Assets binding
├── package.json                   # Root orchestrator scripts
└── README.md
```

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
# In the root directory:
npm install

# In the frontend directory:
cd frontend && npm install && cd ..
```

### 2. Apply Local D1 Database Schema & Seed Data
```bash
# Execute schema migration locally:
npm run d1:migrate:local

# Seed local database with realistic logistics items:
npm run d1:seed:local
```

### 3. Run Development Servers
Open two terminal tabs:

**Terminal 1 (Cloudflare Worker & Local D1):**
```bash
npm run dev:worker
# Starts on http://127.0.0.1:8787
```

**Terminal 2 (React Vite Frontend with HMR):**
```bash
npm run dev:frontend
# Starts on http://localhost:5173
```
Visit `http://localhost:5173` in your browser. Any API request to `/api/*` is automatically forwarded to the local Cloudflare Worker.

---

## ☁️ Cloudflare Deployment

### 1. Authenticate with Cloudflare
```bash
npx wrangler login
```

### 2. Apply Remote D1 Migrations
Your D1 database ID (`fba2b323-787c-48c5-ab49-148704690258`) is already configured in `wrangler.toml`. Run:
```bash
# Apply schema to remote D1:
npm run d1:migrate:remote

# (Optional) Seed remote D1 with sample data:
npm run d1:seed:remote
```

### 3. Build & Deploy
```bash
npm run deploy
```
This builds the React frontend into `frontend/dist` and deploys both the frontend static assets and the Worker API to Cloudflare in a single step!

---

## 📡 API Reference

### `GET /api/feed`
Fetch feed items ordered by `published_at DESC`.

**Query Parameters:**
- `category`: Filter by category (e.g. `?category=robotics`, `?category=AI & Robotics`, `?category=India`, `?category=Warehousing`).
- `limit`: Number of items to return (default: `20`, max: `100`).
- `offset`: Pagination offset (default: `0`).
- `content_type`: Filter by type (`news`, `ai_insight`, `trend`).
- `q` or `search`: Full-text search across titles and descriptions.

**Example Response:**
```json
{
  "success": true,
  "count": 12,
  "total": 12,
  "limit": 20,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "title": "Autonomous Mobile Robots (AMRs) Accelerate Fulfillment Speed in Tier-1 Mega Warehouses",
      "description": "Next-generation AMRs equipped with 3D LiDAR and computer vision are reducing order cycle times by 38%...",
      "source": "Robotics Business Review",
      "source_url": "https://example.com/robotics/amr-tier1-warehouses-2025",
      "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "category": "AI & Robotics",
      "published_at": "2026-11-14T17:45:00Z",
      "content_type": "ai_insight",
      "created_at": "2026-11-14 14:05:55"
    }
  ]
}
```

---

### `POST /api/feed`
Insert a new feed item into Cloudflare D1. Used by n8n or automated scrapers.

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Autonomous Tuggers Optimize Container Drayage at Port of Rotterdam",
  "description": "Electric autonomous terminal tractors reduce turn times by 27% during peak vessel discharge windows.",
  "source": "Port Technology International",
  "source_url": "https://example.com/ports/rotterdam-autonomous-tuggers-2026",
  "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  "category": "AI & Robotics",
  "published_at": "2026-11-14T18:30:00Z",
  "content_type": "ai_insight"
}
```

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Feed item created successfully",
  "id": 14,
  "data": { ... }
}
```

**Duplicate Response (`409 Conflict`):**
```json
{
  "success": false,
  "error": "Duplicate article",
  "message": "An article with this source_url already exists (ID: 14)",
  "existing_id": 14
}
```

---

## 🤖 n8n Automation Configuration Guide

When configuring n8n to ingest feed items into LogiPulse:

### 1. HTTP Request Node Setup
1. **Method**: `POST`
2. **URL**: `https://<your-worker-domain>.workers.dev/api/feed` (or `http://localhost:8787/api/feed` during local testing)
3. **Send Headers**: `true`
   - Name: `Content-Type`, Value: `application/json`
4. **Send Body**: `true`
5. **Body Content Type**: `JSON`
6. **Specify Body**: `Using Fields Below` or `JSON`

### 2. Expression Example for n8n JSON Body
```json
{
  "title": "={{ $json.title }}",
  "description": "={{ $json.description || $json.snippet }}",
  "source": "={{ $json.source || $json.publisher || 'Logistics News' }}",
  "source_url": "={{ $json.link || $json.url }}",
  "image_url": "={{ $json.imageUrl || $json.enclosure?.url || null }}",
  "category": "={{ $json.category || 'Supply Chain' }}",
  "published_at": "={{ $json.pubDate ? new Date($json.pubDate).toISOString() : new Date().toISOString() }}",
  "content_type": "={{ $json.isAiInsight ? 'ai_insight' : ($json.isTrend ? 'trend' : 'news') }}"
}
```

### 3. Handling Duplicates in n8n
- In the HTTP Request Node, expand **Options**.
- Toggle **Never Error** to `true`.
- Add an **If Node** following the HTTP Request:
  - Check if `{{ $json.statusCode == 201 }}` (New item created) or `{{ $json.statusCode == 409 }}` (Already ingested, safely ignored).

