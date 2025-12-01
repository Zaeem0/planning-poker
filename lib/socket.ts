import { useEffect, useRef, useSyncExternalStore } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "./store";

export function useSocket(
  gameId: string,
  customUsername?: string,
  shouldConnect: boolean = true
) {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Set<() => void>>(new Set());
  const { setUserId, setUsername, setUsers, setVotes, setRevealed, reset } =
    useGameStore();

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

    // Initialize socket connection
    // In production, NEXT_PUBLIC_SOCKET_URL should be set to your deployed URL
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    const newSocket = io(socketUrl, {
      path: "/socket.io",
    });

    socketRef.current = newSocket;
    const listeners = listenersRef.current;
    listeners.forEach((listener) => listener());

    // Join the game with optional custom username
    newSocket.emit("join-game", { gameId, username: customUsername });

    // Listen for user joined event
    newSocket.on(
      "user-joined",
      ({ userId, username, users, votes, revealed }) => {
        setUserId(userId);
        setUsername(username);
        setUsers(users);
        setVotes(votes);
        setRevealed(revealed);
      }
    );

    // Listen for user list updates
    newSocket.on("user-list-updated", ({ users }) => {
      setUsers(users);
    });

    // Listen for votes revealed
    newSocket.on("votes-revealed", ({ votes, revealed }) => {
      setVotes(votes);
      setRevealed(revealed);
    });

    // Listen for votes reset
    newSocket.on("votes-reset", ({ users }) => {
      reset();
      setUsers(users);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      listeners.forEach((listener) => listener());
    };
  }, [
    gameId,
    customUsername,
    shouldConnect,
    setUserId,
    setUsername,
    setUsers,
    setVotes,
    setRevealed,
    reset,
  ]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function emitVote(
  socket: Socket | null,
  gameId: string,
  userId: string,
  vote: string
) {
  if (socket) {
    socket.emit("vote", { gameId, userId, vote });
  }
}

export function emitReveal(socket: Socket | null, gameId: string) {
  if (socket) {
    socket.emit("reveal-votes", { gameId });
  }
}

export function emitReset(socket: Socket | null, gameId: string) {
  if (socket) {
    socket.emit("reset-votes", { gameId });
  }
}

export function emitThrowEmoji(
  socket: Socket | null,
  gameId: string,
  targetUserId: string,
  emoji: string
) {
  if (socket) {
    socket.emit("throw-emoji", { gameId, targetUserId, emoji });
  }
}
