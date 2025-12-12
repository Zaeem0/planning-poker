import { User } from '@/lib/store';
import { VoteSize, getVoteLabel } from '@/lib/constants';
import { EmojiAnimation } from '@/lib/hooks/useEmojiAnimations';
import { EmojiPicker } from '@/components/EmojiPicker';
import { EmojiProjectile } from '@/components/EmojiProjectile';

interface PlayerCardProps {
  user: User;
  vote: string | undefined;
  revealed: boolean;
  isCurrentUser: boolean;
  isHovered: boolean;
  animations: EmojiAnimation[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onThrowEmoji: (emoji: string) => void;
}

export function PlayerCard({
  user,
  vote,
  revealed,
  isCurrentUser,
  isHovered,
  animations,
  onMouseEnter,
  onMouseLeave,
  onThrowEmoji,
}: PlayerCardProps) {
  const { hasVoted, connected: isConnected, isSpectator, username } = user;
  const isDisconnected = !isConnected;

  const cardClassName = [
    'player-card',
    hasVoted && 'player-card-voted',
    revealed && vote && 'player-card-revealed',
    isDisconnected && 'player-card-disconnected',
    isSpectator && 'player-card-spectator',
  ]
    .filter(Boolean)
    .join(' ');

  const renderCardContent = () => {
    if (isDisconnected) {
      return (
        <div className="player-card-content">
          <span className="player-card-emoji">🔌</span>
        </div>
      );
    }

    if (isSpectator) {
      return (
        <div className="player-card-content">
          <span className="player-card-emoji">👁️</span>
        </div>
      );
    }

    if (revealed && vote) {
      return (
        <div className="player-card-content">
          <span className="player-card-emoji">{getVoteLabel(vote)}</span>
          {vote !== VoteSize.UNKNOWN && (
            <span className="player-card-size">{vote.toUpperCase()}</span>
          )}
        </div>
      );
    }

    return <span className="player-card-back"></span>;
  };

  const playerNameClassName = [
    'player-name',
    isDisconnected && 'player-name-disconnected',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="table-player"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={cardClassName}>
        {renderCardContent()}

        {animations.map((anim) => (
          <EmojiProjectile key={anim.id} animation={anim} />
        ))}
      </div>

      {isHovered && !isCurrentUser && (
        <EmojiPicker onSelectEmoji={onThrowEmoji} />
      )}

      <span className={playerNameClassName}>
        {username}
        {isCurrentUser && <span className="player-you">(you)</span>}
        {isSpectator && <span className="player-spectator">(spectator)</span>}
      </span>
    </div>
  );
}
