import { useState, useCallback } from 'react';
import { User, Vote } from '@/lib/store';
import { Socket } from 'socket.io-client';
import { emitThrowEmoji } from '@/lib/socket';
import { getVoteForUser } from '@/lib/vote-utils';
import { EmojiAnimation } from '@/lib/hooks/useEmojiAnimations';
import { VotingCards } from '@/components/VotingCards';
import { UserCard } from '@/components/UserCard';
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

  const getTableMessage = () => {
    const votedCount = players.filter((u) => u.hasVoted).length;
    if (revealed) return 'Votes revealed!';
    if (votedCount === 0) return 'Pick your cards!';
    if (votedCount === players.length) return 'All voted! Ready to reveal';
    return `${votedCount} of ${players.length} voted`;
  };

  return (
    <div className="poker-table-container">
      <div className="table-players">{users.map(renderUserCard)}</div>

      <span className="table-message">{getTableMessage()}</span>

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
