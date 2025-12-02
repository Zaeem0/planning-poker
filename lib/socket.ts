import { useEffect, useRef, useSyncExternalStore } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from './store';

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

export function useSocket(
  gameId: string,
  customUsername?: string,
  isSpectator?: boolean,
  shouldConnect: boolean = true
) {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const {
    setUserId,
    setUsername,
    setUsers,
    setVotes,
    setRevealed,
    setSelectedVote,
    setGameCreatorUserId,
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
    const newSocket = io(socketUrl, {
      path: '/socket.io',
    });

    socketRef.current = newSocket;
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TEST_MODE) {
      window.__TEST_SOCKET__ = newSocket;
    }
    const listeners = listenersRef.current;
    listeners.forEach((listener) => listener());

    const userId = getUserId();

    const restoreUserVoteSelection = (
      votes: { userId: string; vote: string }[],
      joinedUserId: string
    ) => {
      const userVote = votes.find((v) => v.userId === joinedUserId);
      if (userVote) setSelectedVote(userVote.vote);
    };

    newSocket.on(
      'user-joined',
      ({
        userId: joinedUserId,
        username,
        users,
        votes,
        revealed,
        gameCreatorUserId,
      }) => {
        setUserId(joinedUserId);
        setUsername(username);
        setUsers(users);
        setVotes(votes);
        setRevealed(revealed);
        setGameCreatorUserId(gameCreatorUserId);
        restoreUserVoteSelection(votes, joinedUserId);
      }
    );

    newSocket.on('connect', () => {
      newSocket.emit('join-game', {
        gameId,
        userId,
        username: customUsername,
        isSpectator,
      });
    });

    newSocket.on('user-list-updated', ({ users, gameCreatorUserId }) => {
      setUsers(users);
      if (gameCreatorUserId !== undefined) {
        setGameCreatorUserId(gameCreatorUserId);
      }
    });

    newSocket.on('votes-revealed', ({ votes, revealed }) => {
      setVotes(votes);
      setRevealed(revealed);
    });

    newSocket.on('votes-reset', ({ users }) => {
      reset();
      setUsers(users);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TEST_MODE) {
        window.__TEST_SOCKET__ = null;
      }
      listeners.forEach((listener) => listener());
    };
  }, [
    gameId,
    customUsername,
    isSpectator,
    shouldConnect,
    setUserId,
    setUsername,
    setUsers,
    setVotes,
    setRevealed,
    setSelectedVote,
    setGameCreatorUserId,
    reset,
  ]);

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
