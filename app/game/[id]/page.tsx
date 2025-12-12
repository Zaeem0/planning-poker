'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { useSocket } from '@/lib/socket';
import { useKeyboardVoting } from '@/lib/hooks/useKeyboardVoting';
import { useGameActions } from '@/lib/hooks/useGameActions';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import { PokerTable } from '@/components/PokerTable';
import { JoinGameForm } from '@/components/JoinGameForm';
import { GameHeader } from '@/components/GameHeader';
import { Toast } from '@/components/Toast';
import { Loader } from '@/components/Loader';
import '@/styles/game.scss';
import '@/styles/poker-table.scss';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [name, setName] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [submittedName, setSubmittedName] = useState<string | undefined>(
    undefined
  );
  const [submittedIsSpectator, setSubmittedIsSpectator] = useState<
    boolean | undefined
  >(undefined);

  const {
    userId,
    username,
    users,
    votes,
    revealed,
    selectedVote,
    setGameId,
    setSelectedVote,
  } = useGameStore();

  const socket = useSocket(gameId, submittedName, submittedIsSpectator, true);
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
    userId,
    selectedVote,
    setSelectedVote,
  });

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  const handleJoin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSubmittedName(trimmedName);
    setSubmittedIsSpectator(isSpectator);
  };

  const currentUser = users.find((u) => u.id === userId);
  const isCurrentUserSpectator = currentUser?.isSpectator ?? false;

  useKeyboardVoting({
    enabled: !!username && !revealed && !isCurrentUserSpectator,
    onVote: handleKeyboardVote,
    onDeselect: handleKeyboardDeselect,
  });

  if (!userId) {
    return <Loader />;
  }

  if (!username) {
    return (
      <JoinGameForm
        gameId={gameId}
        name={name}
        isSpectator={isSpectator}
        onNameChange={setName}
        onSpectatorChange={setIsSpectator}
        onSubmit={handleJoin}
      />
    );
  }

  const hasAnyVotes = users.some((u) => u.hasVoted);

  return (
    <div className="game-page">
      <div className="game-wrapper">
        <GameHeader
          gameId={gameId}
          revealed={revealed}
          hasVotes={hasAnyVotes}
          copied={copied}
          onReveal={handleReveal}
          onReset={handleReset}
          onCopyLink={handleCopyLink}
        />

        <div className="game-main-table">
          <PokerTable
            users={users}
            votes={votes}
            revealed={revealed}
            currentUserId={userId}
            socket={socket}
            gameId={gameId}
            selectedVote={selectedVote}
            onVote={handleCardClick}
          />
        </div>
      </div>

      {copied && <Toast message="Link copied to clipboard" />}
    </div>
  );
}
