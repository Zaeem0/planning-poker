'use client';

import { Socket } from 'socket.io-client';
import { emitToggleRole } from '@/lib/socket';
import { useGameStore } from '@/lib/store';

interface RoleToggleProps {
  socket: Socket | null;
  gameId: string;
  userId: string;
}

export function RoleToggle({ socket, gameId, userId }: RoleToggleProps) {
  const users = useGameStore((state) => state.users);
  const currentUser = users.find((u) => u.id === userId);
  const isSpectator = currentUser?.role === 'spectator';

  const handleToggle = () => {
    emitToggleRole(socket, gameId, userId);
  };

  return (
    <button
      onClick={handleToggle}
      className="role-toggle-button"
      aria-label={
        isSpectator ? 'Switch to player mode' : 'Switch to spectator mode'
      }
      title={isSpectator ? 'Switch to player mode' : 'Switch to spectator mode'}
    >
      {isSpectator ? '🎮' : '👁️'}
    </button>
  );
}

