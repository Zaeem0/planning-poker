import { useState } from 'react';
import { User, useGameStore } from '@/lib/store';
import { getVoteLabel, CARD_VALUES } from '@/lib/constants';
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
  onEditName?: (newName: string) => void;
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
  onEditName,
}: UserCardProps) {
  const { hasVoted, connected: isConnected, role, displayName } = user;
  const { cardSet } = useGameStore();
  const cards = cardSet?.cards || CARD_VALUES;
  const isDisconnected = !isConnected;
  const isSpectator = role === 'spectator';
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayName);

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
      const isFibonacci = cardSet?.preset === 'fibonacci';
      const label = getVoteLabel(vote, cards);
      // Hide the size sublabel when it would duplicate the label already shown
      // as the "emoji" (e.g. numeric sets like Fibonacci where label === value).
      const showSize =
        vote !== 'unknown' &&
        vote !== '?' &&
        label.toUpperCase() !== vote.toUpperCase();
      return (
        <div className="player-card-content">
          <span
            className={`player-card-emoji ${isFibonacci ? 'player-card-emoji-text' : ''}`}
          >
            {label}
          </span>
          {showSize && (
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
        {isEditing ? (
          <form
            className="player-name-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = editValue.trim();
              if (trimmed && trimmed !== displayName) {
                onEditName?.(trimmed);
              }
              setIsEditing(false);
            }}
          >
            <input
              className="player-name-edit-input"
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                const trimmed = editValue.trim();
                if (trimmed && trimmed !== displayName) {
                  onEditName?.(trimmed);
                }
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditValue(displayName);
                  setIsEditing(false);
                }
              }}
              autoFocus
              aria-label="Edit your name"
            />
          </form>
        ) : isCurrentUser ? (
          <button
            className="player-name-editable"
            onClick={() => {
              setEditValue(displayName);
              setIsEditing(true);
            }}
            aria-label="Edit your name"
            title="Edit your name"
          >
            <span className="player-name-text">{displayName}</span>
            <span className="player-you">(you)</span>
          </button>
        ) : (
          displayName
        )}
        {isSpectator && <span className="player-spectator">(spectator)</span>}
      </span>
    </div>
  );
}
