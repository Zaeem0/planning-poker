import { GameControls } from '@/components/GameControls';
import { CreateGameButton } from '@/components/CreateGameButton';
import { CopyIcon, CheckIcon } from '@/components/icons';

interface GameHeaderProps {
  gameId: string;
  revealed: boolean;
  hasVotes: boolean;
  copied: boolean;
  onReveal: () => void;
  onReset: () => void;
  onCopyLink: () => void;
}

export function GameHeader({
  gameId,
  revealed,
  hasVotes,
  copied,
  onReveal,
  onReset,
  onCopyLink,
}: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="game-header-left">
        <CreateGameButton />
      </div>
      <h1 className="game-header-title">Planning Poker</h1>
      <div className="game-header-right">
        <GameControls
          revealed={revealed}
          onReveal={onReveal}
          onReset={onReset}
          hasVotes={hasVotes}
        />
        <button onClick={onCopyLink} className="game-id-badge">
          <span className="game-id-label">Game:</span>
          <span className="game-id-value">{gameId}</span>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </header>
  );
}
