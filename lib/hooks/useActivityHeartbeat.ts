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
  // INVARIANT: the socket.connected gate is required. Heartbeats only refresh
  // presence; the socket's connect handler owns full state resync, so emitting
  // while disconnected would be lost and must not be relied upon.
  const sendHeartbeat = useCallback(() => {
    if (!socket?.connected || !gameId || !userId || !enabled) return;

    const now = Date.now();
    const HEARTBEAT_DEBOUNCE_MS = 5000;
    if (now - lastHeartbeatRef.current < HEARTBEAT_DEBOUNCE_MS) return;

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
    const listenerOptions: AddEventListenerOptions = { passive: true };

    const handleActivity = () => {
      sendHeartbeat();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, listenerOptions);
    });

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity, listenerOptions);
      });
    };
  }, [socket, gameId, userId, enabled, sendHeartbeat]);

  return { sendHeartbeat };
}
