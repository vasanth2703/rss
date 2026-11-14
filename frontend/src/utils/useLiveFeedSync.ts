import { useState, useEffect, useRef, useCallback } from 'react';

interface LiveSyncState {
  hasNewItems: boolean;
  newCount: number;
  latestIdOnServer: number;
  isConnected: boolean;
  lastCheckedTime: string;
}

export function useLiveFeedSync(currentHighestId: number, onNewItemsAvailable?: (count: number) => void) {
  const [syncState, setSyncState] = useState<LiveSyncState>({
    hasNewItems: false,
    newCount: 0,
    latestIdOnServer: currentHighestId,
    isConnected: false,
    lastCheckedTime: 'just now',
  });

  const wsRef = useRef<WebSocket | null>(null);
  const highestIdRef = useRef<number>(currentHighestId);

  useEffect(() => {
    highestIdRef.current = currentHighestId;
  }, [currentHighestId]);

  // Check server for latest item ID
  const checkLatestId = useCallback(async () => {
    try {
      const response = await fetch('/api/feed/latest-id', {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const serverMaxId = data.latest_id || 0;
        const currentId = highestIdRef.current;

        setSyncState((prev) => {
          const diff = serverMaxId > currentId ? serverMaxId - currentId : 0;
          return {
            ...prev,
            isConnected: true,
            latestIdOnServer: serverMaxId,
            hasNewItems: diff > 0,
            newCount: diff,
            lastCheckedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
        });

        if (serverMaxId > currentId && onNewItemsAvailable) {
          onNewItemsAvailable(serverMaxId - currentId);
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
          // Check right after connecting
          ws.send(JSON.stringify({ type: 'ping' }));
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.latest_id) {
              const serverMaxId = data.latest_id;
              const currentId = highestIdRef.current;
              const diff = serverMaxId > currentId ? serverMaxId - currentId : 0;

              setSyncState((prev) => ({
                ...prev,
                latestIdOnServer: serverMaxId,
                hasNewItems: diff > 0,
                newCount: diff,
                lastCheckedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              }));
            }
          } catch {
            // ignore non-json
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            setSyncState((prev) => ({ ...prev, isConnected: false }));
          }
        };

        ws.onerror = () => {
          if (isMounted) {
            setSyncState((prev) => ({ ...prev, isConnected: false }));
          }
        };
      } catch {
        // Fallback silently
      }
    };

    connectWebSocket();

    // Secondary auto-polling every 15 seconds to ensure fast updates under any network conditions
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
    }, 15000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [checkLatestId]);

  const resetNewItems = useCallback(() => {
    setSyncState((prev) => ({
      ...prev,
      hasNewItems: false,
      newCount: 0,
    }));
  }, []);

  return {
    ...syncState,
    checkNow: checkLatestId,
    resetNewItems,
  };
}

