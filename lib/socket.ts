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

function resolveCardSet(
  cardSet: CardSet | undefined,
  gameId: string
): CardSet | undefined {
  let resolved = cardSet;
  if (!resolved && typeof window !== 'undefined') {
    const saved = localStorage.getItem(`game-${gameId}-cardset`);
    if (saved) {
      try {
        resolved = JSON.parse(saved);
      } catch {
        // Ignore parse errors
      }
    }
  }
  if (resolved && typeof window !== 'undefined') {
    localStorage.setItem(`game-${gameId}-cardset`, JSON.stringify(resolved));
  }
  return resolved;
}

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

  // Update refs in an effect to avoid mutating during render
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
    reset,
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

  useEffect(() => {
    if (!gameId || !shouldConnect) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    const listeners = listenersRef.current;
    const connectionDelay = Math.random() * 1000;

    const connectTimer = setTimeout(() => {
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

      const userId = getUserId();

      const joinGame = () => {
        const gameCardSet = resolveCardSet(cardSetRef.current, gameId);
        newSocket.emit('join-game', {
          gameId,
          userId,
          username: displayNameRef.current,
          isSpectator: isSpectatorRef.current,
          cardSet: gameCardSet,
        });
      };

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
          if (serverCardSet) {
            setCardSet(serverCardSet);
          }
          const userVote = getVoteForUser(votes, joinedUserId);
          setSelectedVote(userVote ?? null);
        }
      );

      newSocket.on('connect', () => {
        console.log('Socket connected');
        if (displayNameRef.current) {
          joinGame();
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        joinGame();
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error.message);
      });

      newSocket.on('reconnect_failed', () => {
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
        reset();
        setUsers(users);
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
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `game-${gameId}-cardset`,
              JSON.stringify(updatedCardSet)
            );
          }
        }
      );
    }, connectionDelay);

    return () => {
      clearTimeout(connectTimer);
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
    reset,
  ]);

  useEffect(() => {
    if (!displayName || !socketRef.current?.connected) return;

    const userId = getUserId();
    const gameCardSet = resolveCardSet(cardSetRef.current, gameId);
    socketRef.current.emit('join-game', {
      gameId,
      userId,
      username: displayName,
      isSpectator: isSpectatorRef.current,
      cardSet: gameCardSet,
    });
  }, [gameId, displayName, isSpectator]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function emitVote(
  socket: Socket | null,
  gameId: string,
  userId: string,
  vote: string | null
) {
  if (socket) {
    socket.emit('vote', { gameId, userId, vote });
  }
}

export function emitReveal(socket: Socket | null, gameId: string) {
  if (socket) {
    socket.emit('reveal-votes', { gameId });
  }
}

export function emitReset(socket: Socket | null, gameId: string) {
  if (socket) {
    socket.emit('reset-votes', { gameId });
  }
}

export function emitThrowEmoji(
  socket: Socket | null,
  gameId: string,
  targetUserId: string,
  emoji: string
) {
  if (socket) {
    socket.emit('throw-emoji', { gameId, targetUserId, emoji });
  }
}

export function emitToggleRole(
  socket: Socket | null,
  gameId: string,
  userId: string
) {
  if (socket) {
    socket.emit('toggle-role', { gameId, userId });
  }
}

export function emitUserActive(
  socket: Socket | null,
  gameId: string,
  userId: string
) {
  if (socket) {
    socket.emit('user-active', { gameId, userId });
  }
}

export function emitHeartbeat(
  socket: Socket | null,
  gameId: string,
  userId: string
) {
  if (socket) {
    socket.emit('heartbeat', { gameId, userId });
  }
}
