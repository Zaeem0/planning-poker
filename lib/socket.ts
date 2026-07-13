import { useEffect, useRef, useSyncExternalStore } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from './store';
import { getVoteForUser } from './vote-utils';
import { CardSet } from './constants';

declare global {
  interface Window {
    __TEST_SOCKET__?: Socket | null;
  }
}

const USER_ID_KEY = 'planning-poker-user-id';

function getUserId(): string {
  if (typeof window === 'undefined') return '';

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

// Identifies a distinct join-game payload. Used to dedup redundant joins:
// we only re-emit when the (username, isSpectator) pair actually changes.
function joinKey(username?: string, isSpectator?: boolean): string {
  return `${username ?? ''}|${isSpectator ? '1' : '0'}`;
}

/**
 * JOIN-GAME RULES
 *
 * There are two scenarios that send a 'join-game' event to the server:
 *
 * 1. CONNECT/RECONNECT — the socket's 'connect' event fires.
 *    This always sends join-game, even without a displayName.
 *    The server resolves the username from its stored profile using the userId.
 *    This handles: initial page load (returning user), page refresh, tab reconnect.
 *
 * 2. DISPLAY NAME CHANGE — the displayName prop changes while already connected.
 *    This happens when: the user submits the join form, or toggles spectator mode.
 *    It sends join-game with the new displayName so the server updates the profile.
 *
 * DEDUP: Both paths record the payload they sent via `lastJoinKeyRef`. The
 * displayName effect (scenario 2) skips emitting when the current key already
 * matches the last one sent, so it never duplicates the connect handler's join.
 * Because it compares actual payloads (not a one-shot flag), a rename that
 * happens after a reconnect is still emitted correctly.
 */
export function useSocket(
  gameId: string,
  displayName?: string,
  isSpectator?: boolean,
  shouldConnect: boolean = true,
  cardSet?: CardSet
) {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const displayNameRef = useRef(displayName);
  const isSpectatorRef = useRef(isSpectator);
  const cardSetRef = useRef(cardSet);
  const lastJoinKeyRef = useRef<string | null>(null);

  useEffect(() => {
    displayNameRef.current = displayName;
    isSpectatorRef.current = isSpectator;
    cardSetRef.current = cardSet;
  }, [displayName, isSpectator, cardSet]);

  const {
    setCurrentUserId,
    setCurrentUserName,
    setUsers,
    setVotes,
    setRevealed,
    setSelectedVote,
    setCardSet,
  } = useGameStore();

  const subscribe = (callback: () => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  const getSnapshot = () => {
    return socketRef.current;
  };

  // --- Socket lifecycle effect: create, connect, listen, cleanup ---
  useEffect(() => {
    if (!gameId || !shouldConnect) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    const listeners = listenersRef.current;
    const userId = getUserId();

    const emitJoinGame = (socket: Socket) => {
      lastJoinKeyRef.current = joinKey(
        displayNameRef.current,
        isSpectatorRef.current
      );
      socket.emit('join-game', {
        gameId,
        userId,
        username: displayNameRef.current,
        isSpectator: isSpectatorRef.current,
        cardSet: cardSetRef.current,
      });
    };

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TEST_MODE) {
      window.__TEST_SOCKET__ = newSocket;
    }
    listeners.forEach((listener) => listener());

    newSocket.on(
      'user-joined',
      ({
        userId: joinedUserId,
        username,
        users,
        votes,
        revealed,
        cardSet: serverCardSet,
      }) => {
        setCurrentUserId(joinedUserId);
        setCurrentUserName(username);
        setUsers(users);
        setVotes(votes);
        setRevealed(revealed);
        // Only adopt the server's card set when it actually sent one. An empty
        // value means "no change" (e.g. a presence-only join response) and must
        // not clobber a card set we already have. Cross-game staleness is
        // handled by resetting the card set when the gameId changes (page.tsx).
        if (serverCardSet) {
          setCardSet(serverCardSet);
        }
        const userVote = getVoteForUser(votes, joinedUserId);
        setSelectedVote(userVote ?? null);
      }
    );

    // Scenario 1: connect/reconnect — always join, server resolves username from profile
    newSocket.on('connect', () => {
      console.log('Socket connected');
      emitJoinGame(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    newSocket.io.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    newSocket.io.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error.message);
    });

    newSocket.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect after all attempts');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('user-list-updated', ({ users }) => {
      setUsers(users);
    });

    newSocket.on('votes-revealed', ({ votes, revealed }) => {
      setVotes(votes);
      setRevealed(revealed);
    });

    newSocket.on('votes-reset', ({ users }) => {
      useGameStore.setState({
        selectedVote: null,
        votes: [],
        revealed: false,
        users,
      });
    });

    newSocket.on(
      'card-set-updated',
      ({
        cardSet: updatedCardSet,
        invalidatedUserIds,
      }: {
        cardSet: CardSet;
        invalidatedUserIds?: string[];
      }) => {
        setCardSet(updatedCardSet);
        if (invalidatedUserIds?.length) {
          const currentUserId = useGameStore.getState().currentUserId;
          if (invalidatedUserIds.includes(currentUserId)) {
            setSelectedVote(null);
          }
        }
      }
    );

    return () => {
      lastJoinKeyRef.current = null;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TEST_MODE) {
        window.__TEST_SOCKET__ = null;
      }
      listeners.forEach((listener) => listener());
    };
  }, [
    gameId,
    shouldConnect,
    setCurrentUserId,
    setCurrentUserName,
    setUsers,
    setVotes,
    setRevealed,
    setSelectedVote,
    setCardSet,
  ]);

  // --- Scenario 2: displayName/role changed while already connected ---
  useEffect(() => {
    if (!displayName || !socketRef.current?.connected) return;

    // Skip if this exact payload was already sent (e.g. by the connect handler).
    const key = joinKey(displayName, isSpectatorRef.current);
    if (key === lastJoinKeyRef.current) return;
    lastJoinKeyRef.current = key;

    socketRef.current.emit('join-game', {
      gameId,
      userId: getUserId(),
      username: displayName,
      isSpectator: isSpectatorRef.current,
      cardSet: cardSetRef.current,
    });
  }, [gameId, displayName, isSpectator]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function isConnected(socket: Socket | null): socket is Socket {
  return socket !== null && socket.connected;
}

export function emitVote(
  socket: Socket | null,
  gameId: string,
  userId: string,
  vote: string | null
) {
  if (isConnected(socket)) {
    socket.emit('vote', { gameId, userId, vote });
  }
}

export function emitReveal(socket: Socket | null, gameId: string) {
  if (isConnected(socket)) {
    socket.emit('reveal-votes', { gameId });
  }
}

export function emitReset(socket: Socket | null, gameId: string) {
  if (isConnected(socket)) {
    socket.emit('reset-votes', { gameId });
  }
}

export function emitThrowEmoji(
  socket: Socket | null,
  gameId: string,
  targetUserId: string,
  emoji: string
) {
  if (isConnected(socket)) {
    socket.emit('throw-emoji', { gameId, targetUserId, emoji });
  }
}

export function emitToggleRole(
  socket: Socket | null,
  gameId: string,
  userId: string
) {
  if (isConnected(socket)) {
    socket.emit('toggle-role', { gameId, userId });
  }
}
