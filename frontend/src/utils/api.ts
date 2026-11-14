import { FeedApiResponse, FeedItem } from '../types/feed';

interface FetchFeedParams {
  category?: string;
  limit?: number;
  offset?: number;
  contentType?: string;
  search?: string;
}

export async function fetchFeed(params: FetchFeedParams = {}): Promise<FeedApiResponse> {
  const query = new URLSearchParams();

  if (params.category && params.category !== 'All') {
    query.set('category', params.category);
  }

  if (params.limit) {
    query.set('limit', params.limit.toString());
  }

  if (params.offset) {
    query.set('offset', params.offset.toString());
  }

  if (params.contentType && params.contentType !== 'all') {
    query.set('content_type', params.contentType);
  }

  if (params.search && params.search.trim()) {
    query.set('q', params.search.trim());
  }

  const queryString = query.toString();
  const url = `/api/feed${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function createFeedItem(payload: Partial<FeedItem>): Promise<{ success: boolean; data?: FeedItem; message?: string }> {
  const response = await fetch('/api/feed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `Failed to create item (${response.status})`);
  }

  return data;
}

