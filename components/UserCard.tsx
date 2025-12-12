import { User } from '@/lib/store';
import { VoteSize, getVoteLabel } from '@/lib/constants';
import { EmojiAnimation } from '@/lib/hooks/useEmojiAnimations';
import { EmojiPicker } from '@/components/EmojiPicker';
import { EmojiProjectile } from '@/components/EmojiProjectile';

interface UserCardProps {
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

function getCardClassName(
  hasVoted: boolean,
  revealed: boolean,
  vote: string | undefined,
  isDisconnected: boolean,
  isSpectator: boolean
): string {
  const classes = ['player-card'];

  if (hasVoted) classes.push('player-card-voted');
  if (revealed && vote) classes.push('player-card-revealed');
  if (isDisconnected) classes.push('player-card-disconnected');
  if (isSpectator) classes.push('player-card-spectator');

  return classes.filter(Boolean).join(' ');
}

function getPlayerNameClassName(isDisconnected: boolean): string {
  const classes = ['player-name'];

  if (isDisconnected) classes.push('player-name-disconnected');

  return classes.filter(Boolean).join(' ');
}

export function UserCard({
  user,
  vote,
  revealed,
  isCurrentUser,
  isHovered,
  animations,
  onMouseEnter,
  onMouseLeave,
  onThrowEmoji,
}: UserCardProps) {
  const { hasVoted, connected: isConnected, role, displayName } = user;
  const isDisconnected = !isConnected;
  const isSpectator = role === 'spectator';

  const cardClassName = getCardClassName(
    hasVoted,
    revealed,
    vote,
    isDisconnected,
    isSpectator
  );

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

  const playerNameClassName = getPlayerNameClassName(isDisconnected);

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
        {displayName}
        {isCurrentUser && <span className="player-you">(you)</span>}
        {isSpectator && <span className="player-spectator">(spectator)</span>}
      </span>
    </div>
  );
}
