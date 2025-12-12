import { useState, useCallback, useMemo } from 'react';
import { User, Vote } from '@/lib/store';
import { Socket } from 'socket.io-client';
import { emitThrowEmoji } from '@/lib/socket';
import { useEmojiAnimations } from '@/lib/hooks/useEmojiAnimations';
import { useConfetti } from '@/lib/hooks/useConfetti';
import { getVoteAnalysis } from '@/lib/vote-utils';
import { VotingCards } from '@/components/VotingCards';
import { ConfettiContainer } from '@/components/ConfettiContainer';
import { PlayerCard } from '@/components/PlayerCard';
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
}: PokerTableProps) {
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const { getAnimationsForUser } = useEmojiAnimations(socket);

  const confettiOrigin = useMemo(() => {
    if (!revealed || votes.length === 0) return { x: 50, y: 50 };

    const { isUnanimous, unanimousVote } = getVoteAnalysis(votes);

    if (isUnanimous && unanimousVote) {
      const cardElement = document.querySelector(
        `[data-card-size="${unanimousVote}"]`
      );
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect();
        const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
        const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
        return { x, y };
      }
    }

    return { x: 50, y: 50 };
  }, [revealed, votes]);

  const { particles } = useConfetti(votes, revealed, confettiOrigin);

  const handleThrowEmoji = useCallback(
    (targetUserId: string, emoji: string) => {
      emitThrowEmoji(socket, gameId, targetUserId, emoji);
    },
    [socket, gameId]
  );

  const getVoteForUser = (userId: string) =>
    votes.find((v) => v.userId === userId)?.vote;

  const renderUserCard = (user: User) => {
    const vote = getVoteForUser(user.id);
    const isCurrentUser = user.id === currentUserId;
    const isHovered = hoveredUserId === user.id;
    const userAnimations = getAnimationsForUser(user.id);

    return (
      <PlayerCard
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
    <>
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

      <ConfettiContainer particles={particles} />
    </>
  );
}
