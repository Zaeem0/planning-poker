import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { emitVote, emitReveal, emitReset } from '@/lib/socket';

interface UseGameActionsParams {
  socket: Socket | null;
  gameId: string;
  userId: string;
  selectedVote: string | null;
  setSelectedVote: (vote: string | null) => void;
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
}: UseGameActionsParams): UseGameActionsResult {
  const handleCardClick = useCallback(
    (value: string) => {
      const newVote = selectedVote === value ? null : value;
      setSelectedVote(newVote);
      if (socket && userId) {
        emitVote(socket, gameId, userId, newVote);
      }
    },
    [socket, userId, gameId, selectedVote, setSelectedVote]
  );

  const handleKeyboardVote = useCallback(
    (value: string) => {
      setSelectedVote(value);
      if (socket && userId) {
        emitVote(socket, gameId, userId, value);
      }
    },
    [socket, userId, gameId, setSelectedVote]
  );

  const handleKeyboardDeselect = useCallback(() => {
    setSelectedVote(null);
    if (socket && userId) {
      emitVote(socket, gameId, userId, null);
    }
  }, [socket, userId, gameId, setSelectedVote]);

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

