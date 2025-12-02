'use client';

import { useRouter } from 'next/navigation';

export default function CreateGameButton() {
  const router = useRouter();

  const handleClick = () => {
    const newGameId = Math.random().toString(36).substring(2, 10);
    router.push(`/game/${newGameId}`);
  };

  return (
    <button onClick={handleClick} className="create-game-button">
      Create New Game
    </button>
  );
}
