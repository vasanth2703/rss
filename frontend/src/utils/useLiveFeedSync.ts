import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedItem } from '../types/feed';

interface LiveSyncState {
  hasNewItems: boolean;
  newCount: number;
  newArticles: FeedItem[];
  latestIdOnServer: number;
  baselineId: number;
  isConnected: boolean;
  lastCheckedTime: string;
}

export function useLiveFeedSync(initialFeedHighestId: number = 0, onNewItemsAvailable?: (count: number) => void) {
  const [syncState, setSyncState] = useState<LiveSyncState>({
    hasNewItems: false,
    newCount: 0,
    newArticles: [],
    latestIdOnServer: initialFeedHighestId,
    baselineId: initialFeedHighestId,
    isConnected: false,
    lastCheckedTime: 'just now',
  });

  const wsRef = useRef<WebSocket | null>(null);
  const baselineIdRef = useRef<number>(initialFeedHighestId);
  const isInitializedRef = useRef<boolean>(false);

  // If initialFeedHighestId arrives from initial feed load before first sync check, establish baseline
  useEffect(() => {
    if (initialFeedHighestId > 0 && (!isInitializedRef.current || baselineIdRef.current === 0)) {
      baselineIdRef.current = Math.max(baselineIdRef.current, initialFeedHighestId);
      setSyncState((prev) => ({
        ...prev,
        baselineId: baselineIdRef.current,
        latestIdOnServer: Math.max(prev.latestIdOnServer, initialFeedHighestId),
      }));
    }
  }, [initialFeedHighestId]);

  // Check server for latest item ID and fetch any newly received articles
  const checkLatestId = useCallback(async () => {
    try {
      const response = await fetch('/api/feed/latest-id', {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const serverMaxId = Number(data.latest_id || 0);
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (!isInitializedRef.current) {
          // First check establishes baseline!
          // Strictly prevent "new data received" on initial page load
          isInitializedRef.current = true;
          const baseline = Math.max(serverMaxId, baselineIdRef.current);
          baselineIdRef.current = baseline;
          setSyncState({
            hasNewItems: false,
            newCount: 0,
            newArticles: [],
            latestIdOnServer: serverMaxId,
            baselineId: baseline,
            isConnected: true,
            lastCheckedTime: currentTime,
          });
          return;
        }

        // Subsequent checks: ONLY show new data if n8n has written NEW articles (serverMaxId > baseline)
        const baseline = baselineIdRef.current;
        const diff = serverMaxId > baseline ? serverMaxId - baseline : 0;

        let fetchedArticles: FeedItem[] = [];
        if (diff > 0) {
          try {
            const feedRes = await fetch(`/api/feed?since_id=${baseline}&limit=20`, {
              headers: { Accept: 'application/json' },
            });
            if (feedRes.ok) {
              const feedData = await feedRes.json();
              if (Array.isArray(feedData.data)) {
                fetchedArticles = feedData.data;
              }
            }
          } catch {
            // ignore
          }
        }

        setSyncState((prev) => ({
          ...prev,
          isConnected: true,
          latestIdOnServer: serverMaxId,
          hasNewItems: diff > 0,
          newCount: diff,
          newArticles: diff > 0 ? fetchedArticles : [],
          lastCheckedTime: currentTime,
        }));

        if (diff > 0 && onNewItemsAvailable) {
          onNewItemsAvailable(diff);
        }
      }
    } catch {
      setSyncState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [onNewItemsAvailable]);

  // Initialize WebSocket connection with auto-reconnect & fallback polling
  useEffect(() => {
    let isMounted = true;
    let pollInterval: any = null;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/feed/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setSyncState((prev) => ({ ...prev, isConnected: true }));
          ws.send(JSON.stringify({ type: 'ping' }));
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.latest_id !== undefined) {
              const serverMaxId = Number(data.latest_id || 0);

              if (!isInitializedRef.current) {
                isInitializedRef.current = true;
                const baseline = Math.max(serverMaxId, baselineIdRef.current);
                baselineIdRef.current = baseline;
                setSyncState((prev) => ({
                  ...prev,
                  hasNewItems: false,
                  newCount: 0,
                  newArticles: [],
                  latestIdOnServer: serverMaxId,
                  baselineId: baseline,
                  isConnected: true,
                  lastCheckedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                }));
                return;
              }

              const baseline = baselineIdRef.current;
              if (serverMaxId > baseline) {
                // Fetch the new articles via checkLatestId
                checkLatestId();
              }
            }
          } catch {
            // ignore non-json
          }
        };

        ws.onclose = () => {
          if (isMounted) setSyncState((prev) => ({ ...prev, isConnected: false }));
        };

        ws.onerror = () => {
          if (isMounted) setSyncState((prev) => ({ ...prev, isConnected: false }));
        };
      } catch {
        // Fallback silently
      }
    };

    connectWebSocket();

    // Check immediately on mount
    checkLatestId();

    // Secondary auto-polling every 10 seconds to catch n8n output reliably
    pollInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch {
          checkLatestId();
        }
      } else {
        checkLatestId();
      }
    }, 10000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [checkLatestId]);

  // Reset after user views new data
  const resetNewItems = useCallback((newBaseline?: number) => {
    setSyncState((prev) => {
      const targetBaseline = newBaseline !== undefined ? newBaseline : prev.latestIdOnServer;
      baselineIdRef.current = targetBaseline;
      isInitializedRef.current = true;
      return {
        ...prev,
        hasNewItems: false,
        newCount: 0,
        newArticles: [],
        baselineId: targetBaseline,
      };
    });
  }, []);

  return {
    ...syncState,
    checkNow: checkLatestId,
    resetNewItems,
  };
}

