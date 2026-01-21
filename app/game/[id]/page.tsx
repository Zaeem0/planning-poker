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

const getHasJoinedKey = (gameId: string) => `hasJoined-${gameId}`;

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [joinFormData, setJoinFormData] = useState<JoinFormData | null>(null);
  const [hasJoinedThisGame, setHasJoinedThisGame] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(getHasJoinedKey(gameId)) === 'true';
  });
  const [isCreatingGame, setIsCreatingGame] = useState<boolean | null>(null);

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
    setCardSet,
  } = useGameStore();

  const socket = useSocket(
    gameId,
    joinFormData?.displayName,
    joinFormData?.isSpectator,
    true,
    joinFormData?.cardSet
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

  // Check if game exists on mount using HTTP API
  useEffect(() => {
    let cancelled = false;

    const checkGameExists = async () => {
      try {
        const response = await fetch(`/api/game/${gameId}`);
        if (!cancelled && response.ok) {
          const data = await response.json();
          setIsCreatingGame(!data.exists);
        }
      } catch {
        if (!cancelled) {
          setIsCreatingGame(true);
        }
      }
    };

    checkGameExists();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

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

  // If user hasn't joined this game yet, wait for game check and show form
  if (!hasJoinedThisGame) {
    if (isCreatingGame === null) {
      return <Loader />;
    }
    return (
      <JoinGameForm
        gameId={gameId}
        onSubmit={(data) => {
          if (data.cardSet) {
            setCardSet(data.cardSet);
          }
          setJoinFormData(data);
          setHasJoinedThisGame(true);
          localStorage.setItem(getHasJoinedKey(gameId), 'true');
        }}
        initialName={currentUserName}
        isCreating={isCreatingGame}
      />
    );
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
            onReveal={handleReveal}
            onReset={handleReset}
            getAnimationsForUser={getAnimationsForUser}
          />
        </div>
      </div>

      <ConfettiContainer particles={particles} />
      {copied && <Toast message="Link copied to clipboard" />}
    </div>
  );
}
