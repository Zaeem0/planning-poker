import { useState, useCallback } from 'react';
import { User, Vote } from '@/lib/store';
import { Socket } from 'socket.io-client';
import { emitThrowEmoji } from '@/lib/socket';
import { getVoteForUser } from '@/lib/vote-utils';
import { EmojiAnimation } from '@/lib/hooks/useEmojiAnimations';
import { VotingCards } from '@/components/VotingCards';
import { UserCard } from '@/components/UserCard';
import { RefreshIcon } from '@/components/icons';
import '@/styles/poker-table.scss';

interface PokerTableProps {
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentUserId: string;
  socket: Socket | null;
  gameId: string;
  selectedVote: string | null;
  onVote: (value: string) => void;
  onReveal: () => void;
  onReset: () => void;
  getAnimationsForUser: (userId: string) => EmojiAnimation[];
}

export function PokerTable({
  users,
  votes,
  revealed,
  currentUserId,
  socket,
  gameId,
  selectedVote,
  onVote,
  onReveal,
  onReset,
  getAnimationsForUser,
}: PokerTableProps) {
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const handleThrowEmoji = useCallback(
    (targetUserId: string, emoji: string) => {
      emitThrowEmoji(socket, gameId, targetUserId, emoji);
    },
    [socket, gameId]
  );

  const renderUserCard = (user: User) => {
    const vote = getVoteForUser(votes, user.id);
    const isCurrentUser = user.id === currentUserId;
    const isHovered = hoveredUserId === user.id;
    const userAnimations = getAnimationsForUser(user.id);

    return (
      <UserCard
        key={user.id}
        user={user}
        vote={vote}
        revealed={revealed}
        isCurrentUser={isCurrentUser}
        isHovered={isHovered}
        animations={userAnimations}
        onMouseEnter={() => !isCurrentUser && setHoveredUserId(user.id)}
        onMouseLeave={() => setHoveredUserId(null)}
        onThrowEmoji={(emoji) => handleThrowEmoji(user.id, emoji)}
      />
    );
  };

  const players = users.filter((u) => u.role === 'player');
  const currentUser = users.find((u) => u.id === currentUserId);
  const isCurrentUserSpectator = currentUser?.role === 'spectator';
  const votedCount = players.filter((u) => u.hasVoted).length;
  const allVoted = votedCount === players.length && players.length > 0;
  const showRevealButton = !revealed && allVoted;

  const getTableMessage = () => {
    if (revealed) return 'Votes revealed!';
    if (isCurrentUserSpectator) {
      if (votedCount === 0) return 'Watching the game';
      return `Watching the game - ${votedCount} of ${players.length} voted`;
    }
    if (votedCount === 0) return 'Pick your cards!';
    return `${votedCount} of ${players.length} voted`;
  };

  return (
    <div className="poker-table-container">
      <div className="table-players">{users.map(renderUserCard)}</div>

      <div className="table-message-container">
        <span className="table-message">
          {showRevealButton ? 'All voted! Ready to reveal' : getTableMessage()}
        </span>
        {showRevealButton && (
          <button
            className="table-message-reveal-button"
            onClick={onReveal}
            title="Reveal votes"
            aria-label="Reveal votes"
          >
            <RefreshIcon />
          </button>
        )}
        {revealed && (
          <button
            className="table-message-reveal-button"
            onClick={onReset}
            title="Start new round"
            aria-label="Start new round"
          >
            <RefreshIcon />
          </button>
        )}
      </div>

      <VotingCards
        votes={votes}
        revealed={revealed}
        selectedVote={selectedVote}
        onVote={onVote}
        isSpectator={isCurrentUserSpectator}
      />
    </div>
  );
}
