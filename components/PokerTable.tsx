import { useState, useCallback } from 'react';
import { User, Vote } from '@/lib/store';
import { CARD_VALUES, THROW_EMOJIS, VoteSize } from '@/lib/constants';
import { Socket } from 'socket.io-client';
import { emitThrowEmoji } from '@/lib/socket';
import { useEmojiAnimations } from '@/lib/hooks/useEmojiAnimations';
import { VotingCards } from '@/components/VotingCards';
import '@/styles/poker-table.scss';

interface PokerTableProps {
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentUserId: string;
  gameCreatorUserId: string | null;
  socket: Socket | null;
  gameId: string;
  selectedVote: string | null;
  onVote: (value: string) => void;
}

export function PokerTable({
  users,
  votes,
  revealed,
  currentUserId,
  gameCreatorUserId,
  socket,
  gameId,
  selectedVote,
  onVote,
}: PokerTableProps) {
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const { getAnimationsForUser } = useEmojiAnimations(socket);

  const handleThrowEmoji = useCallback(
    (targetUserId: string, emoji: string) => {
      emitThrowEmoji(socket, gameId, targetUserId, emoji);
    },
    [socket, gameId]
  );

  const getVoteForUser = (userId: string) =>
    votes.find((v) => v.userId === userId)?.vote;

  const getVoteLabel = (voteValue: string) => {
    const card = CARD_VALUES.find((c) => c.value === voteValue);
    return card ? card.label : voteValue;
  };

  const renderUserCard = (user: User) => {
    const vote = getVoteForUser(user.id);
    const isCurrentUser = user.id === currentUserId;
    const isGameCreator = user.id === gameCreatorUserId;
    const hasVoted = user.hasVoted;
    const isHovered = hoveredUserId === user.id;
    const userAnimations = getAnimationsForUser(user.id);
    const isDisconnected = !user.connected;
    const isSpectator = user.isSpectator;

    return (
      <div
        key={user.id}
        className="table-player"
        onMouseEnter={() => !isCurrentUser && setHoveredUserId(user.id)}
        onMouseLeave={() => setHoveredUserId(null)}
      >
        <div
          className={`player-card ${hasVoted ? 'player-card-voted' : ''} ${
            revealed && vote ? 'player-card-revealed' : ''
          } ${isDisconnected ? 'player-card-disconnected' : ''} ${
            isSpectator ? 'player-card-spectator' : ''
          }`}
        >
          {isDisconnected ? (
            <div className="player-card-content">
              <span className="player-card-emoji">🔌</span>
            </div>
          ) : isSpectator ? (
            <div className="player-card-content">
              <span className="player-card-emoji">👁️</span>
            </div>
          ) : revealed && vote ? (
            <div className="player-card-content">
              <span className="player-card-emoji">{getVoteLabel(vote)}</span>
              {vote !== VoteSize.UNKNOWN && (
                <span className="player-card-size">{vote.toUpperCase()}</span>
              )}
            </div>
          ) : (
            <span className="player-card-back"></span>
          )}
          {userAnimations.map((anim) => (
            <span
              key={anim.id}
              className="emoji-projectile"
              style={
                {
                  animationDelay: `${anim.delay}s`,
                  '--start-x': `${anim.startX}px`,
                  '--start-y': `${anim.startY}px`,
                  '--impact-x': `${anim.impactX}px`,
                  '--impact-y': `${anim.impactY}px`,
                  '--bounce-x': `${anim.bounceX}px`,
                  '--bounce-y': `${anim.bounceY}px`,
                  '--rotation': `${anim.rotation}deg`,
                } as React.CSSProperties
              }
            >
              {anim.emoji}
            </span>
          ))}
        </div>
        {isHovered && !isCurrentUser && (
          <div className="emoji-picker">
            {THROW_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-picker-button"
                onClick={() => handleThrowEmoji(user.id, emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <span
          className={`player-name ${isDisconnected ? 'player-name-disconnected' : ''}`}
        >
          {isGameCreator && <span className="player-game-creator">👑</span>}
          {user.username}
          {isCurrentUser && <span className="player-you">(you)</span>}
          {isSpectator && <span className="player-spectator">(spectator)</span>}
        </span>
      </div>
    );
  };

  const voters = users.filter((u) => !u.isSpectator);
  const currentUser = users.find((u) => u.id === currentUserId);
  const isCurrentUserSpectator = currentUser?.isSpectator ?? false;

  const getTableMessage = () => {
    const votedCount = voters.filter((u) => u.hasVoted).length;
    if (revealed) return 'Votes revealed!';
    if (votedCount === 0) return 'Pick your cards!';
    if (votedCount === voters.length) return 'All voted! Ready to reveal';
    return `${votedCount} of ${voters.length} voted`;
  };

  return (
    <div className="poker-table-container">
      <div className="table-players">{users.map(renderUserCard)}</div>

      <span className="table-message">{getTableMessage()}</span>

      {!isCurrentUserSpectator && (
        <VotingCards
          votes={votes}
          revealed={revealed}
          selectedVote={selectedVote}
          onVote={onVote}
        />
      )}
    </div>
  );
}
