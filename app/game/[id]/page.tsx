'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { useSocket } from '@/lib/socket';
import { useKeyboardVoting } from '@/lib/hooks/useKeyboardVoting';
import { useGameActions } from '@/lib/hooks/useGameActions';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import { useConfetti } from '@/lib/hooks/useConfetti';
import { useConfettiOrigin } from '@/lib/hooks/useConfettiOrigin';
import { useEmojiAnimations } from '@/lib/hooks/useEmojiAnimations';
import { useUnanimousChime } from '@/lib/hooks/useUnanimousChime';
import { usePageVisibility } from '@/lib/hooks/usePageVisibility';
import { useActivityHeartbeat } from '@/lib/hooks/useActivityHeartbeat';
import { PokerTable } from '@/components/PokerTable';
import { JoinGameForm, JoinFormData } from '@/components/JoinGameForm';
import { GameHeader } from '@/components/GameHeader';
import { ConfettiContainer } from '@/components/ConfettiContainer';
import { Toast } from '@/components/Toast';
import { Loader } from '@/components/Loader';
import '@/styles/game.scss';
import '@/styles/poker-table.scss';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [joinFormData, setJoinFormData] = useState<JoinFormData | null>(null);

  const {
    currentUserId,
    currentUserName,
    users,
    votes,
    revealed,
    selectedVote,
    isMuted,
    setGameId,
    setSelectedVote,
    setIsMuted,
  } = useGameStore();

  const socket = useSocket(
    gameId,
    joinFormData?.displayName,
    joinFormData?.isSpectator,
    true
  );
  const { copied, handleCopyLink } = useCopyToClipboard();

  const {
    handleCardClick,
    handleKeyboardVote,
    handleKeyboardDeselect,
    handleReveal,
    handleReset,
  } = useGameActions({
    socket,
    gameId,
    userId: currentUserId,
    selectedVote,
    setSelectedVote,
  });

  const confettiOrigin = useConfettiOrigin(votes, revealed);
  const { particles } = useConfetti(votes, revealed, confettiOrigin);
  const { getAnimationsForUser } = useEmojiAnimations(socket);
  useUnanimousChime(votes, revealed);

  // Connection stability hooks
  usePageVisibility({
    socket,
    gameId,
    userId: currentUserId,
    enabled: !!currentUserName,
  });

  useActivityHeartbeat({
    socket,
    gameId,
    userId: currentUserId,
    enabled: !!currentUserName,
    intervalMs: 30000, // Send heartbeat every 30 seconds
  });

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  const currentUser = users.find((u) => u.id === currentUserId);
  const isCurrentUserSpectator = currentUser?.role === 'spectator';

  useEffect(() => {
    if (isCurrentUserSpectator && selectedVote) {
      setSelectedVote(null);
    }
  }, [isCurrentUserSpectator, selectedVote, setSelectedVote]);

  useKeyboardVoting({
    enabled: !!currentUserName && !revealed && !isCurrentUserSpectator,
    onVote: handleKeyboardVote,
    onDeselect: handleKeyboardDeselect,
  });

  if (!currentUserId) {
    return <Loader />;
  }

  if (!currentUserName) {
    return <JoinGameForm gameId={gameId} onSubmit={setJoinFormData} />;
  }

  const hasAnyVotes = users.some((u) => u.hasVoted);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="game-page">
      <div className="game-wrapper">
        <GameHeader
          gameId={gameId}
          revealed={revealed}
          hasVotes={hasAnyVotes}
          copied={copied}
          isMuted={isMuted}
          socket={socket}
          userId={currentUserId}
          onReveal={handleReveal}
          onReset={handleReset}
          onCopyLink={handleCopyLink}
          onToggleMute={handleToggleMute}
        />

        <div className="game-main-table">
          <PokerTable
            users={users}
            votes={votes}
            revealed={revealed}
            currentUserId={currentUserId}
            socket={socket}
            gameId={gameId}
            selectedVote={selectedVote}
            onVote={handleCardClick}
            getAnimationsForUser={getAnimationsForUser}
          />
        </div>
      </div>

      <ConfettiContainer particles={particles} />
      {copied && <Toast message="Link copied to clipboard" />}
    </div>
  );
}
