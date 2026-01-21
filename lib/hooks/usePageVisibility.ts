import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface UsePageVisibilityOptions {
  socket: Socket | null;
  gameId: string;
  userId: string;
  enabled?: boolean;
}

/**
 * Hook to detect when user returns to the tab and send a heartbeat
 * to prevent false disconnections due to browser throttling.
 *
 * When a user switches tabs, browsers throttle background tabs to save resources.
 * This can cause Socket.IO to think the user is disconnected.
 * By sending a heartbeat when the tab becomes visible again, we ensure
 * the user is marked as connected.
 */
export function usePageVisibility({
  socket,
  gameId,
  userId,
  enabled = true,
}: UsePageVisibilityOptions): void {
  const lastVisibilityChangeRef = useRef<number>(0);

  useEffect(() => {
    if (!socket || !gameId || !userId || !enabled) return;
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      // Debounce rapid visibility changes (e.g., alt-tabbing quickly)
      const now = Date.now();
      if (now - lastVisibilityChangeRef.current < 1000) return;
      lastVisibilityChangeRef.current = now;

      if (document.visibilityState === 'visible') {
        console.log('Tab became visible - sending heartbeat');
        // User returned to tab - send heartbeat to ensure connection
        socket.emit('user-active', { gameId, userId });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, gameId, userId, enabled]);
}

