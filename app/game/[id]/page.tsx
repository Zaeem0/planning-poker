'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { useSocket, emitVote, emitReveal, emitReset } from '@/lib/socket';
import { useKeyboardVoting } from '@/lib/hooks/useKeyboardVoting';
import { PokerTable } from '@/components/PokerTable';
import { JoinGameForm } from '@/components/JoinGameForm';
import { GameHeader } from '@/components/GameHeader';
import { Toast } from '@/components/Toast';
import { Loader } from '@/components/Loader';
import { copyToClipboard } from '@/lib/clipboard';
import '@/styles/game.scss';
import '@/styles/poker-table.scss';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [copied, setCopied] = useState(false);
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
    gameCreatorUserId,
    setGameId,
    setSelectedVote,
  } = useGameStore();

  const socket = useSocket(gameId, submittedName, submittedIsSpectator, true);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  const handleJoin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSubmittedName(trimmedName);
    setSubmittedIsSpectator(isSpectator);
  };

  const handleCardClick = useCallback(
    (value: string) => {
      const newVote = selectedVote === value ? null : value;
      setSelectedVote(newVote);
      if (socket && userId) {
        emitVote(socket, gameId, userId, newVote);
      }
    },
    [socket, userId, gameId, selectedVote, setSelectedVote]
  );

  const handleKeyboardVote = useCallback(
    (value: string) => {
      setSelectedVote(value);
      if (socket && userId) {
        emitVote(socket, gameId, userId, value);
      }
    },
    [socket, userId, gameId, setSelectedVote]
  );

  const currentUser = users.find((u) => u.id === userId);
  const isCurrentUserSpectator = currentUser?.isSpectator ?? false;

  useKeyboardVoting({
    enabled: !!username && !revealed && !isCurrentUserSpectator,
    onVote: handleKeyboardVote,
  });

  const handleReveal = () => {
    if (socket) emitReveal(socket, gameId);
  };

  const handleReset = () => {
    if (socket) emitReset(socket, gameId);
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            gameCreatorUserId={gameCreatorUserId}
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
