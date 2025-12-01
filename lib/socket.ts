import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "./store";

export function useSocket(
  gameId: string,
  customUsername?: string,
  shouldConnect: boolean = true
) {
  const socketRef = useRef<Socket | null>(null);
  const { setUserId, setUsername, setUsers, setVotes, setRevealed, reset } =
    useGameStore();

  useEffect(() => {
    if (!gameId || !shouldConnect) return;

    // Initialize socket connection
    // In production, NEXT_PUBLIC_SOCKET_URL should be set to your deployed URL
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    socketRef.current = io(socketUrl, {
      path: "/socket.io",
    });

    const socket = socketRef.current;

    // Join the game with optional custom username
    socket.emit("join-game", { gameId, username: customUsername });

    // Listen for user joined event
    socket.on("user-joined", ({ userId, username, users, votes, revealed }) => {
      setUserId(userId);
      setUsername(username);
      setUsers(users);
      setVotes(votes);
      setRevealed(revealed);
    });

    // Listen for user list updates
    socket.on("user-list-updated", ({ users }) => {
      setUsers(users);
    });

    // Listen for votes revealed
    socket.on("votes-revealed", ({ votes, revealed }) => {
      setVotes(votes);
      setRevealed(revealed);
    });

    // Listen for votes reset
    socket.on("votes-reset", ({ users }) => {
      reset();
      setUsers(users);
    });

    return () => {
      socket.disconnect();
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

  return socketRef.current;
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
