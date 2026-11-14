-- LogiPulse D1 Database Migration
-- Table: feed_items

CREATE TABLE IF NOT EXISTS feed_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT,
    source_url TEXT,
    image_url TEXT,
    category TEXT,
    published_at TEXT,
    content_type TEXT DEFAULT 'news',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for ordering by publication time
CREATE INDEX IF NOT EXISTS idx_feed_items_published_at ON feed_items(published_at DESC);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_feed_items_category ON feed_items(category);

-- Unique index to prevent duplicate articles by source_url
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_items_source_url ON feed_items(source_url);

