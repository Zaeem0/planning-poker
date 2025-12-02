import '@/styles/game-controls.scss';

interface GameControlsProps {
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
  hasVotes: boolean;
}

export default function GameControls({
  revealed,
  onReveal,
  onReset,
  hasVotes,
}: GameControlsProps) {
  return !revealed ? (
    <button onClick={onReveal} disabled={!hasVotes} className="reveal-button">
      Reveal Votes
    </button>
  ) : (
    <button onClick={onReset} className="reset-button">
      Start New Round
    </button>
  );
}
