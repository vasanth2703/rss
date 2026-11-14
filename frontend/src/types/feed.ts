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
  created_at?: string;
}

export interface FeedApiResponse {
  success: boolean;
  count: number;
  total: number;
  limit: number;
  offset: number;
  data: FeedItem[];
  error?: string;
  message?: string;
}

export type CategoryOption =
  | 'All'
  | 'Logistics'
  | 'Supply Chain'
  | 'AI & Robotics'
  | 'Warehousing'
  | 'Transportation'
  | 'Shipping'
  | 'India';

