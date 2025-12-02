'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/lib/store';
import { useSocket, emitVote, emitReveal, emitReset } from '@/lib/socket';
import { PokerTable } from '@/components/PokerTable';
import { JoinGameForm } from '@/components/JoinGameForm';
import { GameHeader } from '@/components/GameHeader';
import { VotingCards } from '@/components/VotingCards';
import { Toast } from '@/components/Toast';
import { Loader } from '@/components/Loader';
import '@/styles/game.scss';
import '@/styles/poker-table.scss';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [submittedName, setSubmittedName] = useState<string | undefined>(
    undefined
  );

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

  const socket = useSocket(gameId, submittedName, true);

  useEffect(() => {
    setGameId(gameId);
  }, [gameId, setGameId]);

  const handleJoin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSubmittedName(trimmedName);
  };

  const handleVote = useCallback(
    (value: string) => {
      setSelectedVote(value);
      if (socket && userId) {
        emitVote(socket, gameId, userId, value);
      }
    },
    [socket, userId, gameId, setSelectedVote]
  );

  useEffect(() => {
    if (!username || revealed) return;

    const isTypingInFormField = (target: HTMLElement) =>
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    const handleTwoCharacterVote = (firstKey: string) => {
      if (firstKey !== 'x') return;

      const waitForSecondKey = (e2: KeyboardEvent) => {
        const secondKey = e2.key.toLowerCase();
        if (secondKey === 's') handleVote('xs');
        else if (secondKey === 'l') handleVote('xl');
        window.removeEventListener('keydown', waitForSecondKey);
      };

      window.addEventListener('keydown', waitForSecondKey);
      setTimeout(
        () => window.removeEventListener('keydown', waitForSecondKey),
        1000
      );
    };

    const handleKeyboardVote = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const singleCharVotes = ['xs', 's', 'm', 'l', 'xl'];

      if (isTypingInFormField(e.target as HTMLElement)) return;
      if (e.key === '?') return handleVote('unknown');
      if (singleCharVotes.includes(key)) return handleVote(key);
      handleTwoCharacterVote(key);
    };

    window.addEventListener('keydown', handleKeyboardVote);
    return () => window.removeEventListener('keydown', handleKeyboardVote);
  }, [username, revealed, handleVote]);

  const handleReveal = () => {
    if (socket) emitReveal(socket, gameId);
  };

  const handleReset = () => {
    if (socket) emitReset(socket, gameId);
  };

  const handleCopyLink = async () => {
    const copyWithClipboardAPI = async () => {
      await navigator.clipboard.writeText(window.location.href);
    };

    const copyWithFallbackTextArea = () => {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    };

    try {
      const canUseClipboardAPI = navigator.clipboard && window.isSecureContext;
      if (canUseClipboardAPI) {
        await copyWithClipboardAPI();
      } else {
        copyWithFallbackTextArea();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
        onNameChange={setName}
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
          />
        </div>
      </div>

      <VotingCards
        votes={votes}
        revealed={revealed}
        selectedVote={selectedVote}
        onVote={handleVote}
      />

      {copied && <Toast message="Link copied to clipboard" />}
    </div>
  );
}
