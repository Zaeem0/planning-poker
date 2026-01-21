import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseActivityHeartbeatOptions {
  socket: Socket | null;
  gameId: string;
  userId: string;
  enabled?: boolean;
  intervalMs?: number;
}

/**
 * Hook to send periodic heartbeats and activity-based heartbeats
 * to maintain connection status.
 *
 * This hook:
 * 1. Sends a heartbeat at regular intervals (default: 30 seconds)
 * 2. Provides a function to send heartbeats on user activity
 * 3. Helps prevent false disconnections during periods of inactivity
 */
export function useActivityHeartbeat({
  socket,
  gameId,
  userId,
  enabled = true,
  intervalMs = 30000, // 30 seconds default
}: UseActivityHeartbeatOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastHeartbeatRef = useRef<number>(0);

  // Function to send a heartbeat (can be called manually on user activity)
  const sendHeartbeat = useCallback(() => {
    if (!socket || !gameId || !userId || !enabled) return;

    const now = Date.now();
    // Debounce heartbeats to avoid spamming (min 5 seconds between heartbeats)
    if (now - lastHeartbeatRef.current < 5000) return;

    lastHeartbeatRef.current = now;
    socket.emit('heartbeat', { gameId, userId });
  }, [socket, gameId, userId, enabled]);

  // Set up interval-based heartbeats
  useEffect(() => {
    if (!socket || !gameId || !userId || !enabled) return;

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for periodic heartbeats
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [socket, gameId, userId, enabled, intervalMs, sendHeartbeat]);

  // Set up activity listeners (mouse, keyboard, touch)
  useEffect(() => {
    if (!socket || !gameId || !userId || !enabled) return;
    if (typeof window === 'undefined') return;

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      sendHeartbeat();
    };

    // Add listeners with passive option for better performance
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [socket, gameId, userId, enabled, sendHeartbeat]);

  return { sendHeartbeat };
}

