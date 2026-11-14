// Types for LogiPulse Worker and D1 Database

export type ContentType = 'news' | 'ai_insight' | 'trend';

export interface FeedItem {
  id: number;
  title: string;
  description: string | null;
  source: string | null;
  source_url: string;
  image_url: string | null;
  category: string | null;
  published_at: string;
  content_type: ContentType;
  created_at: string;
}

export interface CreateFeedItemInput {
  title: string;
  description?: string | null;
  source?: string | null;
  source_url: string;
  image_url?: string | null;
  category?: string | null;
  published_at?: string | null;
  content_type?: ContentType | string;
}

export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
}

