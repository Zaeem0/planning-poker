'use client';

import { useRouter } from 'next/navigation';
import { generateGameId } from '@/lib/game-utils';

export function CreateGameButton() {
  const router = useRouter();

  const handleCreateGame = () => {
    const newGameId = generateGameId();
    router.push(`/game/${newGameId}`);
  };

  return (
    <button onClick={handleCreateGame} className="create-game-button">
      Create New Game
    </button>
  );
}
