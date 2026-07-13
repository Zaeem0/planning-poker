import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { emitVote, emitReveal, emitReset } from '@/lib/socket';

interface UseGameActionsParams {
  socket: Socket | null;
  gameId: string;
  userId: string;
  selectedVote: string | null;
  setSelectedVote: (vote: string | null) => void;
  revealed: boolean;
}

interface UseGameActionsResult {
  handleCardClick: (value: string) => void;
  handleKeyboardVote: (value: string) => void;
  handleKeyboardDeselect: () => void;
  handleReveal: () => void;
  handleReset: () => void;
}

export function useGameActions({
  socket,
  gameId,
  userId,
  selectedVote,
  setSelectedVote,
  revealed,
}: UseGameActionsParams): UseGameActionsResult {
  // Only apply the optimistic local selection when the vote can actually reach
  // the server (connected socket, round not revealed). Otherwise the local
  // state would diverge from the authoritative server state until resync.
  const handleCardClick = useCallback(
    (value: string) => {
      if (revealed || !socket?.connected || !userId) return;
      const newVote = selectedVote === value ? null : value;
      setSelectedVote(newVote);
      emitVote(socket, gameId, userId, newVote);
    },
    [socket, userId, gameId, selectedVote, setSelectedVote, revealed]
  );

  const handleKeyboardVote = useCallback(
    (value: string) => {
      if (revealed || !socket?.connected || !userId) return;
      setSelectedVote(value);
      emitVote(socket, gameId, userId, value);
    },
    [socket, userId, gameId, setSelectedVote, revealed]
  );

  const handleKeyboardDeselect = useCallback(() => {
    if (revealed || !socket?.connected || !userId) return;
    setSelectedVote(null);
    emitVote(socket, gameId, userId, null);
  }, [socket, userId, gameId, setSelectedVote, revealed]);

  const handleReveal = useCallback(() => {
    if (socket) emitReveal(socket, gameId);
  }, [socket, gameId]);

  const handleReset = useCallback(() => {
    if (socket) emitReset(socket, gameId);
  }, [socket, gameId]);

  return {
    handleCardClick,
    handleKeyboardVote,
    handleKeyboardDeselect,
    handleReveal,
    handleReset,
  };
}

