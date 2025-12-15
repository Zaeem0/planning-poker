import { Socket } from 'socket.io-client';
import { GameControls } from '@/components/GameControls';
import { CreateGameButton } from '@/components/CreateGameButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RoleToggle } from '@/components/RoleToggle';
import {
  CopyIcon,
  CheckIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from '@/components/icons';

interface GameHeaderProps {
  gameId: string;
  revealed: boolean;
  hasVotes: boolean;
  copied: boolean;
  isMuted: boolean;
  socket: Socket | null;
  userId: string;
  onReveal: () => void;
  onReset: () => void;
  onCopyLink: () => void;
  onToggleMute: () => void;
}

export function GameHeader({
  gameId,
  revealed,
  hasVotes,
  copied,
  isMuted,
  socket,
  userId,
  onReveal,
  onReset,
  onCopyLink,
  onToggleMute,
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
        <RoleToggle socket={socket} gameId={gameId} userId={userId} />
        <ThemeToggle />
        <button
          onClick={onToggleMute}
          className="mute-button"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeMuteIcon /> : <VolumeIcon />}
        </button>
        <button onClick={onCopyLink} className="game-id-badge">
          <span className="game-id-label">Game:</span>
          <span className="game-id-value">{gameId}</span>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </header>
  );
}
